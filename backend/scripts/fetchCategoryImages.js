import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUERIES = {
  'avengers': 'new york skyline sunset storm',
  'Marvel & Avengers': 'new york skyline sunset storm',
  'dc': 'city skyline night rain',
  'DC Universe': 'city skyline night rain',
  'bollywood': 'Mumbai Gateway of India',
  'Bollywood': 'Mumbai Gateway of India',
  'hollywood': 'cinema theater seats',
  'Hollywood & Cinema': 'cinema theater seats',
  'harry-potter': 'old castle scotland mist',
  'Harry Potter': 'old castle scotland mist',
  'star-wars': 'desert dunes sunset',
  'Star Wars': 'desert dunes sunset',
  'web-series': 'watching tv dark room',
  'Web Series & TV': 'watching tv dark room',
  'anime': 'Tokyo neon street night',
  'Anime Legends': 'Tokyo neon street night',
  'cartoons': 'colorful pencils sketch desk',
  'Cartoons & Animation': 'colorful pencils sketch desk',
  'ramayana': 'diya oil lamps India',
  'Ramayana': 'diya oil lamps India',
  'mahabharata': 'Konark sun temple wheel',
  'Mahabharata': 'Konark sun temple wheel',
  'indian-mythology': 'Indian temple carvings',
  'Indian Mythology': 'Indian temple carvings',
  'science': 'microscope laboratory',
  'Science & Nature': 'microscope laboratory',
  'space': 'nebula galaxy night sky',
  'Space & Cosmos': 'nebula galaxy night sky',
  'history': 'old world map',
  'Alternative History': 'old world map',
  'technology': 'circuit board technology',
  'Technology & Future': 'circuit board technology'
};

const resolveCategoriesPath = () => {
  const candidates = [
    path.resolve(__dirname, '../src/data/categories.json'),
    path.resolve(__dirname, '../../backend/src/data/categories.json'),
    path.resolve(process.cwd(), 'src/data/categories.json'),
    path.resolve(process.cwd(), 'backend/src/data/categories.json')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
};

const resolveFrontendDir = () => {
  const candidates = [
    path.resolve(__dirname, '../../whatif-frontend/public/categories'),
    path.resolve(__dirname, '../../frontend/public/categories'),
    path.resolve(process.cwd(), '../whatif-frontend/public/categories'),
    path.resolve(process.cwd(), '../frontend/public/categories'),
    path.resolve(process.cwd(), 'whatif-frontend/public/categories'),
    path.resolve(process.cwd(), 'frontend/public/categories')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
};

const main = async () => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error('PEXELS_API_KEY is missing');
    process.exit(1);
  }

  const categoriesPath = resolveCategoriesPath();
  const frontendDir = resolveFrontendDir();
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const targetSlug = process.argv[2];
  const targetResultIndex = process.argv[3] ? parseInt(process.argv[3], 10) : 0;

  const toProcess = targetSlug
    ? categories.filter((c) => c.slug === targetSlug || c.name.toLowerCase() === targetSlug.toLowerCase())
    : categories;

  if (targetSlug && toProcess.length === 0) {
    console.error(`Category not found: ${targetSlug}`);
    process.exit(1);
  }

  const creditsPath = path.join(frontendDir, 'CREDITS.md');
  const creditsMap = new Map();

  if (fs.existsSync(creditsPath)) {
    const existing = fs.readFileSync(creditsPath, 'utf8');
    for (const line of existing.split('\n')) {
      const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*\[?([^|\]]+)\]?.*\|$/);
      if (match && match[1] !== 'Slug' && !match[1].startsWith('---')) {
        creditsMap.set(match[1].trim(), {
          slug: match[1].trim(),
          photographer: match[2].trim(),
          url: match[3].trim()
        });
      }
    }
  }

  for (const cat of toProcess) {
    const query = QUERIES[cat.slug] || QUERIES[cat.name] || cat.name;
    const resultIndex = targetSlug ? targetResultIndex : 0;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=8`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: apiKey }
      });

      if (!res.ok) {
        console.error(`Request failed for ${cat.slug}`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const data = await res.json();
      const photos = data.photos || data.results || [];
      const photo = photos[resultIndex];

      if (!photo) {
        console.error(`No results for ${cat.slug}`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const imgUrl = photo.src?.large2x || photo.src?.large || photo.src?.original;
      if (!imgUrl) {
        console.error(`No image URL for ${cat.slug}`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) {
        console.error(`Failed to download ${cat.slug}`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(path.join(frontendDir, `${cat.slug}.jpg`), buffer);

      cat.image = `/categories/${cat.slug}.jpg`;
      creditsMap.set(cat.slug, {
        slug: cat.slug,
        photographer: photo.photographer || 'Unknown',
        url: photo.url || photo.src?.original || 'https://www.pexels.com'
      });
      console.log(`Saved ${cat.slug}.jpg`);
    } catch (err) {
      console.error(`Error for ${cat.slug}: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2) + '\n');

  let creditsContent = '# Photo Credits\n\n| Slug | Photographer | Pexels URL |\n| --- | --- | --- |\n';
  for (const item of creditsMap.values()) {
    creditsContent += `| ${item.slug} | ${item.photographer} | [${item.url}](${item.url}) |\n`;
  }
  fs.writeFileSync(creditsPath, creditsContent);
};

main();
