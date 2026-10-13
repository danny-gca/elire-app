const fs = require('fs');
const path = require('path');

const candidates = [
  { id: 'edouard-philippe', wiki: 'Édouard_Philippe' },
  { id: 'gabriel-attal', wiki: 'Gabriel_Attal' },
  { id: 'marine-le-pen', wiki: 'Marine_Le_Pen' },
  { id: 'jean-luc-melenchon', wiki: 'Jean-Luc_Mélenchon' },
  { id: 'raphael-glucksmann', wiki: 'Raphaël_Glucksmann' },
  { id: 'marine-tondelier', wiki: 'Marine_Tondelier' },
  { id: 'bruno-retailleau', wiki: 'Bruno_Retailleau' },
  { id: 'francois-ruffin', wiki: 'François_Ruffin' },
  { id: 'fabien-roussel', wiki: 'Fabien_Roussel' },
  { id: 'eric-zemmour', wiki: 'Éric_Zemmour' },
  { id: 'nathalie-arthaud', wiki: 'Nathalie_Arthaud' },
  { id: 'francois-asselineau', wiki: 'François_Asselineau' },
  { id: 'nicolas-dupont-aignan', wiki: 'Nicolas_Dupont-Aignan' },
  { id: 'david-lisnard', wiki: 'David_Lisnard' },
  { id: 'helene-thouy', wiki: 'Hélène_Thouy' },
  { id: 'jean-lassalle', wiki: 'Jean_Lassalle' },
  { id: 'antoine-mikolajczak', wiki: 'Équinoxe_(parti_politique)' },
];

const destDir = path.resolve(__dirname, '..', 'assets', 'images', 'candidates');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const USER_AGENT = 'ElireApp/1.0 (https://github.com/danny-gca/elire-app)';

async function fetchWikiPhoto(c) {
  const apiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(c.wiki)}`;
  const resp = await fetch(apiUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!resp.ok) throw new Error(`API Wikipedia: ${resp.status}`);
  const json = await resp.json();
  const sourceUrl = json.thumbnail && json.thumbnail.source;
  if (!sourceUrl) throw new Error('Pas de vignette trouvée');

  const imgResp = await fetch(sourceUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!imgResp.ok) throw new Error(`Téléchargement image: ${imgResp.status}`);

  const buffer = Buffer.from(await imgResp.arrayBuffer());
  const destPath = path.join(destDir, `${c.id}.jpg`);
  fs.writeFileSync(destPath, buffer);
  return sourceUrl;
}

async function main() {
  console.log('📥 Récupération des portraits officiels depuis Wikipedia...');
  const candidatsFile = path.resolve(__dirname, '..', 'data', 'candidats.json');
  const candidatsData = JSON.parse(fs.readFileSync(candidatsFile, 'utf-8'));

  for (const c of candidates) {
    try {
      const url = await fetchWikiPhoto(c);
      console.log(`  ✓ ${c.id}.jpg téléchargé`);

      const found = candidatsData.find((cand) => cand.id === c.id);
      if (found) {
        found.photoUrl = url;
      }
    } catch (e) {
      console.warn(`  ✗ ${c.id}: ${e.message}`);
    }
  }

  fs.writeFileSync(candidatsFile, JSON.stringify(candidatsData, null, 2), 'utf-8');
  console.log('✅ Synchronisation des photos terminée.');
}

main();
