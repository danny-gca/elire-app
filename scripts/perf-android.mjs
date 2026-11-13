// Perf et gestes de Voter sur Android (émulateur ou téléphone), rejouables : adb, uiautomator et gfxinfo, sans dépendance.
//
//   source ~/Android/env.sh && emulator -avd elire-lent &
//   npx expo run:android --variant release && node scripts/perf-android.mjs
//   node scripts/perf-android.mjs --apk avant.apk,apres.apk --scenarios votes,retour --runs 2
//
// Options : --apk (APK à installer puis mesurer, séparés par des virgules ; sinon l'app installée), --serial, --runs,
// --scenarios (demarrage, votes, rapide, retour, tiroirs, gomme, bilan, visites, defilement, selection), --reduced-motion, --json <fichier>.
//
// Rapide : uiautomator attend un écran immobile (jusqu'à ~3 s tant que « A voté ! » décompte) et sa lecture charge le
// fil d'interface. On ne lit donc l'écran qu'aux points de contrôle ; entre deux, des touchers aux positions relevées une
// fois et quelques pixels d'une capture brute (screencap, sans attente).
import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? 'true' : all[i + 1]]] : acc), [])
);
const pkg = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo.android.package;
const apks = args.apk ? args.apk.split(',').map((a) => resolve(a)) : [null];
const runs = Number(args.runs ?? 1);
const scenarios = (args.scenarios ?? 'demarrage,votes,rapide,retour,tiroirs,gomme,bilan,visites,defilement,selection').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const adb = async (...a) => (await run('adb', [...(args.serial ? ['-s', args.serial] : []), ...a], { maxBuffer: 64 * 1024 * 1024, encoding: 'buffer' })).stdout;
const shell = async (cmd) => String(await adb('shell', cmd));
const tapXY = ({ x, y }) => shell(`input tap ${x} ${y}`);

// Lecture complète de l'écran (arbre d'accessibilité) : lente, réservée aux points de contrôle.
async function dump() {
  for (let i = 0; i < 30; i++) {
    const out = await shell('uiautomator dump /sdcard/elire-ui.xml 2>&1').catch((e) => String(e.stdout ?? e));
    if (/dumped to/.test(out)) {
      const xml = String(await adb('exec-out', 'cat', '/sdcard/elire-ui.xml'));
      return [...xml.matchAll(/<node ([^>]*?)\/?>/g)].map(([, attrs]) => {
        const get = (k) => (new RegExp(`${k}="([^"]*)"`).exec(attrs)?.[1] ?? '').replace(/&(quot|amp|#10);/g, (_, e) => ({ quot: '"', amp: '&', '#10': ' ' })[e]);
        const [x1, y1, x2, y2] = (get('bounds').match(/\d+/g) ?? [0, 0, 0, 0]).map(Number);
        return { text: get('text'), desc: get('content-desc'), x: (x1 + x2) >> 1, y: (y1 + y2) >> 1, left: x1, right: x2, top: y1, bottom: y2 };
      });
    }
    await sleep(500);
  }
  throw new Error('uiautomator dump impossible');
}
const find = (nodes, re) => nodes.find((n) => re.test(n.desc) || re.test(n.text));
const VOTE = /^Pour, \+1$|^Pour$/;
let dumps = 0;

// Lit l'écran jusqu'à ce que `fn` réponde, en fermant les astuces (« Compris ») au passage.
async function until(fn, max = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < max) {
    const nodes = await dump();
    dumps++;
    const tuto = nodes.find((n) => n.text === 'Compris');
    if (tuto) {
      await tapXY(tuto);
      await sleep(400);
      continue;
    }
    const hit = await fn(nodes);
    if (hit) {
      return { hit, nodes };
    }
    await sleep(150);
  }
  return null;
}

// Capture brute (en-tête de 12 ou 16 octets, puis RGBA) : quelques pixels suffisent à savoir où l'on en est.
async function frame() {
  const buf = await adb('exec-out', 'screencap');
  const w = buf.readUInt32LE(0);
  const h = buf.readUInt32LE(4);
  const head = buf.length - w * h * 4;
  return { at: (x, y) => [0, 1, 2].map((c) => buf[head + (y * w + x) * 4 + c]) };
}
// Encre (#1C1E21) ou compte à rebours graphite (#5B6168) sur « Question suivante » ; papier #F6F7F5, feuille #FFFFFF.
const isDark = ([r, g, b]) => r < 120 && g < 120 && b < 120;
const isSheet = ([r, g, b]) => r > 252 && g > 252 && b > 252;

// Positions relevées une fois : échelle de vote, « Je ne sais pas » (où se pose « Question suivante »), onglets.
const L = {};
async function calibrate() {
  let r = null;
  // Un scrutin en tête n'a pas l'échelle à cinq choix : on le vote, et on recommence.
  for (let i = 0; i < 4 && !r; i++) {
    r = await until((n) => find(n, /^Pour, \+1$/) && find(n, /^Je ne sais pas$/) && find(n, /^Cahier$/), 6000);
    if (!r) {
      const step = await until((n) => find(n, /^Question suivante$/) || find(n, VOTE), 6000);
      if (step) {
        await tapXY(step.hit);
        await sleep(1500);
      }
    }
  }
  if (!r) {
    throw new Error('Échelle de vote introuvable pour le calibrage');
  }
  const pick = (re) => (({ x, y, left, right, top, bottom }) => ({ x, y, left, right, top, bottom }))(find(r.nodes, re));
  Object.assign(L, { pour: pick(/^Pour, \+1$/), jamais: pick(/^Jamais, −2$/), contre: pick(/^Contre, −1$/), jnsp: pick(/^Je ne sais pas$/) });
  for (const tab of ['Voter', 'Cahier', 'Lois', 'Explorer']) {
    L[tab] = pick(new RegExp(`^${tab}$`));
  }
}

// Où en est l'écran, d'après trois pixels de la zone de vote.
async function dockState() {
  const f = await frame();
  const y = L.jnsp.y;
  // « Question suivante » : bouton encre sur toute la largeur, là où se tient « Je ne sais pas ».
  if (isDark(f.at(L.jnsp.left + 30, y)) && isDark(f.at(L.jnsp.right - 30, y))) {
    return 'suivante';
  }
  // Scrutin : deux grands boutons ; l'interstice entre « Jamais » et « Contre » tombe dans un bouton blanc.
  const gap = (L.jamais.right + L.contre.left) >> 1;
  if (isSheet(f.at(gap, L.pour.y))) {
    return 'scrutin';
  }
  // Bouton « Pour » sondé près de son bord gauche, loin de son texte centré.
  return isSheet(f.at(L.pour.left + 14, L.pour.y)) ? 'vote' : 'autre';
}

// Mesure par geste : compteurs remis à zéro, le geste, une pause sans lecture d'écran, puis les images (framestats) et
// le temps de processeur de chaque fil de l'app (/proc) : JavaScript, interface, rendu. Android ne voit pas le JS autrement.
const steps = [];
let pid = null;
let current = '';
const threadGroup = (name) =>
  /mqt_v_js|mqt_js/.test(name) ? 'js' : name === 'RenderThread' ? 'rendu' : /mqt_v_native|mqt_native/.test(name) ? 'natif' : pkg.startsWith(name) ? 'ui' : /ExoPlayer|MediaCodec|AudioTrack/.test(name) ? 'son' : /HeapTaskDaemon|GC|hermes/i.test(name) ? 'gc' : 'autres';
async function cpuByThread() {
  const acc = {};
  if (!pid) {
    return acc;
  }
  // Un fil peut disparaître pendant la lecture (cat échoue alors) : `; true` garde ce qui a été lu.
  const out = await shell(`cat /proc/${pid}/task/*/stat 2>/dev/null; true`);
  for (const line of out.split('\n')) {
    const m = /^\d+ \((.*)\) (.*)$/.exec(line.trim());
    if (m) {
      const f = m[2].split(' ');
      const g = threadGroup(m[1]);
      // utime + stime, en tops d'horloge (10 ms).
      acc[g] = (acc[g] ?? 0) + (Number(f[11]) + Number(f[12])) * 10;
    }
  }
  return acc;
}
// Une ligne par image : total (de la vsync voulue à l'image finie), fil d'interface (entrée, animation, mise en page, dessin), rendu.
async function frameRows() {
  const lines = (await shell(`dumpsys gfxinfo ${pkg} framestats`)).split('\n');
  const rows = [];
  lines.forEach((line, i) => {
    // Android 12 et plus ajoutent des colonnes (FrameTimelineVsyncId…) : on lit l'en-tête plutôt que des positions.
    if (!line.startsWith('Flags,') || !line.includes('IntendedVsync')) {
      return;
    }
    const head = line.split(',');
    const ix = (k) => head.indexOf(k);
    for (let j = i + 1; j < lines.length && /^\d/.test(lines[j]); j++) {
      const c = lines[j].split(',').map(Number);
      if (c[0] === 0) {
        rows.push({
          total: (c[ix('FrameCompleted')] - c[ix('IntendedVsync')]) / 1e6,
          ui: (c[ix('SyncQueued')] - c[ix('HandleInputStart')]) / 1e6,
          rendu: (c[ix('FrameCompleted')] - c[ix('SyncStart')]) / 1e6,
        });
      }
    }
  });
  return rows;
}
const pct = (values, p) => {
  const v = values.filter((x) => x >= 0).sort((a, b) => a - b);
  return v.length ? Math.round(v[Math.min(v.length - 1, Math.floor(v.length * p))]) : null;
};
async function measure(label, action, settle = 1200) {
  await shell(`dumpsys gfxinfo ${pkg} reset`);
  const cpu0 = await cpuByThread();
  await action();
  await sleep(settle);
  const cpu1 = await cpuByThread();
  const fr = await frameRows();
  const cpu = (k) => Math.max(0, (cpu1[k] ?? 0) - (cpu0[k] ?? 0));
  const row = {
    scenario: current,
    geste: label,
    images: fr.length,
    saccadees: fr.filter((f) => f.total > 16.7).length,
    p90ms: pct(fr.map((f) => f.total), 0.9),
    uiP90ms: pct(fr.map((f) => f.ui), 0.9),
    renduP90ms: pct(fr.map((f) => f.rendu), 0.9),
    cpuJsMs: cpu('js'),
    cpuUiMs: cpu('ui'),
    cpuRenduMs: cpu('rendu'),
    cpuGcMs: cpu('gc'),
    cpuSonMs: cpu('son'),
  };
  steps.push(row);
  return row;
}

// Avis posés modulo 10 (le bilan tombe à 0), lus sur le palier : « Classement dans 3 votes » ou « Bilan dans 7 votes ».
const state = { mod: 0, fallbacks: 0, scrutins: 0, resultats: 0, stopAtBilan: false };
async function checkpoint({ continuer = true } = {}) {
  const r = await until((n) => find(n, /^(Classement|Bilan) dans \d+ votes?/) || find(n, /^10 questions de plus$/), 20000);
  const pause = r && find(r.nodes, /^10 questions de plus$/);
  if (pause) {
    state.mod = 0;
    if (continuer) {
      await measure('reprise après le bilan', () => tapXY(pause), 900);
    }
    return 'bilan';
  }
  const n = Number(/dans (\d+)/.exec(find(r?.nodes ?? [], /^(Classement|Bilan) dans/)?.desc ?? '')?.[1] ?? NaN);
  if (!Number.isNaN(n)) {
    state.mod = (10 - n) % 10;
  }
  return 'vote';
}

// Un vote « Pour » sans lire l'écran ; scrutin et bilan passent par une lecture.
async function voteFast() {
  const s = await dockState();
  if (s === 'suivante') {
    await measure('question suivante (après un résultat)', () => tapXY(L.jnsp), 1000);
    return voteFast();
  }
  if (s !== 'vote') {
    // Scrutin (échelle à trois choix) ou écran inattendu : une lecture complète.
    state.fallbacks++;
    const r = await until((n) => find(n, VOTE) || find(n, /^10 questions de plus$/) || find(n, /^Question suivante$/) || find(n, /^Fermer$/));
    // Un toucher tombé sur le résultat quand l'écran changeait (processeur lent) : la fiche du scrutin s'est ouverte.
    if (r && find(r.nodes, /^Fermer$/)) {
      await shell('input keyevent KEYCODE_BACK');
      await sleep(800);
      return voteFast();
    }
    const target = r && (find(r.nodes, /^Question suivante$/) ?? find(r.nodes, /^10 questions de plus$/) ?? find(r.nodes, VOTE));
    if (!target) {
      throw new Error('Voter bloqué : ni vote, ni suite, ni bilan');
    }
    const isVote = VOTE.test(target.desc) || VOTE.test(target.text);
    const label = isVote ? 'vote scrutin (résultat et hémicycle)' : /10 questions/.test(target.text + target.desc) ? 'reprise après le bilan' : 'question suivante (après un résultat)';
    await measure(label, () => tapXY(target), 1100);
    if (isVote) {
      state.mod = (state.mod + 1) % 10;
      // Le résultat s'affiche : l'hémicycle et « Question suivante » à la place des boutons de vote.
      state.scrutins++;
      for (let t0 = Date.now(); Date.now() - t0 < 3000; await sleep(200)) {
        if ((await dockState()) === 'suivante') {
          state.resultats++;
          break;
        }
      }
    } else {
      return voteFast();
    }
  } else {
    const row = await measure('vote proposition (page qui tourne)', () => tapXY(L.pour), 1100);
    state.mod = (state.mod + 1) % 10;
    // Une question commune a la même échelle : on le sait après coup, à son résultat.
    if ((await dockState()) === 'suivante') {
      row.geste = 'vote question commune (résultat)';
    }
  }
  // Après un scrutin ou une question commune : la suite.
  if ((await dockState()) === 'suivante') {
    await measure('question suivante (après un résultat)', () => tapXY(L.jnsp), 1000);
  }
  if (state.mod === 0) {
    await checkpoint({ continuer: !state.stopAtBilan });
  }
}
async function votes(n) {
  for (let i = 0; i < n; i++) {
    await voteFast();
    // Tous les 5 votes, une lecture : astuce imprévue, compteur recalé.
    if (i % 5 === 4 && state.mod !== 0) {
      await checkpoint();
    }
  }
}

// Une app neuve : présentation une fois par installation, astuces de Voter consommées une fois ; ensuite les votes sont
// effacés dans les Réglages (présentation et astuces restent vues).
let ready = false;
const open = (path) => shell(`am start -W -a android.intent.action.VIEW -d elire://${path} ${pkg}`);
async function onboard() {
  await shell(`pm clear ${pkg}`);
  await shell(`am start -W -n ${pkg}/.MainActivity`);
  const { w, h } = await screen();
  await sleep(3000);
  // La présentation s'anime sans cesse : touchers à l'aveugle sur la zone « Page suivante », puis « Commencer à voter ».
  for (let i = 0; i < 12; i++) {
    await shell(`input tap ${Math.round(w * 0.685)} ${Math.round(h * 0.523)}`);
    await sleep(500);
  }
  const start = await until((n) => find(n, /^Commencer/) || find(n, VOTE), 30000);
  if (start && !find(start.nodes, VOTE)) {
    await tapXY(start.hit);
  }
  // Échauffement lu à l'écran : les astuces des premiers votes (arrivée, premier vote, scrutin, bilan…) passent.
  for (let i = 0; i < 12; i++) {
    const r = await until((n) => find(n, /^Question suivante$/) || find(n, /^10 questions de plus$/) || find(n, VOTE), 20000);
    if (!r) {
      throw new Error('Présentation ou échauffement bloqué');
    }
    await tapXY(r.hit);
    await sleep(1200);
  }
}
async function fresh() {
  await shell('am force-stop com.google.android.apps.messaging');
  if (!ready) {
    // Déjà passée lors d'un lancement précédent : l'app ouvre directement Voter ou un onglet.
    await shell(`am start -W -n ${pkg}/.MainActivity`);
    await sleep(2500);
    const seen = await until((n) => find(n, /^Page \d+ sur \d+$/) || find(n, /^Cahier$/), 15000);
    if (!seen || !find(seen.nodes, /^Cahier$/)) {
      await onboard();
    }
    ready = true;
  }
  await open('reglages');
  const reset = await until((n) => find(n, /^Réinitialiser mes votes$/), 15000);
  if (reset) {
    await tapXY(reset.hit);
    const confirm = await until((n) => find(n, /^Confirmer : effacer/), 3000);
    if (confirm) {
      await tapXY(confirm.hit);
    }
  }
  await open('');
  pid = (await shell(`pidof ${pkg}`)).trim().split(/\s+/)[0] || null;
  await sleep(1500);
  if (!L.pour) {
    await calibrate();
  }
  await checkpoint();
}

async function screen() {
  const [w, h] = (/(\d+)x(\d+)/.exec(await shell('wm size')) ?? [0, 1080, 2400]).slice(1).map(Number);
  return { w, h };
}
const swipe = async ({ w, h }, forward = false) => {
  const [a, b] = [Math.round(w * 0.15), Math.round(w * 0.85)];
  await shell(`input swipe ${forward ? b : a} ${Math.round(h * 0.4)} ${forward ? a : b} ${Math.round(h * 0.4)} 350`);
};

const scenarioFns = {
  async votes(out) {
    await votes(20);
    out.votes = 20;
  },
  // Paires de touchers « Pour » à 700 ms : le second tombe pendant que la page tourne. Le palier dit combien ont compté.
  async rapide(out) {
    let avales = 0;
    let paires = 0;
    for (let i = 0; i < 4; i++) {
      if ((await dockState()) !== 'vote' || state.mod >= 8) {
        await voteFast();
        continue;
      }
      const before = state.mod;
      let second = 'vote';
      await measure('double toucher pendant le tour de page', async () => {
        await tapXY(L.pour);
        await sleep(700);
        // Le second vote ne compte que si la question suivante est aussi une proposition ou une question commune.
        second = await dockState();
        await tapXY(L.pour);
      }, 1500);
      if ((await dockState()) === 'suivante') {
        await measure('question suivante (après un résultat)', () => tapXY(L.jnsp), 1000);
      }
      await checkpoint();
      if (second !== 'scrutin') {
        avales += 2 - ((state.mod - before + 10) % 10);
        paires++;
      }
    }
    out.paires = paires;
    out.voteAvale = avales;
  },
  async retour(out, size) {
    await votes(2);
    let fails = 0;
    for (let i = 0; i < 3; i++) {
      await measure('swipe retour (page précédente ramenée)', () => swipe(size), 1000);
      const back = await until((n) => find(n, /^Revenir à la question en cours$/), 5000);
      await measure('swipe avance (page qui repart)', () => swipe(size, true), 1000);
      const forward = await until((n) => !find(n, /^Revenir à la question en cours$/), 5000);
      if (!back || !forward) {
        fails++;
      }
    }
    out.retourRate = fails;
  },
  // Chaque tiroir s'ouvre (l'écran défile jusqu'à lui) puis se referme (retour en haut).
  async tiroirs(out) {
    let manques = 0;
    for (let q = 0; q < 2; q++) {
      const labels = ['Contexte', 'Précisions', 'Glossaire', 'Liens et sources'];
      for (const label of labels) {
        const row = (await until((n) => n.find((x) => x.desc === label || x.text === label), 5000))?.hit;
        if (!row) {
          manques++;
          continue;
        }
        await measure(`tiroir ${label} : ouvrir (défilement vers lui)`, () => tapXY(row), 1000);
        const open = (await until((n) => n.find((x) => x.desc === label || x.text === label), 5000))?.hit;
        if (open) {
          await measure(`tiroir ${label} : fermer (retour en haut)`, () => tapXY(open), 1000);
        }
      }
      await voteFast();
    }
    out.tiroirsManquants = manques;
  },
  async bilan(out, size) {
    // Jusqu'au bilan en lisant le palier après chaque vote (un scrutin lu à l'écran décale le compte), sans le passer.
    state.stopAtBilan = true;
    try {
      for (let i = 0; i < 14 && !out.bilanAtteint; i++) {
        await voteFast();
        out.bilanAtteint = (await checkpoint({ continuer: false })) === 'bilan';
      }
    } finally {
      state.stopAtBilan = false;
    }
    if (!out.bilanAtteint) {
      // Diagnostic : ce que l'écran montre au lieu du bilan.
      out.ecran = (await dump()).map((n) => n.desc || n.text).filter(Boolean).slice(0, 12).join(' | ');
    }
    await measure('swipe retour depuis le bilan', () => swipe(size), 1000);
    out.retourDepuisBilan = !!(await until((n) => find(n, /^Revenir à la question en cours$/), 5000));
    await measure('swipe avance vers le bilan', () => swipe(size, true), 1000);
    out.bilanRevenu = !!(await until((n) => find(n, /^10 questions de plus$/), 5000));
  },
  async visites(out) {
    await votes(12);
    const step = async (label, target, done) => {
      const nodes = (await until(() => true)).nodes;
      const t = typeof target === 'function' ? target(nodes) : find(nodes, target);
      if (!t) {
        out[label] = 'introuvable';
        return;
      }
      await measure(`ouvrir ${label}`, () => tapXY(t), 1500);
      out[label] = (await until(done, 10000)) ? 'ok' : 'échec';
    };
    const back = async (label, done) => {
      await measure(`retour Android : ${label}`, () => shell('input keyevent KEYCODE_BACK'), 1200);
      out[label] = (await until(done, 10000)) ? 'ok' : 'échec';
    };
    const candidat = /^Rang \d|pas encore classé/;
    await step('cahier', /^Cahier$/, (n) => find(n, candidat));
    await step('ficheCandidat', candidat, (n) => !find(n, candidat));
    await back('retourCahier', (n) => find(n, candidat));
    await step('lois', /^Lois$/, (n) => find(n, /Votes réels au Parlement/));
    // Première carte de scrutin : le premier long texte sous la note de l'écran.
    const firstCard = (n) => {
      const note = find(n, /Votes réels au Parlement/);
      return n.find((x) => note && x.top > note.bottom + 40 && x.text.length >= 30);
    };
    await step('ficheScrutin', firstCard, (n) => find(n, /^Fermer$/));
    const closeButton = (n) => n.filter((x) => /^Fermer$/.test(x.desc)).sort((a, b) => (a.right - a.left) * (a.bottom - a.top) - (b.right - b.left) * (b.bottom - b.top))[0];
    await step('fermerScrutin', closeButton, (n) => !find(n, /^Fermer$/));
    await step('explorer', /^Explorer$/, (n) => find(n, /votées sur/));
    await step('pageTheme', /votées sur/, (n) => !find(n, /votées sur/));
    await back('retourExplorer', (n) => find(n, /votées sur/));
    await step('voter', /^Voter$/, (n) => find(n, VOTE));
  },
  // Démarrage à froid : app arrêtée, puis le temps qu'Android met à l'afficher (TotalTime de `am start -W`), 5 fois.
  async demarrage(out) {
    const times = [];
    for (let i = 0; i < 5; i++) {
      await shell(`am force-stop ${pkg}`);
      await sleep(1000);
      const m = /TotalTime: (\d+)/.exec(await shell(`am start -W -n ${pkg}/.MainActivity`));
      if (m) {
        times.push(Number(m[1]));
      }
      await sleep(2500);
    }
    pid = (await shell(`pidof ${pkg}`)).trim().split(/\s+/)[0] || null;
    out.demarrageMedianMs = median(times);
    out.demarrageMaxMs = times.length ? Math.max(...times) : null;
  },
  // Défilements rapides dans les longues listes : Explorer, Lois, Cahier (12 votes avant, pour un Classement rempli).
  async defilement(out, size) {
    await votes(12);
    const x = Math.round(size.w / 2);
    const fling = (down) => shell(`input swipe ${x} ${Math.round(size.h * (down ? 0.75 : 0.3))} ${x} ${Math.round(size.h * (down ? 0.3 : 0.75))} 120`);
    for (const tab of ['Explorer', 'Lois', 'Cahier']) {
      await tapXY(L[tab]);
      await sleep(1500);
      await measure(`défilement : ${tab}`, async () => {
        for (const down of [true, true, true, true, false, false, false, false]) {
          await fling(down);
          await sleep(250);
        }
      }, 800);
    }
    await tapXY(L.Voter);
    await sleep(1000);
    out.listes = 3;
  },
  // La gomme : « A voté ! » touché ouvre la question entière ; « Contre » y remplace « Pour » et referme la feuille.
  async gomme(out) {
    let ouvertes = 0;
    let changees = 0;
    for (let i = 0; i < 3; i++) {
      await voteFast();
      // Son compte à rebours anime l'écran et bloque la lecture : « A voté ! » se touche à sa place, au-dessus de l'échelle.
      const bar = { x: L.contre.x, y: L.jamais.top - Math.round(0.6 * (L.jamais.bottom - L.jamais.top)) };
      await measure('gomme : ouvrir', () => tapXY(bar), 1200);
      const sheet = await until((n) => find(n, /^(Votre vote|Modifier votre vote)$/) && find(n, /^Contre, −1$/), 5000);
      if (!sheet) {
        await shell('input keyevent KEYCODE_BACK');
        continue;
      }
      ouvertes++;
      // Un autre choix enregistre le vote et referme la feuille.
      await measure('gomme : changer le vote', () => tapXY(find(sheet.nodes, /^Contre, −1$/)), 1200);
      if (await until((n) => !find(n, /^(Votre vote|Modifier votre vote)$/), 4000)) {
        changees++;
      } else {
        await shell('input keyevent KEYCODE_BACK');
      }
    }
    out.gommesOuvertes = ouvertes;
    out.gommesChangees = changees;
  },
  // Appui long sur le titre de la question : aucune barre de sélection (Copier) ne doit s'ouvrir dans Voter.
  async selection(out) {
    const nodes = (await until((n) => find(n, /^(Proposition|Scrutin|Question commune) \S+, thème/))).nodes;
    const margin = find(nodes, /^(Proposition|Scrutin|Question commune) \S+, thème/);
    const title = nodes.find((n) => n.text.length > 25 && n.top >= margin.top - 20 && n.top < margin.bottom);
    await shell(`input swipe ${title.x} ${title.y} ${title.x} ${title.y} 900`);
    await sleep(600);
    out.selectionVoter = !!find(await dump(), /^(Copier|Copy|Tout sélectionner|Select all)$/);
    await shell('input keyevent KEYCODE_BACK');
  },
};

const median = (values) => {
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v)).sort((a, b) => a - b);
  return nums.length ? nums[Math.floor(nums.length / 2)] : values[0];
};

const reduced = args['reduced-motion'] === 'true';
const scale = reduced ? (await shell('settings get global animator_duration_scale')).trim() : null;
if (reduced) {
  await shell('settings put global animator_duration_scale 0');
}
const size = await screen();
const results = {};
try {
  for (const apk of apks) {
    if (apk) {
      await adb('install', '-r', apk);
      ready = false;
    }
    const apkLabel = apk ? apk.replace(`${root}/`, '') : 'installée';
    for (const name of scenarios) {
      const all = [];
      current = `${name} | ${apkLabel}`;
      for (let r = 0; r < runs; r++) {
        await fresh();
        const out = {};
        const t0 = Date.now();
        dumps = 0;
        Object.assign(state, { fallbacks: 0, scrutins: 0, resultats: 0 });
        await scenarioFns[name](out, size);
        if (state.scrutins) {
          out.scrutinsAvecResultat = `${state.resultats}/${state.scrutins}`;
        }
        // Les images et le processeur sont relevés geste par geste (measure) : ici, seulement les vérifications.
        all.push({ ...out, dureeS: Math.round((Date.now() - t0) / 1000), lectures: dumps, replis: state.fallbacks });
        process.stderr.write(`${name} `);
      }
      const keys = [...new Set(all.flatMap(Object.keys))];
      results[current] = Object.fromEntries(keys.map((k) => [k, median(all.map((a) => a[k]))]));
      // Écrit après chaque scénario : un plantage plus loin ne perd pas ce qui est mesuré.
      if (args.json) {
        writeFileSync(args.json, JSON.stringify({ partiel: true, results, steps }, null, 2));
      }
    }
  }
} finally {
  if (reduced) {
    await shell(`settings put global animator_duration_scale ${scale === 'null' ? 1 : scale}`);
  }
}
process.stderr.write('\n');
console.log(`Vérifications, ${runs} passage(s)${reduced ? ', animations réduites' : ''}`);
console.table(results);

// Par geste : médianes des passages, coût moyen en processeur. Le plus cher en haut : c'est là qu'il faut regarder.
const groups = new Map();
for (const r of steps) {
  const key = `${r.geste}${apks.length > 1 ? ` | ${r.scenario.split(' | ')[1]}` : ''}`;
  groups.set(key, [...(groups.get(key) ?? []), r]);
}
const avg = (rows, k) => Math.round(rows.reduce((a, r) => a + (r[k] ?? 0), 0) / rows.length);
const perGesture = [...groups].map(([geste, rows]) => {
  const images = rows.reduce((a, r) => a + r.images, 0);
  return {
    geste,
    fois: rows.length,
    saccadesPct: images ? Math.round((100 * rows.reduce((a, r) => a + r.saccadees, 0)) / images) : null,
    p90ms: median(rows.map((r) => r.p90ms)),
    uiP90ms: median(rows.map((r) => r.uiP90ms)),
    renduP90ms: median(rows.map((r) => r.renduP90ms)),
    cpuJsMs: avg(rows, 'cpuJsMs'),
    cpuUiMs: avg(rows, 'cpuUiMs'),
    cpuRenduMs: avg(rows, 'cpuRenduMs'),
    cpuGcMs: avg(rows, 'cpuGcMs'),
    cpuSonMs: avg(rows, 'cpuSonMs'),
  };
}).sort((a, b) => b.cpuJsMs + b.cpuUiMs - (a.cpuJsMs + a.cpuUiMs));
console.log('\nPar geste (moyenne par occurrence ; cpu* = temps de processeur du fil, en ms ; *P90ms = 90e centile par image)');
console.table(Object.fromEntries(perGesture.map(({ geste, ...v }) => [geste, v])));

// Où chercher, pour les gestes les plus chers : le fil qui domine dit quoi optimiser.
const hint = (g) => {
  const top = [['js', g.cpuJsMs], ['ui', g.cpuUiMs], ['rendu', g.cpuRenduMs]].sort((a, b) => b[1] - a[1])[0][0];
  return {
    js: 'JavaScript : rendus React et calculs (profil Hermes, mémoïsation, moins de rendus)',
    ui: 'fil d’interface : mise en page et vues natives, animations Reanimated, nombre de vues',
    rendu: 'dessin : SVG, ombres, transparences, grandes surfaces (rendu logiciel sur l’émulateur, à relativiser)',
  }[top];
};
console.log('\nÀ regarder en premier :');
perGesture.slice(0, 5).forEach((g, i) => console.log(`${i + 1}. ${g.geste} : JS ${g.cpuJsMs} ms, interface ${g.cpuUiMs} ms, rendu ${g.cpuRenduMs} ms, ${g.saccadesPct} % d’images saccadées. Piste : ${hint(g)}.`));
if (args.json) {
  writeFileSync(args.json, JSON.stringify({ runs, reduced, results, perGesture, steps }, null, 2));
}
