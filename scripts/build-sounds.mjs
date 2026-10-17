// Fabrique les sons de l'app (assets/sounds/*.m4a) avec ffmpeg, à partir de bruit filtré, de sinus et de voix synthétiques : aucun enregistrement tiers.
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
  const wav = path.join(os.tmpdir(), `elire-${name}.wav`);
  fs.writeFileSync(wav, pcm);
  const out = path.join(DIR, `${name}.m4a`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-af', filter, '-ar', '44100', '-c:a', 'aac', '-b:a', bitrate, out]);
  fs.rmSync(wav);
  console.log(`✅ ${name} (${(fs.statSync(out).size / 1024).toFixed(1)} Ko)`);
}

// Brouhaha d'hémicycle : une foule de voix synthétiques (hauteur, syllabes, voyelles), noyée dans la salle. Boucle sans raccord.
const RATE = 22050;
const LOOP_S = 12;
let seed = 61;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const between = (a, b) => a + rand() * (b - a);
// Formants (F1, F2, F3) de voyelles françaises : a, é, è, i, o, ou, u, eu.
const VOWELS = [[750, 1400, 2600], [400, 2100, 2700], [550, 1800, 2500], [300, 2300, 3000], [450, 900, 2500], [320, 800, 2300], [300, 1800, 2200], [420, 1500, 2400]];

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

const BANDWIDTHS = [110, 160, 220];

// Arrondit le saut de la dent de scie (PolyBLEP) : sans lui, il crée des aigus parasites qui salissent la foule.
function polyBlep(t, dt) {
  if (t < dt) {
    const x = t / dt;
    return x + x - x * x - 1;
  }
  if (t > 1 - dt) {
    const x = (t - 1) / dt;
    return x * x + x + x + 1;
  }
  return 0;
}

function voice(total) {
  const out = new Float32Array(total);
  const f0 = between(85, 190);
  const far = rand();
  const vibrato = between(4.5, 6);
  const vphase = rand() * Math.PI * 2;
  const filters = [resonator(), resonator(), resonator()];
  const formants = [...VOWELS[Math.floor(rand() * VOWELS.length)]];
  formants.forEach((f, j) => filters[j].tune(f, BANDWIDTHS[j]));
  let phase = 0;
  let prev = 0;
  let soft = 0;
  let air = 0;
  // Une voix n'est jamais tout à fait stable : hauteur et souffle dérivent un peu (moins « robot »).
  let drift = 0;
  let shimmer = 1;
  let t = Math.floor(between(0, RATE));
  while (t < total) {
    // Une phrase de 2 à 7 syllabes, puis un silence.
    const syllables = Math.floor(between(2, 8));
    for (let k = 0; k < syllables && t < total; k++) {
      const len = Math.floor(between(0.14, 0.3) * RATE);
      const target = VOWELS[Math.floor(rand() * VOWELS.length)];
      const pitch = f0 * between(0.88, 1.15);
      const fall = between(-0.12, 0.05);
      for (let i = 0; i < len && t + i < total; i++) {
        // Les voyelles glissent l'une vers l'autre (40 ms environ) au lieu de sauter : c'est la parole, pas un synthé.
        if (i % 32 === 0) {
          formants.forEach((f, j) => {
            formants[j] = f + (target[j] - f) * 0.3;
            filters[j].tune(formants[j], BANDWIDTHS[j]);
          });
        }
        const u = i / len;
        const env = Math.min(1, u * 10) * Math.min(1, (1 - u) * 4);
        drift += (rand() - 0.5) * 0.002 - drift * 0.001;
        shimmer += (rand() - 0.5) * 0.02 - (shimmer - 1) * 0.01;
        const wobble = 1 + 0.012 * Math.sin((2 * Math.PI * vibrato * (t + i)) / RATE + vphase) + drift;
        const inc = (pitch * (1 + fall * u) * wobble) / RATE;
        phase += inc;
        // Cordes vocales : dent de scie dérivée, adoucie, avec un souffle continu (une voix a de l'air).
        const saw = 2 * (phase % 1) - 1 - polyBlep(phase % 1, inc);
        const pulse = saw - prev * 0.85;
        prev = saw;
        soft += 0.2 * (pulse - soft);
        air += 0.5 * (rand() * 2 - 1 - air);
        // Consonne au début de la syllabe : un souffle bref.
        const breath = u < 0.15 ? (rand() * 2 - 1) * 0.6 * (1 - u / 0.15) : 0;
        const x = soft * 0.75 + air * 0.28 + breath;
        out[t + i] += env * shimmer * (filters[0](x) + filters[1](x) * 0.8 + filters[2](x) * 0.45);
      }
      t += len + Math.floor(between(0.02, 0.07) * RATE);
    }
    t += Math.floor(between(0.3, 1.4) * RATE);
  }
  // Les voix lointaines sont plus sourdes et plus faibles.
  let lp = 0;
  const k = 0.3 + 0.5 * (1 - far);
  for (let i = 0; i < total; i++) {
    lp += k * (out[i] - lp);
    out[i] = lp * (0.3 + 0.7 * (1 - far));
  }
  return out;
}

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

function brouhaha() {
  const fade = RATE;
  const total = LOOP_S * RATE + fade;
  const mix = new Float32Array(total);
  for (let v = 0; v < 24; v++) {
    voice(total).forEach((x, i) => (mix[i] += x));
  }
  // La salle respire : la rumeur enfle et retombe doucement (période de 6 s, la boucle reste sans raccord).
  const wet = room(mix).map((y, i) => y * (1 + 0.15 * Math.sin((2 * Math.PI * i) / (6 * RATE))));
  // Raccord de boucle : la dernière seconde se fond dans ce qui précède le début, la boucle reprend sans saut.
  const loop = new Float32Array(LOOP_S * RATE);
  for (let i = 0; i < loop.length; i++) {
    loop[i] = wet[i + fade];
  }
  for (let i = 0; i < fade; i++) {
    const u = i / fade;
    loop[loop.length - fade + i] = wet[loop.length + i] * (1 - u) + wet[i] * u;
  }
  encode('brouhaha', loop, RATE, 0.6, `asetrate=${Math.round(RATE * 0.85)},aresample=44100,highpass=f=170,equalizer=f=320:t=o:w=1.2:g=-4,lowpass=f=2200`, '96k');
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
brouhaha();
woosh('feuille-1', 0.45, 1700, 11);
woosh('feuille-2', 0.4, 1900, 12);
