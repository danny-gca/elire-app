// Fabrique les sons de l'app (assets/sounds/*.m4a) avec ffmpeg, à partir de bruit filtré, de sinus et de voix synthétiques (formants) : aucun enregistrement tiers.
// Usage : node scripts/build-sounds.mjs (ffmpeg requis). Remplaçables par des prises maison du même nom (voir assets/sounds/CREDITS.md).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIR = path.resolve(import.meta.dirname, '..', 'assets', 'sounds');
fs.mkdirSync(DIR, { recursive: true });

// Feutre sur tableau blanc : un petit couinement qui monte (sinus glissant et ses harmoniques, frottement), un filet de souffle.
const trait = (d, f0, f1, seed) => {
  const ph = `(${f0}*t+${((f1 - f0) / (2 * d)).toFixed(1)}*t*t)`;
  return (
    `aevalsrc=exprs='0.5*sin(2*PI*${ph})+0.2*sin(4*PI*${ph})+0.08*sin(6*PI*${ph})':d=${d}:s=44100,tremolo=f=38:d=0.35[sq${seed}];` +
    `anoisesrc=color=pink:duration=${d}:seed=${seed}:r=44100,highpass=f=2200,lowpass=f=6000,volume=0.3[hs${seed}];` +
    `[sq${seed}][hs${seed}]amix=inputs=2:normalize=0,afade=t=in:d=0.025:curve=qsin,afade=t=out:st=${(d * 0.45).toFixed(2)}:d=${(d * 0.55).toFixed(2)}:curve=qsin,volume=0.25`
  );
};

// Gerbe de traits de feutre décalés, de plus en plus aigus : [durée, fréquence de départ, d'arrivée, graine, retard en ms].
const gerbe = (traits) =>
  traits
    .map(([d, f0, f1, seed, delay], i) => `${trait(d, f0, f1, seed)},adelay=${delay}:all=1[p${i}];`)
    .join('')
    .concat(`${traits.map((_, i) => `[p${i}]`).join('')}amix=inputs=${traits.length}:normalize=0`);

const SOUNDS = {
  'trait-1': trait(0.16, 1050, 1450, 1),
  'trait-2': trait(0.2, 1200, 1600, 2),
  'trait-3': trait(0.14, 980, 1320, 3),
  'trait-4': trait(0.22, 1120, 1550, 4),
  'trait-5': trait(0.18, 1250, 1680, 5),
  // Tampon : coup sourd sur la table, et le claquement du caoutchouc.
  'tampon-1':
    'sine=f=95:duration=0.22,afade=t=out:st=0.02:d=0.2,volume=1.8[a];anoisesrc=color=pink:duration=0.08:seed=31,lowpass=f=1400,afade=t=out:st=0.01:d=0.07,volume=1.2[b];[a][b]amix=inputs=2:normalize=0',
  'tampon-2':
    'sine=f=80:duration=0.24,afade=t=out:st=0.02:d=0.22,volume=1.8[a];anoisesrc=color=pink:duration=0.09:seed=32,lowpass=f=1200,afade=t=out:st=0.01:d=0.08,volume=1.2[b];[a][b]amix=inputs=2:normalize=0',
  // Palier : une gerbe de traits de feutre, de plus en plus aigus, comme les traits qui jaillissent à l'écran.
  palier: gerbe([
    [0.12, 1000, 1350, 41, 0],
    [0.12, 1150, 1500, 42, 80],
    [0.13, 1300, 1700, 43, 160],
    [0.14, 1450, 1900, 44, 250],
    [0.18, 1600, 2150, 45, 350],
  ]),
  // Fête légère (vote modifié, image partagée) : trois coups de feutre distincts, de plus en plus aigus, à peine liés.
  festif: gerbe([
    [0.12, 1100, 1450, 46, 0],
    [0.12, 1250, 1650, 47, 160],
    [0.14, 1400, 1850, 48, 320],
  ]),
};

// Écrit des échantillons en WAV (crête à `level`), puis les encode en m4a avec un dernier filtre ffmpeg.
function encode(name, samples, rate, level, filter, bitrate = '64k') {
  const peak = samples.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  const pcm = Buffer.alloc(44 + samples.length * 2);
  pcm.write('RIFF', 0);
  pcm.writeUInt32LE(36 + samples.length * 2, 4);
  pcm.write('WAVEfmt ', 8);
  pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(rate, 24);
  pcm.writeUInt32LE(rate * 2, 28);
  pcm.writeUInt16LE(2, 32);
  pcm.writeUInt16LE(16, 34);
  pcm.write('data', 36);
  pcm.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((x, i) => pcm.writeInt16LE(Math.round((x / peak) * level * 32767), 44 + i * 2));
  const wav = path.join(os.tmpdir(), `elire-${path.basename(name)}.wav`);
  fs.writeFileSync(wav, pcm);
  const out = path.join(DIR, `${name}.m4a`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-af', filter, '-ar', '44100', '-c:a', 'aac', '-b:a', bitrate, out]);
  fs.rmSync(wav);
  console.log(`✅ ${name} (${(fs.statSync(out).size / 1024).toFixed(1)} Ko)`);
}

// Voix et brouhaha : des voix qui « parlent » (« Blablabla bababa babababa BAH baba ! »), chacune avec son timbre et son débit,
// puis superposées dans la salle. Chaque voix est aussi exportée seule (assets/sounds/voix/) pour l'écouter.
const RATE = 22050;
const LOOP_S = 16;
let seed = 61;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const between = (a, b) => a + rand() * (b - a);

// Passe-bande à gain constant (biquad RBJ), dont la fréquence peut glisser sans couper le son.
function resonator(rate = RATE) {
  let [b0, b2, a1, a2, x1, x2, y1, y2] = [0, 0, 0, 0, 0, 0, 0, 0];
  const filter = (x) => {
    const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
  filter.tune = (freq, bw) => {
    const w = (2 * Math.PI * freq) / rate;
    const alpha = Math.sin(w) / (2 * (freq / bw));
    const a0 = 1 + alpha;
    [b0, b2, a1, a2] = [alpha / a0, -alpha / a0, (-2 * Math.cos(w)) / a0, (1 - alpha) / a0];
  };
  return filter;
}

// Résonateur de Klatt (gain 1 en continu) : en cascade, les quatre donnent une voyelle naturelle sans régler les niveaux à la main.
function klatt() {
  let [a, b, c, y1, y2] = [1, 0, 0, 0, 0];
  const filter = (x) => {
    const y = a * x + b * y1 + c * y2;
    y2 = y1;
    y1 = y;
    return y;
  };
  filter.tune = (freq, bw) => {
    const r = Math.exp((-Math.PI * bw) / RATE);
    c = -r * r;
    b = 2 * r * Math.cos((2 * Math.PI * freq) / RATE);
    a = 1 - b - c;
  };
  return filter;
}

// Formants d'une voix d'homme (F1 à F4, Hz) et leurs largeurs ; chaque voix les met à l'échelle de son conduit vocal.
const PHONES = {
  a: { f: [700, 1300, 2600, 3500], bw: [90, 100, 140, 220] },
  o: { f: [460, 860, 2450, 3400], bw: [80, 90, 140, 220] },
  i: { f: [290, 2250, 2950, 3600], bw: [60, 100, 150, 220] },
  u: { f: [290, 1800, 2200, 3300], bw: [60, 100, 150, 220] },
  ou: { f: [310, 760, 2300, 3300], bw: [60, 90, 140, 220] },
  é: { f: [400, 2050, 2650, 3500], bw: [70, 100, 150, 220] },
  è: { f: [560, 1850, 2550, 3500], bw: [80, 100, 150, 220] },
  e: { f: [480, 1450, 2450, 3400], bw: [80, 100, 140, 220] },
  eu: { f: [400, 1500, 2300, 3400], bw: [70, 100, 140, 220] },
  l: { f: [360, 1200, 2700, 3400], bw: [90, 120, 180, 250] },
  m: { f: [270, 1050, 2300, 3300], bw: [140, 300, 350, 400] },
  n: { f: [270, 1500, 2500, 3300], bw: [140, 300, 350, 400] },
  // Lieux d'articulation : d'où partent les formants à l'ouverture (lèvres, dents) ; le voile du palais suit la voyelle.
  labial: { f: [220, 850, 2200, 3300], bw: [100, 120, 180, 250] },
  dental: { f: [250, 1750, 2650, 3400], bw: [100, 120, 180, 250] },
};
// Consonnes : lieu, voisement, fréquence du bruit (explosion ou friction), souffle après l'explosion des sourdes.
const CONSONANTS = {
  b: { place: 'labial', voiced: true, burst: 1000 },
  p: { place: 'labial', voiced: false, burst: 1100, asp: 0.025 },
  d: { place: 'dental', voiced: true, burst: 3600 },
  t: { place: 'dental', voiced: false, burst: 4000, asp: 0.03 },
  g: { place: 'velar', voiced: true, burst: 2000 },
  k: { place: 'velar', voiced: false, burst: 2200, asp: 0.035 },
  v: { place: 'labial', voiced: true, fric: 4500 },
  f: { place: 'labial', voiced: false, fric: 5500 },
  m: { nasal: 'm' },
  n: { nasal: 'n' },
  l: { liquid: true },
};
// Attaques et voyelles tirées au hasard, avec leurs poids : « bla », « po », « pi », « lu », « vo », « ta », « keu »…
const ONSETS = { b: 9, p: 9, l: 9, m: 7, d: 6, t: 6, v: 6, k: 5, n: 5, f: 3, g: 3, bl: 4, pl: 3, '': 3 };
const VOWELS = { a: 22, o: 12, i: 11, é: 10, ou: 8, è: 8, e: 8, u: 7, eu: 6 };
function weighted(table) {
  const entries = Object.entries(table);
  let r = rand() * entries.reduce((n, [, w]) => n + w, 0);
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) {
      return key;
    }
  }
  return entries[0][0];
}
const ONSET_LETTERS = { bl: ['b', 'l'], pl: ['p', 'l'], '': [] };
const randomSyllable = () => {
  const onset = weighted(ONSETS);
  return { onset: ONSET_LETTERS[onset] ?? [onset], vowel: weighted(VOWELS) };
};

// Une voyelle n'est jamais deux fois la même : F1 et F2 bougent de quelques pour cent.
const varied = (shape) => ({ f: shape.f.map((f, j) => (j < 2 ? f * between(0.94, 1.06) : f)), bw: shape.bw });
// Le voile du palais (k, g) se place près de la voyelle qui suit.
const velar = (vowel) => {
  const f2 = Math.min(2300, Math.max(1300, PHONES[vowel].f[1] * 1.05 + 200));
  return { f: [250, f2, f2 + 300, 3400], bw: [100, 120, 180, 250] };
};

// Une syllabe : consonnes d'attaque puis la voyelle, qui glisse de la hauteur `p0` à `p1`.
function syllable({ onset, vowel }, len, amp, p0, p1) {
  const segs = [];
  for (const c of onset) {
    const k = CONSONANTS[c];
    const shape = k.place === 'velar' ? velar(vowel) : PHONES[k.place ?? k.nasal ?? 'l'];
    if (k.burst) {
      // Occlusion (une sourde vibration pour les voisées), explosion, puis souffle pour les sourdes.
      segs.push({ shape, dur: between(0.03, 0.055), av: k.voiced ? 0.1 : 0, p0, p1: p0 });
      segs.push({ shape, dur: between(0.007, 0.012), av: k.voiced ? 0.25 : 0, an: 0.5 * amp, burst: k.burst * between(0.85, 1.15), p0, p1: p0 });
      if (k.asp) {
        segs.push({ shape, dur: k.asp * between(0.7, 1.3), av: 0, an: 0.18, burst: 1500, p0, p1: p0 });
      }
    } else if (k.fric) {
      // Friction continue entre les lèvres et les dents, voisée pour v.
      segs.push({ shape, dur: between(0.06, 0.09), av: k.voiced ? 0.35 : 0, an: k.voiced ? 0.12 : 0.22, burst: k.fric, steady: true, p0, p1: p0 });
    } else {
      segs.push({ shape, dur: between(0.045, 0.075), av: k.nasal ? 0.45 : 0.7, p0, p1: p0 });
    }
  }
  segs.push({ shape: varied(PHONES[vowel]), dur: len, av: amp, p0, p1, vowel: true });
  return segs;
}

// Une phrase : affirmation, question ou exclamation. L'intonation descend au fil de la phrase, monte en fin de groupe
// (comme en français), puis tombe, monte ou s'exclame à la fin ; parfois un « euh », une pause, un mot appuyé.
function phrase(p) {
  const kind = weighted({ affirmation: 5, question: 2, exclamation: 3 });
  const words = Array.from({ length: Math.floor(between(2, 7)) }, () => {
    const n = Number(weighted({ 1: 3, 2: 3.5, 3: 2.5, 4: 1 }));
    // Une fois sur trois, la même syllabe répétée : « papapa », « blablabla ».
    const first = randomSyllable();
    return Array.from({ length: n }, () => (rand() < 0.35 ? first : randomSyllable()));
  });
  const count = words.reduce((n, w) => n + w.length, 0);
  const tempo = between(0.85, 1.15);
  const base = 1 / (p.rate * tempo);
  const segs = [];
  if (rand() < 0.12) {
    segs.push(...syllable({ onset: [], vowel: 'eu' }, between(0.22, 0.38), 0.7, 1, 0.9));
    segs.push({ shape: PHONES.e, dur: between(0.08, 0.2), av: 0, p0: 1, p1: 1 });
  }
  let k = 0;
  let pitch = 1.05;
  words.forEach((word, w) => {
    const last = w === words.length - 1;
    word.forEach((syl, i) => {
      const decl = 1.08 - 0.18 * (k++ / count);
      const end = i === word.length - 1;
      const stressed = rand() < 0.15;
      let target = decl * (1 + between(-0.05, 0.05) * p.expr * 4) * (stressed ? 1 + p.expr * 0.6 : 1);
      let len = base * between(0.65, 1.45) * (stressed ? 1.3 : 1);
      let amp = between(0.75, 1.15) * (stressed ? 1.25 : 1);
      if (end && !last) {
        // Montée de continuation : le groupe n'est pas fini.
        target *= 1 + between(0.05, 0.13) * (p.expr * 3);
      }
      if (end && last) {
        len *= 1.7;
        if (kind === 'question') {
          segs.push(...syllable(syl, len, amp, target, target * (1 + 0.9 * p.expr + 0.1)));
          return;
        }
        const peak = kind === 'exclamation' ? 1 + 0.8 * p.expr : 1;
        amp *= kind === 'exclamation' ? 1.3 : 0.85;
        segs.push(...syllable(syl, len, amp, target * peak, target * (kind === 'exclamation' ? 0.95 : 0.8)));
        return;
      }
      // La hauteur glisse de la syllabe précédente vers la suivante, jamais en paliers.
      segs.push(...syllable(syl, len, amp, (pitch + target) / 2, target));
      pitch = target;
    });
    // Entre deux mots, parfois rien (la parole est liée), parfois une vraie pause.
    const gap = rand() < 0.35 ? 0.005 : rand() < 0.1 ? between(0.2, 0.35) : between(0.03, 0.14);
    segs.push({ shape: PHONES.e, dur: gap, av: 0, p0: pitch, p1: pitch });
  });
  // Le souffle qui finit la phrase.
  segs.push({ shape: PHONES.a, dur: 0.06, av: 0, an: 0.08, burst: 1200, p0: 0.9, p1: 0.9 });
  return segs;
}

const CTRL = 16;
const ease = (tau) => 1 - Math.exp(-CTRL / (RATE * tau));

// Synthèse : onde glottale (Rosenberg) dont l'ouverture et la brillance suivent le volume, quatre formants en cascade
// propres à chaque voix, souffle, explosions et frictions en parallèle, hauteur qui dérive lentement.
function render(segs, p) {
  const total = Math.floor(segs.reduce((n, s) => n + s.dur, 0) * RATE);
  const out = new Float32Array(total);
  const tract = [klatt(), klatt(), klatt(), klatt()];
  const noiseFilter = resonator();
  const freqs = segs[0].shape.f.map((f, j) => f * p.fscale[j]);
  const bws = [...segs[0].shape.bw];
  let [f0, av, phase, flowPrev, jitter, shimmer, drift, tilt] = [p.f0, 0, 0, 0, 0, 1, 0, 0];
  let t = 0;
  let prevBurst = false;
  for (const seg of segs) {
    const len = Math.floor(seg.dur * RATE);
    // Après une explosion, les formants filent vers la voyelle : c'est ce glissement qui fait entendre « ba », « da », « ka ».
    const kf = ease(prevBurst ? 0.012 : 0.02);
    if (seg.burst) {
      noiseFilter.tune(seg.burst, seg.burst * (seg.steady ? 0.6 : 0.8));
    }
    for (let i = 0; i < len && t < total; i++, t++) {
      const u = i / len;
      if (i % CTRL === 0) {
        for (let j = 0; j < 4; j++) {
          freqs[j] += (seg.shape.f[j] * p.fscale[j] - freqs[j]) * kf;
          bws[j] += (seg.shape.bw[j] - bws[j]) * kf;
          tract[j].tune(freqs[j], bws[j]);
        }
        // Une voix ne tient jamais sa note : petite dérive lente, plus marquée chez les voix rugueuses.
        drift += (rand() - 0.5) * 0.008 * p.rough - drift * 0.003;
        const target = p.f0 * (seg.p0 + (seg.p1 - seg.p0) * u) * (1 + drift);
        f0 += (target - f0) * ease(0.025);
        // La voyelle s'affaiblit un peu en se tenant.
        av += (seg.av * (seg.vowel ? 1 - 0.25 * u : 1) - av) * ease(0.006);
      }
      phase += (f0 * (1 + jitter)) / RATE;
      if (phase >= 1) {
        // Chaque période un peu différente : une voix humaine n'est jamais stable.
        phase -= 1;
        jitter = (rand() - 0.5) * 0.025 * p.rough;
        shimmer = 1 + (rand() - 0.5) * 0.15 * p.rough;
      }
      // Voix douce : glotte plus ouverte, plus de souffle ; voix forte : fermeture nette, plus d'aigus.
      const open = 0.45 + 0.25 * (1 - Math.min(1, av)) + p.breath;
      const [tp, tn] = [open * 0.72, open * 0.28];
      const flow = phase < tp ? 0.5 * (1 - Math.cos((Math.PI * phase) / tp)) : phase < tp + tn ? Math.cos((Math.PI * (phase - tp)) / (2 * tn)) : 0;
      const glottis = ((flow - flowPrev) * RATE) / f0;
      flowPrev = flow;
      tilt += (0.18 + 0.35 * Math.min(1, av) * p.bright) * (glottis - tilt);
      const breath = (rand() * 2 - 1) * (p.breath + 0.03) * (0.3 + flow);
      let x = av * shimmer * (tilt * 0.4 + breath);
      for (const f of tract) {
        x = f(x);
      }
      if (seg.an) {
        const shape = seg.steady ? Math.sin(Math.PI * u) : Math.exp(-3 * u);
        x += noiseFilter((rand() * 2 - 1) * seg.an * shape);
      }
      out[t] = x;
    }
    prevBurst = !!seg.burst && !seg.steady;
  }
  return out;
}

// Une voix qui enchaîne ses phrases sur `total` échantillons, séparées de pauses.
function speak(p, total, pause) {
  const out = new Float32Array(total);
  let t = Math.floor(between(0, pause[1]) * RATE);
  while (t < total) {
    const said = render(phrase(p), p);
    for (let i = 0; i < said.length && t + i < total; i++) {
      out[t + i] = said[i];
    }
    t += said.length + Math.floor(between(pause[0], pause[1]) * RATE);
  }
  // Même niveau pour toutes : c'est la distance qui décide qui domine.
  const rms = Math.sqrt(out.reduce((n, x) => n + x * x, 0) / total) || 1;
  return out.map((x) => (x / rms) * 0.1);
}

// Huit voix : hauteur, longueur du conduit vocal, débit, expressivité, souffle, rugosité, brillance.
const VOICES = [
  { f0: 100, tract: 1.0, rate: 4.5, expr: 0.15, breath: 0.06, rough: 1, bright: 0.8 },
  { f0: 210, tract: 1.17, rate: 6.5, expr: 0.3, breath: 0.1, rough: 0.8, bright: 1 },
  { f0: 135, tract: 1.03, rate: 6, expr: 0.35, breath: 0.05, rough: 1.2, bright: 1.1 },
  { f0: 175, tract: 1.12, rate: 5, expr: 0.2, breath: 0.12, rough: 0.9, bright: 0.7 },
  { f0: 110, tract: 0.97, rate: 3.8, expr: 0.12, breath: 0.15, rough: 1.6, bright: 0.6 },
  { f0: 235, tract: 1.2, rate: 7, expr: 0.25, breath: 0.08, rough: 0.7, bright: 1.2 },
  { f0: 120, tract: 1.02, rate: 5.5, expr: 0.22, breath: 0.07, rough: 1, bright: 0.9 },
  { f0: 195, tract: 1.15, rate: 5.5, expr: 0.2, breath: 0.1, rough: 0.9, bright: 0.85 },
];
// Chaque personne de la salle tire sa variante d'une voix : hauteur, débit, expressivité, et des formants à elle.
const person = (v, spread = 1) => {
  const tract = v.tract * (1 + between(-0.03, 0.03) * spread);
  return {
    ...v,
    f0: v.f0 * (1 + between(-0.12, 0.12) * spread),
    rate: v.rate * (1 + between(-0.15, 0.15) * spread),
    expr: v.expr * (1 + between(-0.2, 0.3) * spread),
    fscale: [0, 1, 2, 3].map(() => tract * between(0.95, 1.05)),
  };
};

// Réverbération de salle (peignes de Schroeder) : les mots se fondent, il ne reste que la rumeur.
function room(input) {
  const out = new Float32Array(input.length);
  for (const [delay, gain] of [[1557, 0.55], [1617, 0.53], [1491, 0.56], [1422, 0.51], [1277, 0.5], [1356, 0.48]]) {
    const buf = new Float32Array(delay);
    let p = 0;
    for (let i = 0; i < input.length; i++) {
      const y = buf[p];
      buf[p] = input[i] + y * gain;
      p = (p + 1) % delay;
      out[i] += y / 6;
    }
  }
  // Deux passe-tout en série diffusent l'écho : une salle, pas un tuyau métallique.
  for (const [delay, gain] of [[278, 0.5], [220, 0.5]]) {
    const buf = new Float32Array(delay);
    let p = 0;
    for (let i = 0; i < out.length; i++) {
      const y = buf[p] - gain * out[i];
      buf[p] = out[i] + gain * y;
      p = (p + 1) % delay;
      out[i] = y;
    }
  }
  return out.map((y, i) => input[i] * 0.55 + y * 0.45);
}

function voices() {
  fs.mkdirSync(path.join(DIR, 'voix'), { recursive: true });
  VOICES.forEach((v, i) => encode(`voix/voix-${i + 1}`, speak(person(v, 0), 8 * RATE, [0.4, 0.7]), RATE, 0.8, 'highpass=f=80,lowpass=f=5000'));
}

function brouhaha() {
  const fade = RATE;
  const total = LOOP_S * RATE + fade;
  const mix = new Float32Array(total);
  // Chaque voix parle trois fois dans la salle, à trois distances : quelques voisins nets, beaucoup de voix lointaines.
  VOICES.forEach((p, v) => {
    for (let n = 0; n < 3; n++) {
      const far = n === 0 && v % 3 === 0 ? between(0.05, 0.25) : between(0.4, 1);
      const gain = 1 - 0.75 * far;
      const k = 0.25 + 0.6 * (1 - far);
      let lp = 0;
      speak(person(p), total, [0.3, 2]).forEach((x, i) => {
        // Les voix lointaines sont plus sourdes.
        lp += k * (x - lp);
        mix[i] += lp * gain;
      });
    }
  });
  // La salle respire : la rumeur enfle et retombe doucement (période de 8 s, la boucle reste sans raccord).
  const wet = room(mix).map((y, i) => y * (1 + 0.15 * Math.sin((2 * Math.PI * i) / (8 * RATE))));
  // Raccord de boucle : la dernière seconde se fond dans ce qui précède le début, la boucle reprend sans saut.
  const loop = new Float32Array(LOOP_S * RATE);
  for (let i = 0; i < loop.length; i++) {
    loop[i] = wet[i + fade];
  }
  for (let i = 0; i < fade; i++) {
    const u = i / fade;
    loop[loop.length - fade + i] = wet[loop.length + i] * (1 - u) + wet[i] * u;
  }
  encode('brouhaha', loop, RATE, 0.7, 'highpass=f=110,lowpass=f=4500', '96k');
}

// Feuille qui se range : un « woosh » net, du bruit blanc passé dans une bande qui monte puis redescend, sans grave ni saturation.
function woosh(name, duration, top, wseed) {
  const rate = 44100;
  const total = Math.floor(duration * rate);
  const out = new Float32Array(total);
  const [a, b] = [resonator(rate), resonator(rate)];
  let r = wseed;
  for (let i = 0; i < total; i++) {
    const u = i / total;
    if (i % 64 === 0) {
      const f = 450 + (top - 450) * Math.sin(Math.PI * u ** 0.8);
      a.tune(f, f * 0.9);
      b.tune(f, f * 0.9);
    }
    r = (r * 16807) % 2147483647;
    out[i] = b(a(r / 1073741823.5 - 1)) * Math.sin(Math.PI * u ** 0.8) ** 2;
  }
  encode(name, out, rate, 0.35, 'highpass=f=250,lowpass=f=4000');
}

for (const [name, graph] of Object.entries(SOUNDS)) {
  const out = path.join(DIR, `${name}.m4a`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-filter_complex', `${graph},aformat=channel_layouts=mono,aresample=44100`, '-c:a', 'aac', '-b:a', '64k', out]);
  console.log(`✅ ${name} (${(fs.statSync(out).size / 1024).toFixed(1)} Ko)`);
}
voices();
brouhaha();
woosh('feuille-1', 0.45, 1700, 11);
woosh('feuille-2', 0.4, 1900, 12);
