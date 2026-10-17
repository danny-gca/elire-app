// Génère les PNG des icônes d'onglets (1x, 2x, 3x) depuis assets/icons/tabs/*.svg, avec Chrome sans interface.
// iOS (ios/) : repos en graphite, actif en encre sur un trait de chaque surligneur, rendus tels quels (« original »).
// Usage : node scripts/build-tab-icons.mjs (google-chrome requis)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIR = path.resolve(import.meta.dirname, '..', 'assets', 'icons', 'tabs');
const IOS_DIR = path.join(DIR, 'ios');
const THEME = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'src', 'constants', 'theme.ts'), 'utf8');
const color = (name) => THEME.match(new RegExp(`\\b${name}: '(#[0-9A-F]{6})'`, 'i'))[1];
const MARKERS = Object.fromEntries([...THEME.matchAll(/(\w+): \{ label: '[^']+', solid: '(#[0-9A-F]{6})'/gi)].map((m) => [m[1], m[2]]));
// Le trait du surligneur derrière la moitié basse de l'icône, de biais comme dans le sélecteur.
const stroke = (fill) => `<rect x="16" y="248" width="480" height="192" rx="48" transform="rotate(-6 256 344)" fill="${fill}"/>`;
const SIZE = 24;
const PORT = 9340;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tab-icons-'));
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let url;
for (let i = 0; i < 50 && !url; i++) {
  try {
    url = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl;
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
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
const render = async (svg, file) => {
  for (const scale of [1, 2, 3]) {
    await send('Emulation.setDeviceMetricsOverride', { width: SIZE, height: SIZE, deviceScaleFactor: scale, mobile: false });
    await send('Page.navigate', { url: `data:text/html,${encodeURIComponent(`<!doctype html><body style="margin:0;background:transparent">${svg}</body>`)}` });
    await sleep(300);
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: SIZE, height: SIZE, scale: 1 } });
    fs.writeFileSync(`${file}${scale > 1 ? `@${scale}x` : ''}.png`, Buffer.from(shot.result.data, 'base64'));
  }
};
fs.mkdirSync(IOS_DIR, { recursive: true });
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.svg'))) {
  const name = path.basename(file, '.svg');
  const source = fs.readFileSync(path.join(DIR, file), 'utf8');
  const sized = (ink, before = '') => source.replace('<svg ', `<svg width="${SIZE}" height="${SIZE}" style="color:${ink};display:block" `).replace(/(<svg[^>]*>)/, `$1${before}`);
  await render(sized('#000'), path.join(DIR, name));
  await render(sized(color('graphite')), path.join(IOS_DIR, `${name}-off`));
  for (const [marker, fill] of Object.entries(MARKERS)) {
    await render(sized(color('ink'), stroke(fill)), path.join(IOS_DIR, `${name}-${marker}`));
  }
  console.log(`✅ ${name}`);
}
ws.close();
// Chrome écrit encore dans son profil juste après kill() : on attend sa sortie.
const exited = new Promise((resolve) => chrome.once('exit', resolve));
chrome.kill();
await exited;
// Les sous-processus de Chrome écrivent encore un instant : on laisse le profil temporaire au système s'il résiste.
await sleep(500);
try {
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
} catch {}
