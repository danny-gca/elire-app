// Captures des stores (iPhone, iPad, téléphone et tablettes Android) depuis l'export web de l'app, avec Chrome sans interface.
// Usage : npx expo export --platform web --output-dir <dossier>, puis node scripts/build-screenshots.mjs <dossier> (google-chrome requis).
// Même jeu de votes de démo partout, animations réduites : chaque capture montre l'état final, à l'identique d'une fois à l'autre.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.resolve(process.argv[2] ?? '');
const OUT = path.join(ROOT, 'assets', 'images', 'screenshots');
const BASE = '/elire-app';
const PORT = 9351;
const CHROME_PORT = 9352;
const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'dataset.json'), 'utf8'));
const TUTOS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'constants', 'tutos.json'), 'utf8'));

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Export web introuvable : npx expo export --platform web --output-dir <dossier>, puis passer ce dossier.');
  process.exit(1);
}

// Formats demandés par les stores : taille de l'écran en points et densité, d'où la taille de l'image.
const DEVICES = [
  { dir: 'iphone-6.9', width: 440, height: 956, scale: 3, mobile: true },
  { dir: 'ipad-13', width: 1032, height: 1376, scale: 2, mobile: true },
  { dir: 'android-telephone', width: 360, height: 640, scale: 3, mobile: true },
  { dir: 'android-tablette-7', width: 603, height: 1072, scale: 2, mobile: true },
  { dir: 'android-tablette-10', width: 1440, height: 810, scale: 2, mobile: true },
];

// Votes de démo : 4 propositions par candidat et quelques scrutins, 103 avis (pas un multiple de 10 : pas de bilan à l'écran).
const NEXT_PROPOSITION = 'prop-mm-2';
const NEXT_LOI = 'mineurs-reseaux-sociaux-2026';
const VALUES = [2, 1, -1, 2, -2, 1, -1, 1];
const LOI_VALUES = ['pour', 'contre', 'abstention', 'pour'];
const byCandidat = new Map();
for (const p of dataset.propositions) {
  if (p.id !== NEXT_PROPOSITION) {
    byCandidat.set(p.candidatId, [...(byCandidat.get(p.candidatId) ?? []), p.id]);
  }
}
const voted = [];
for (let round = 0; voted.length < 98; round++) {
  for (const ids of byCandidat.values()) {
    if (ids[round] && voted.length < 98) {
      voted.push(ids[round]);
    }
  }
}
const votedLois = dataset.lois.map((l) => l.id).filter((id) => id !== NEXT_LOI).slice(0, 5);
const votes = Object.fromEntries(voted.map((id, i) => [id, VALUES[i % VALUES.length]]));
const loiVotes = Object.fromEntries(votedLois.map((id, i) => [id, LOI_VALUES[i % LOI_VALUES.length]]));
const rest = [...dataset.propositions.map((p) => p.id), ...dataset.lois.map((l) => l.id)].filter(
  (id) => !votes[id] && !loiVotes[id] && id !== NEXT_PROPOSITION && id !== NEXT_LOI,
);
const state = (first, onboarded = true) =>
  JSON.stringify({
    state: {
      votes,
      loiVotes,
      order: [...voted, ...votedLois, first, ...[NEXT_PROPOSITION, NEXT_LOI].filter((id) => id !== first), ...rest],
      onboardingVersion: onboarded ? 99 : 0,
      marker: 'jaune',
      marks: {},
    },
    version: 3,
  });
// Toutes les astuces déjà vues : aucune ne couvre les captures.
const tutos = JSON.stringify({ state: { seen: (Array.isArray(TUTOS) ? TUTOS : Object.values(TUTOS)[0]).map((t) => t.id), queue: [] }, version: 1 });

const SHOTS = [
  // La présentation n'apparaît qu'au bout de son fondu : capturée avec les animations.
  { name: '1-presentation', route: '/onboarding', votes: state(NEXT_PROPOSITION, false), motion: true },
  { name: '2-voter', route: '/', votes: state(NEXT_PROPOSITION) },
  { name: '3-scrutin', route: '/', votes: state(NEXT_LOI) },
  { name: '4-classement', route: '/cahier', votes: state(NEXT_PROPOSITION) },
  { name: '5-lois', route: '/lois', votes: state(NEXT_PROPOSITION) },
  { name: '6-explorer', route: '/explore', votes: state(NEXT_PROPOSITION) },
  { name: '7-thematique', route: '/theme/economie', votes: state(NEXT_PROPOSITION) },
];

// Neutralité : aucun candidat ni parti reconnaissable sur une capture. Noms et partis deviennent « Candidat A », « Parti A »,
// les photos des initiales neutres, les anneaux et liserés aux couleurs des partis passent en gris.
const ANON = {
  cands: dataset.candidats.map((c, i) => ({ id: c.id, nom: c.nom, initiales: c.avatar, parti: c.parti, couleur: c.couleurParti, lettre: String.fromCharCode(65 + i) })),
  grey: '#C9CED3',
};
const anonymize = `((anon) => {
  const swap = new Map();
  anon.cands.forEach((c) => {
    swap.set(c.nom, 'Candidat ' + c.lettre);
    swap.set(c.initiales, c.lettre);
    swap.set(c.parti, 'Parti ' + c.lettre);
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const node of texts) {
    let t = node.nodeValue;
    for (const [from, to] of swap) {
      if (from.length > 2 ? t.includes(from) : t.trim() === from) t = t.split(from).join(to);
    }
    node.nodeValue = t;
  }
  for (const img of document.querySelectorAll('img')) {
    const c = anon.cands.find((x) => img.src.includes('/candidates/' + x.id));
    if (!c) continue;
    // Pastille posée aux coordonnées de la photo (son conteneur n'a pas toujours sa taille).
    const r = img.getBoundingClientRect();
    if (r.width === 0) continue;
    img.style.visibility = 'hidden';
    const size = Math.min(r.width, r.height);
    const letter = document.createElement('div');
    letter.textContent = c.lettre;
    letter.style.cssText = 'position:absolute;z-index:5;display:flex;align-items:center;justify-content:center;background:#E8EBED;color:#5B6168;border-radius:50%;font-weight:700;pointer-events:none'
      + ';left:' + (r.left + window.scrollX + (r.width - size) / 2) + 'px;top:' + (r.top + window.scrollY + (r.height - size) / 2) + 'px;width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.36) + 'px';
    document.body.appendChild(letter);
  }
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return 'rgb(' + (n >> 16) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')'; };
  const party = new Set(anon.cands.map((c) => hex(c.couleur)));
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (party.has(cs.borderTopColor) && cs.borderTopWidth !== '0px') el.style.borderColor = anon.grey;
    if (party.has(cs.backgroundColor)) el.style.backgroundColor = anon.grey;
  }
  return true;
})(${JSON.stringify(ANON)})`;

// Serveur de l'export, sous le même chemin que sur GitHub Pages ; une route sans extension sert sa page .html (ou [id].html).
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.ico': 'image/x-icon', '.m4a': 'audio/mp4', '.webp': 'image/webp' };
function resolve(urlPath) {
  const rel = decodeURIComponent(urlPath.replace(BASE, '').split('?')[0]).replace(/^\/+/, '');
  const candidates = [rel, `${rel}.html`, path.join(rel, 'index.html'), path.join(path.dirname(rel), '[id].html')];
  return candidates.map((c) => path.join(DIST, c)).find((f) => f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile());
}
const server = http.createServer((req, res) => {
  const file = resolve(req.url ?? '/');
  if (!file) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-'));
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${CHROME_PORT}`, '--no-first-run', '--hide-scrollbars', '--mute-audio', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let url;
for (let i = 0; i < 50 && !url; i++) {
  try {
    url = (await (await fetch(`http://127.0.0.1:${CHROME_PORT}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
  await sleep(200);
}
const ws = new WebSocket(url);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const origin = `http://127.0.0.1:${PORT}${BASE}`;
const goto = async (route, motion = false) => {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }] });
  await send('Page.navigate', { url: `${origin}${route}` });
  await sleep(motion ? 3500 : 2500);
  await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
  await sleep(500);
};

await send('Page.enable');
await send('Runtime.enable');
for (const device of DEVICES) {
  const dir = path.join(OUT, device.dir);
  fs.mkdirSync(dir, { recursive: true });
  await send('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: device.scale, mobile: device.mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: device.mobile });
  for (const shot of SHOTS) {
    await goto('/mentions-legales');
    await send('Runtime.evaluate', { expression: `localStorage.clear(); localStorage.setItem('elire-votes', ${JSON.stringify(shot.votes)}); localStorage.setItem('elire-tutos', ${JSON.stringify(tutos)});` });
    await goto(shot.route, shot.motion);
    await send('Runtime.evaluate', { expression: anonymize });
    await sleep(300);
    const image = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(dir, `${shot.name}.png`), Buffer.from(image.result.data, 'base64'));
  }
  console.log(`✅ ${device.dir} (${device.width * device.scale} x ${device.height * device.scale})`);
}

ws.close();
server.close();
const exited = new Promise((resolve) => chrome.once('exit', resolve));
chrome.kill();
await exited;
await sleep(500);
try {
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
} catch {}

// Site (../elire-website, s'il est à côté) : pas de capture à part, la même que l'App Store (iPhone, Explorer),
// ramenée à 780 px de large et recadrée en haut en 780 x 1200, en WebP qualité 82.
const SITE_IMAGES = path.join(ROOT, '..', 'elire-website', 'public', 'images');
if (fs.existsSync(SITE_IMAGES)) {
  updateSite(SITE_IMAGES);
}

function updateSite(dir) {
  const source = path.join(OUT, 'iphone-6.9', '6-explorer.png');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', source, '-vf', 'scale=780:-1:flags=lanczos,crop=780:1200:0:0', '-quality', '82', path.join(dir, 'explorer.webp')]);
  const today = new Date().toISOString();
  const prompt = `Capture d'écran réelle de l'app ÉLIRE (écran Explorer), reprise de la capture App Store assets/images/screenshots/iphone-6.9/6-explorer.png de danny-gca/elire-app (export web Expo, 440x956 à 3x, Chrome headless, scripts/build-screenshots.mjs) le ${today.slice(0, 10)}, ramenée à 780 px de large, recadrée en 780x1200 et convertie en WebP qualité 82 avec ffmpeg. Aucune génération d'image.`;
  fs.writeFileSync(path.join(dir, 'explorer.webp.json'), `${JSON.stringify({ prompt, createdAt: today }, null, 2)}\n`);
  console.log('✅ site : explorer.webp (depuis iphone-6.9/6-explorer.png)');
}
