// Perf de Voter sur le web exporté, rejouable : Chrome headless piloté par le protocole DevTools, sans dépendance.
//
//   npx expo export -p web --output-dir dist && node scripts/perf-web.mjs
//   node scripts/perf-web.mjs --dist dist-avant,dist --runs 3 --cpu 6 --scenarios votes,tiroirs
//
// Options : --dist (un ou plusieurs exports, séparés par des virgules), --runs, --cpu (bridage), --reduced-motion,
// --scenarios (votes, rapide, retour, tiroirs, bilan, visites, fin), --json <fichier>, --chrome <binaire>.
// Le web n'est pas Android (ni Hermes, ni rendu natif, ni swipe au doigt) : seule la comparaison entre deux exports compte.
import { spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? 'true' : all[i + 1]]] : acc), [])
);
const dists = (args.dist ?? 'dist').split(',').map((d) => resolve(d));
const runs = Number(args.runs ?? 1);
const cpu = Number(args.cpu ?? 6);
const reducedMotion = args['reduced-motion'] === 'true';
const scenarios = (args.scenarios ?? 'votes,rapide,retour,tiroirs,bilan,visites,fin').split(',');
const chromeBin = args.chrome ?? process.env.CHROME ?? 'google-chrome';
const baseUrl = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo.experiments?.baseUrl ?? '';
const onboardingVersion = Number(/ONBOARDING_VERSION = (\d+)/.exec(readFileSync(join(root, 'src/store/votes-store.ts'), 'utf8'))[1]);
const tutos = JSON.parse(readFileSync(join(root, 'src/constants/tutos.json'), 'utf8')).map((t) => t.id);

// Ordre des questions figé (Math.random à graine fixe), présentation et astuces déjà vues.
const seed = `(() => {
  let s = 2027;
  Math.random = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  if (!localStorage.getItem('elire-votes')) {
    localStorage.setItem('elire-votes', JSON.stringify({ state: { onboardingVersion: ${onboardingVersion} }, version: 4 }));
    localStorage.setItem('elire-tutos', JSON.stringify({ state: { seen: ${JSON.stringify(tutos)} }, version: 1 }));
  }
})();`;

// Scénario fin : tout voté sauf une proposition, pour atteindre l'écran de fin sans 227 votes.
const data = JSON.parse(readFileSync(join(root, 'src/data/dataset.json'), 'utf8'));
const notes = [2, 1, -1, -2, 1];
const finState = {
  state: {
    onboardingVersion,
    votes: Object.fromEntries([
      ...data.propositions.filter((p) => !p.enjeuId).slice(1).map((p, i) => [p.id, notes[i % notes.length]]),
      ...data.enjeux.map((e) => [e.id, 1]),
    ]),
    loiVotes: Object.fromEntries(data.lois.map((l) => [l.id, 'pour'])),
  },
  version: 4,
};
const finSeed = `localStorage.setItem('elire-votes', ${JSON.stringify(JSON.stringify(finState))}); window.__candidats = ${JSON.stringify(data.candidats.map((c) => c.nom))}; window.__questions = ${data.propositions.filter((p) => !p.enjeuId).length + data.enjeux.length + data.lois.length};`;

// Exécuté dans la page : un scénario, ses mesures (tâches longues, images lentes) et ses vérifications.
async function scenario(name) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => !el.closest('[aria-hidden="true"]');
  const button = (re) =>
    [...document.querySelectorAll('[role="button"], button')]
      .filter(visible)
      .find((b) => re.test(b.getAttribute('aria-label') || b.textContent || '') && b.getAttribute('aria-disabled') !== 'true' && !b.disabled);
  const heading = () => [...document.querySelectorAll('[role="heading"], h1')].filter(visible).map((h) => h.textContent)[0] ?? '';
  const until = async (fn, max = 8000) => {
    const t0 = performance.now();
    while (performance.now() - t0 < max) {
      if (fn()) {
        return performance.now() - t0;
      }
      await sleep(16);
    }
    return null;
  };
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const VOTE = /^Pour, \+1|^Pour$/;
  // Écart entre « A voté ! » et le haut du bandeau de vote (17 px attendus).
  const gaps = [];
  const checkGap = (step) => {
    const last = [...document.querySelectorAll('[aria-label^="A voté"]')].find((e) => getComputedStyle(e.parentElement).opacity !== '0');
    const dock = [...document.querySelectorAll('[role="button"], button')]
      .filter((b) => visible(b) && /^Jamais|^Pour|^Contre|Question suivante/.test(b.getAttribute('aria-label') || b.textContent || ''))
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    if (last && dock) {
      const px = Math.round(dock.getBoundingClientRect().top - last.getBoundingClientRect().bottom);
      const box = (el) => el && (({ top, bottom }) => `${Math.round(top)}-${Math.round(bottom)}`)(el.getBoundingClientRect());
      const chain = (el, n) => Array.from({ length: n }, () => (el = el?.parentElement)).map(box).join(' < ');
      gaps.push({ step, px, bouton: (dock.getAttribute('aria-label') || dock.textContent).slice(0, 20), question: heading().slice(0, 40), ...(px > 24 && { aVote: `${box(last)} < ${chain(last, 4)}`, bandeau: `${box(dock)} < ${chain(dock, 5)}`, tous: [...document.querySelectorAll('[aria-label^="A voté"]')].map((e) => { const p = e.parentElement; const cs = getComputedStyle(p); return `${box(e)} op=${cs.opacity} pos=${cs.position} dummy=${!!p.isDummy} anim=${cs.animationName} vis=${getComputedStyle(e).visibility} ${e.getAttribute('aria-label').slice(9, 30)}`; }) }) });
    }
  };
  const voteOnce = async () => {
    const before = heading();
    const t0 = performance.now();
    const vote = button(VOTE);
    if (!vote) {
      return { ms: null, kind: 'pas de bouton' };
    }
    vote.click();
    let kind = 'proposition';
    const ok = await until(() => {
      const next = button(/Question suivante|10 questions de plus/);
      if (next) {
        kind = /10 questions/.test(next.textContent) ? `${kind}+bilan` : 'scrutin/commune';
        next.click();
        return false;
      }
      return heading() !== before && button(VOTE);
    });
    checkGap('après vote');
    return { ms: ok === null ? null : Math.round(performance.now() - t0), kind };
  };

  const long = [];
  const po = new PerformanceObserver((l) => l.getEntries().forEach((e) => long.push(e.duration)));
  po.observe({ type: 'longtask' });
  const frames = [];
  let last = performance.now();
  let running = true;
  const loop = (t) => {
    frames.push(t - last);
    last = t;
    if (running) {
      requestAnimationFrame(loop);
    }
  };
  requestAnimationFrame(loop);

  const out = {};
  const timings = [];
  if (name === 'votes' || name === 'rapide') {
    const pause = name === 'votes' ? 700 : 0;
    let blocked = 0;
    for (let i = 0; i < (name === 'votes' ? 20 : 10); i++) {
      const r = await voteOnce();
      if (r.ms === null) {
        blocked++;
      } else {
        timings.push(r.ms);
      }
      await sleep(pause);
    }
    out.voteAvale = blocked;
  }
  if (name === 'retour') {
    await voteOnce();
    await voteOnce();
    let fails = 0;
    for (let i = 0; i < 5; i++) {
      await sleep(400);
      let t0 = performance.now();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      const back = await until(() => button(/Revenir à la question en cours/), 3000);
      await sleep(400);
      t0 = performance.now();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      const forward = await until(() => !document.querySelector('[aria-label="Revenir à la question en cours"]'), 3000);
      checkGap('après retour');
      if (back === null || forward === null) {
        fails++;
      } else {
        timings.push(Math.round(back), Math.round(forward));
      }
    }
    out.retourRate = fails;
  }
  if (name === 'tiroirs') {
    for (let q = 0; q < 4; q++) {
      const rows = [...document.querySelectorAll('[aria-expanded]')].filter(visible);
      for (const row of rows) {
        for (const want of ['true', 'false']) {
          const t0 = performance.now();
          row.click();
          await until(() => row.getAttribute('aria-expanded') === want, 3000);
          await frame();
          timings.push(Math.round(performance.now() - t0));
          await sleep(300);
        }
      }
      await voteOnce();
      await sleep(700);
    }
  }
  if (name === 'bilan') {
    // Jusqu'au bilan (10 avis), puis retour sur la question précédente depuis le bilan et reprise.
    for (let i = 0; i < 14 && !button(/10 questions de plus/); i++) {
      button(VOTE)?.click();
      await until(() => button(/Question suivante|10 questions de plus/), 2500);
      button(/Question suivante/)?.click();
      await sleep(900);
    }
    out.bilanAtteint = !!button(/10 questions de plus/);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    out.retourDepuisBilan = (await until(() => button(/Revenir à la question en cours/), 3000)) !== null;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    out.bilanRevenu = (await until(() => button(/10 questions de plus/), 3000)) !== null;
    await sleep(300);
    button(/10 questions de plus/)?.click();
    for (const ms of [100, 300, 600, 1000]) {
      await sleep(ms);
      checkGap(`reprise +${ms} ms`);
    }
  }

  if (name === 'visites') {
    // 12 votes pour avoir un classement, puis chaque onglet et une fiche dedans ; temps jusqu'à l'affichage.
    for (let i = 0; i < 14 && !button(/10 questions de plus/); i++) {
      await voteOnce();
    }
    button(/10 questions de plus/)?.click();
    const tab = (label) => [...document.querySelectorAll('[role="tab"]')].find((t) => t.textContent.includes(label) || (t.getAttribute('aria-label') || '').includes(label));
    const step = async (label, act, done) => {
      const t0 = performance.now();
      try {
        act();
      } catch (e) {
        out[label] = `échec : ${e.message}`;
        return;
      }
      const ok = await until(done, 8000);
      await frame();
      out[label] = ok === null ? 'échec' : Math.round(performance.now() - t0);
      await sleep(500);
    };
    const link = (re) => [...document.querySelectorAll('[role="link"], a')].filter(visible).find((l) => re.test(l.getAttribute('aria-label') || ''));
    await step('cahier', () => tab('Cahier').click(), () => location.pathname.endsWith('/cahier') && link(/Rang \d|pas encore classé/));
    await step('ficheCandidat', () => link(/Rang \d|pas encore classé/).click(), () => location.pathname.includes('/candidate/') && heading());
    await step('retourCahier', () => history.back(), () => location.pathname.endsWith('/cahier') && link(/Rang \d|pas encore classé/));
    await step('lois', () => tab('Lois').click(), () => /Votes réels au Parlement/.test(document.body.innerText) && document.querySelector('[aria-roledescription], [role="button"][aria-label], [role="button"]'));
    await step('ficheScrutin', () => [...document.querySelectorAll('[role="button"]')].filter(visible).find((b) => /^\s*\S/.test(b.textContent) && b.textContent.length > 40)?.click(), () => button(/^Fermer$/));
    await step('fermerScrutin', () => button(/^Fermer$/).click(), () => !button(/^Fermer$/));
    await step('explorer', () => tab('Explorer').click(), () => link(/votées sur/));
    await step('pageTheme', () => link(/votées sur/).click(), () => location.pathname.includes('/theme/') && heading());
    await step('retourExplorer', () => history.back(), () => link(/votées sur/));
    await step('voter', () => tab('Voter').click(), () => button(VOTE));
  }

  if (name === 'fin') {
    // La dernière question votée : écran de fin, partage, récapitulatif de toutes les questions, gomme avec les noms.
    const text = () => document.body.innerText;
    const dialog = () => document.querySelector('[aria-modal="true"]');
    const t0 = performance.now();
    button(VOTE)?.click();
    const fin = await until(() => /Vous avez (rempli tous les votes|donné votre avis sur toutes)/.test(text()), 10000);
    out.finMs = fin === null ? 'échec' : Math.round(performance.now() - t0);
    out.partager = !!button(/^Partager mon classement$/);
    out.voirClassement = !!button(/^Voir le classement$/);
    const rows = () => [...document.querySelectorAll('[role="button"]')].filter((b) => visible(b) && /\b[PLE]-\d+\b/.test(b.innerText));
    out.lignes = `${rows().length}/${window.__questions}`;
    rows()[0]?.click();
    const opened = await until(() => dialog() && /Votre vote|Modifier votre vote/.test(dialog().innerText), 5000);
    out.gommeOuverte = opened !== null;
    out.gommeAvecNoms = opened !== null && window.__candidats.some((n) => dialog().innerText.includes(n));
    const contre = dialog() && [...dialog().querySelectorAll('[role="button"], button')].find((b) => /^Contre(, −1)?$/.test(b.getAttribute('aria-label') || ''));
    contre?.click();
    out.gommeVoteChange = !!contre && (await until(() => !dialog(), 5000)) !== null && /Vous avez (rempli|donné)/.test(text());
  }

  running = false;
  po.disconnect();
  const sorted = [...timings].sort((a, b) => a - b);
  return {
    ...out,
    mediane: sorted[Math.floor(sorted.length / 2)] ?? null,
    max: sorted[sorted.length - 1] ?? null,
    tachesLongues: long.length,
    tachesLonguesMs: Math.round(long.reduce((a, b) => a + b, 0)),
    tacheMaxMs: Math.round(Math.max(0, ...long)),
    imagesLentes: frames.filter((f) => f > 50).length,
    imagesGelees: frames.filter((f) => f > 200).length,
    ecartAVoteMax: gaps.length ? Math.max(...gaps.map((g) => g.px)) : null,
    ecarts: gaps.filter((g) => g.px > 24),
  };
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ico': 'image/x-icon' };
const listFiles = (dir, prefix = '') =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listFiles(join(dir, e.name), `${prefix}/${e.name}`) : [`${prefix}/${e.name}`]));
function serve(dir) {
  // L'URL n'est qu'une clé dans les fichiers de l'export, jamais un chemin : rien hors de l'export.
  const files = new Map(listFiles(dir).map((rel) => [rel, join(dir, rel)]));
  const server = createServer((req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]).replace(new RegExp(`^${baseUrl}`), '');
    const key = [path, `${path}.html`, `${path.replace(/\/$/, '')}/index.html`].find((k) => files.has(k)) ?? '/index.html';
    const file = files.get(key);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

// Client du protocole DevTools : une commande, une réponse ; sessions à plat.
async function devtools() {
  const profile = mkdtempSync(join(tmpdir(), 'elire-perf-'));
  const chrome = spawn(chromeBin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--mute-audio', 'about:blank']);
  const wsUrl = await new Promise((ok, ko) => {
    chrome.stderr.on('data', (d) => {
      const m = /DevTools listening on (ws:\S+)/.exec(String(d));
      if (m) {
        ok(m[1]);
      }
    });
    chrome.on('exit', () => ko(new Error(`Chrome introuvable ou arrêté : ${chromeBin}`)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((ok) => ws.addEventListener('open', ok));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, ko } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) {
        ko(new Error(msg.error.message));
      } else {
        ok(msg.result);
      }
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((ok, ko) => {
      pending.set(++id, { ok, ko });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const close = async () => {
    ws.close();
    const exited = new Promise((ok) => chrome.once('exit', ok));
    chrome.kill();
    await exited;
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  };
  return { send, close };
}

async function measure(cdp, url, name) {
  const { browserContextId } = await cdp.send('Target.createBrowserContext');
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => cdp.send(method, params, sessionId);
  await s('Page.enable');
  await s('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await s('Emulation.setTouchEmulationEnabled', { enabled: true });
  await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }] });
  if (name === 'fin') {
    await s('Page.addScriptToEvaluateOnNewDocument', { source: finSeed });
  }
  await s('Page.addScriptToEvaluateOnNewDocument', { source: seed });
  await s('Page.navigate', { url });
  const ready = `new Promise((ok, ko) => { const t0 = Date.now(); const tick = () => document.querySelector('[aria-label^="Pour, +1"]') ? ok(true) : Date.now() - t0 > 30000 ? ko(new Error('Voter ne s’affiche pas')) : setTimeout(tick, 100); tick(); })`;
  await s('Runtime.evaluate', { expression: ready, awaitPromise: true });
  // Bridé après le chargement : on mesure Voter, pas le téléchargement du bundle.
  await s('Emulation.setCPUThrottlingRate', { rate: cpu });
  const { result, exceptionDetails } = await s('Runtime.evaluate', { expression: `(${scenario})(${JSON.stringify(name)})`, awaitPromise: true, returnByValue: true });
  await cdp.send('Target.disposeBrowserContext', { browserContextId });
  if (exceptionDetails) {
    throw new Error(`${name} : ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
  }
  return result.value;
}

const median = (values) => {
  const nums = values.filter((v) => typeof v === 'number').sort((a, b) => a - b);
  return nums.length ? nums[Math.floor(nums.length / 2)] : values[0];
};

const cdp = await devtools();
const results = {};
try {
  for (const dist of dists) {
    const server = await serve(dist);
    const url = `http://127.0.0.1:${server.address().port}${baseUrl}/`;
    for (const name of scenarios) {
      const all = [];
      for (let r = 0; r < runs; r++) {
        all.push(await measure(cdp, url, name));
        process.stderr.write('.');
      }
      const keys = Object.keys(all[0]);
      results[`${name} | ${dist.replace(`${root}/`, '')}`] = Object.fromEntries(keys.map((k) => [k, k === 'ecarts' ? all.flatMap((a) => a.ecarts) : median(all.map((a) => a[k]))]));
    }
    server.close();
  }
} finally {
  await cdp.close();
}
process.stderr.write('\n');
console.log(`CPU ×${cpu}, ${runs} passage(s), médianes${reducedMotion ? ', animations réduites' : ''}`);
console.table(Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { ...v, ecarts: v.ecarts.length }])));
if (args.json) {
  writeFileSync(args.json, JSON.stringify({ cpu, runs, reducedMotion, results }, null, 2));
}
