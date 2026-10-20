import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/store/settings-store';

// Sons de l'app (assets/sounds, fabriqués par scripts/build-sounds.mjs) : plusieurs prises par geste, jamais la même deux fois de suite.
const SOURCES = {
  trait: [
    require('@/assets/sounds/trait-1.m4a'),
    require('@/assets/sounds/trait-2.m4a'),
    require('@/assets/sounds/trait-3.m4a'),
    require('@/assets/sounds/trait-4.m4a'),
    require('@/assets/sounds/trait-5.m4a'),
  ],
  feuille: [require('@/assets/sounds/feuille-1.m4a'), require('@/assets/sounds/feuille-2.m4a')],
  tampon: [require('@/assets/sounds/tampon-1.m4a'), require('@/assets/sounds/tampon-2.m4a')],
  palier: [require('@/assets/sounds/palier.m4a')],
  festif: [require('@/assets/sounds/festif.m4a')],
};
export type SoundName = keyof typeof SOURCES;

// Discrets : un cahier, pas une salle de jeux.
const VOLUME: Record<SoundName, number> = { trait: 0.12, feuille: 0.05, tampon: 0.2, palier: 0.14, festif: 0.12 };
const BROUHAHA = require('@/assets/sounds/brouhaha.m4a');
// Des voix qui parlent, plus une rumeur : assez fort pour sentir la salle, sous les sons des gestes.
const BROUHAHA_VOLUME = 0.04;
// Vote posé : la salle se tait doucement.
const QUIET_MS = 1500;

const players = new Map<number, AudioPlayer>();
const last: Partial<Record<SoundName, number>> = {};
let current: AudioPlayer | null = null;
let ready = false;

// Web : un navigateur refuse tout son avant le premier toucher ; on attend donc ce toucher.
let unlocked = Platform.OS !== 'web';
if (!unlocked && typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      unlocked = true;
    },
    { once: true, capture: true },
  );
}

const enabled = () => unlocked && useSettingsStore.getState().sons;

// Mode silencieux respecté sur iOS ; les sons se mêlent à la musique de la personne sans la couper.
function setup() {
  if (!ready) {
    ready = true;
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }
}

function playerOf(source: number) {
  let player = players.get(source);
  if (!player) {
    player = createAudioPlayer(source);
    players.set(source, player);
  }
  return player;
}

/** Un son ponctuel ; le précédent s'arrête : jamais deux à la fois. */
export function playSound(name: SoundName) {
  if (!enabled()) {
    return;
  }
  setup();
  const list = SOURCES[name];
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === last[name]) {
    i = (i + 1) % list.length;
  }
  last[name] = i;
  const player = playerOf(list[i]);
  if (current && current !== player) {
    current.pause();
  }
  current = player;
  player.volume = VOLUME[name];
  player
    .seekTo(0)
    .then(() => player.play())
    .catch(() => {});
}

export type BuzzKind = 'selection' | 'light' | 'success' | 'warning';

// Android : les retours du système (sans moteur de vibration simulé), comme sur iOS.
const ANDROID_HAPTICS: Record<BuzzKind, Haptics.AndroidHaptics> = {
  selection: Haptics.AndroidHaptics.Segment_Tick,
  light: Haptics.AndroidHaptics.Context_Click,
  success: Haptics.AndroidHaptics.Confirm,
  warning: Haptics.AndroidHaptics.Reject,
};

function iosHaptic(kind: BuzzKind) {
  switch (kind) {
    case 'selection':
      return Haptics.selectionAsync();
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'warning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}

/** Vibration d'un geste qui compte (onglet, vote, partage, bilan), coupée avec les sons. Jamais au défilement. */
export function buzz(kind: BuzzKind) {
  if (!enabled() || Platform.OS === 'web') {
    return;
  }
  const done = Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(ANDROID_HAPTICS[kind]) : iosHaptic(kind);
  done.catch(() => {});
}

// Brouhaha : deux lecteurs se relaient en fondu enchaîné, la boucle n'a jamais de raccord audible.
const CROSSFADE_S = 2;
const TICK_MS = 50;
const crowd = {
  decks: [] as AudioPlayer[],
  active: 0,
  /** Niveau général (0 à BROUHAHA_VOLUME), qui glisse vers `target` de `step` par tick. */
  level: 0,
  target: 0,
  step: 0,
  /** Début du relais en cours (ms), ou null. */
  relay: null as number | null,
  timer: null as ReturnType<typeof setInterval> | null,
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));

function crowdTick() {
  const [now, next] = [crowd.decks[crowd.active], crowd.decks[1 - crowd.active]];
  crowd.level = crowd.level < crowd.target ? Math.min(crowd.target, crowd.level + crowd.step) : Math.max(crowd.target, crowd.level - crowd.step);
  // Avant la fin du lecteur, l'autre repart du début et prend le relais en fondu.
  if (crowd.relay === null && now.duration > CROSSFADE_S * 2 && now.currentTime >= now.duration - CROSSFADE_S) {
    crowd.relay = Date.now();
    next.volume = 0;
    next.seekTo(0).catch(() => {});
    next.play();
  }
  const c = crowd.relay === null ? 0 : clamp((Date.now() - crowd.relay) / (CROSSFADE_S * 1000));
  // Fondu à puissance constante : la rumeur ne creuse pas au milieu du relais.
  now.volume = clamp(crowd.level * Math.cos((c * Math.PI) / 2));
  next.volume = crowd.relay === null ? 0 : clamp(crowd.level * Math.sin((c * Math.PI) / 2));
  if (c >= 1) {
    now.pause();
    crowd.active = 1 - crowd.active;
    crowd.relay = null;
  }
  if (crowd.level === 0 && crowd.target === 0) {
    crowd.decks.forEach((d) => d.pause());
    crowd.relay = null;
    clearInterval(crowd.timer!);
    crowd.timer = null;
  }
}

// Le brouhaha monte ou descend vers `target` en `ms`, sans à-coup.
function crowdTo(target: number, ms: number) {
  if (crowd.decks.length === 0) {
    crowd.decks = [createAudioPlayer(BROUHAHA), createAudioPlayer(BROUHAHA)];
    // Filet de sécurité : sans durée connue, pas de relais, mais le lecteur boucle seul.
    crowd.decks.forEach((d) => (d.loop = true));
  }
  crowd.target = target;
  crowd.step = Math.max(Math.abs(target - crowd.level), 1e-6) / Math.max(1, ms / TICK_MS);
  if (target > 0 && !crowd.timer) {
    crowd.decks[crowd.active].play();
  }
  crowd.timer ??= setInterval(crowdTick, TICK_MS);
}

/** La rumeur de l'hémicycle pendant un scrutin : monte avec la salle, s'éteint en fondu une fois le vote posé. */
export function useBrouhaha(quiet: boolean) {
  const sons = useSettingsStore((s) => s.sons);
  useEffect(() => {
    if (!sons || !unlocked) {
      return;
    }
    setup();
    // La rumeur monte au rythme de la salle qui se remplit (CROWD_APPEAR_MS).
    crowdTo(quiet ? 0 : BROUHAHA_VOLUME, quiet ? QUIET_MS : 1400);
    return () => crowdTo(0, 400);
  }, [sons, quiet]);
}
