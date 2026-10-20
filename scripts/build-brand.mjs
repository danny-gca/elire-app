// Génère les SVG et PNG de la marque (icône, icône Play Store 512, Android adaptative, favicon, splash, bannière Play Store) depuis assets/brand/mark.svg et mark-monochrome.svg, avec Chrome sans interface.
// Usage : node scripts/build-brand.mjs (google-chrome requis)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BRAND = path.join(ROOT, 'assets', 'brand');
const IMAGES = path.join(ROOT, 'assets', 'images');
const PAPER = '#F6F7F5';
const PORT = 9341;

// Retire les commentaires jusqu'à stabilité (un retrait peut en recomposer un).
const stripComments = (input) => {
  let prev;
  let out = input;
  do {
    prev = out;
    out = out.replace(/<!--[\s\S]*?-->\s*/g, '');
  } while (out !== prev);
  return out;
};
const mark = stripComments(fs.readFileSync(path.join(BRAND, 'mark.svg'), 'utf8'));
// Monochrome (icône à thème Android) : les mêmes traits en blanc, chaque morceau à sa transparence (mark-monochrome.svg).
const white = stripComments(fs.readFileSync(path.join(BRAND, 'mark-monochrome.svg'), 'utf8'));
const paper = `<rect width="1024" height="1024" fill="${PAPER}"/>`;
// Zone sûre des icônes adaptatives Android : la marque à 62 %, centrée.
const safe = (body) => `<g transform="translate(194.56 194.56) scale(0.62)">${body}</g>`;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${body}</svg>`;

const VARIANTS = [
  { svg: 'icon.svg', body: paper + mark, png: [['icon.png', 1024], ['logo.png', 1024], ['icon-512.png', 512]] },
  { svg: 'adaptive-bg.svg', body: paper, png: [['android-icon-background.png', 1024]] },
  { svg: 'adaptive-fg.svg', body: safe(mark), png: [['android-icon-foreground.png', 1024]] },
  { svg: 'monochrome.svg', body: safe(white), png: [['android-icon-monochrome.png', 1024]] },
  { svg: 'favicon.svg', body: paper + mark, png: [['favicon.png', 96]] },
  { svg: 'splash.svg', body: mark, png: [['splash-icon.png', 512]] },
];

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'));
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--allow-file-access-from-files', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
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
for (const v of VARIANTS) {
  const source = svg(v.body);
  fs.writeFileSync(path.join(BRAND, v.svg), `${source}\n`);
  for (const [file, size] of v.png) {
    await send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false });
    const sized = source.replace('width="1024" height="1024"', `width="${size}" height="${size}" style="display:block"`);
    await send('Page.navigate', { url: `data:text/html,${encodeURIComponent(`<!doctype html><body style="margin:0;background:transparent">${sized}</body>`)}` });
    await sleep(300);
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
    fs.writeFileSync(path.join(IMAGES, file), Buffer.from(shot.result.data, 'base64'));
  }
  console.log(`✅ ${v.svg}`);
}

// Bannière du Play Store (1024 x 500) : une page HTML qui reprend l'icône et les polices de l'app, sur fond opaque (PNG sans transparence).
await send('Emulation.setDefaultBackgroundColorOverride', {});
await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 500, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `file://${path.join(BRAND, 'feature-graphic.html')}` });
await sleep(800);
await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
const banner = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1024, height: 500, scale: 1 } });
fs.writeFileSync(path.join(IMAGES, 'feature-graphic.png'), Buffer.from(banner.result.data, 'base64'));
console.log('✅ feature-graphic.html');
ws.close();
const exited = new Promise((resolve) => chrome.once('exit', resolve));
chrome.kill();
await exited;
// Les sous-processus de Chrome écrivent encore un instant : on laisse le profil temporaire au système s'il résiste.
await sleep(500);
try {
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
} catch {}
