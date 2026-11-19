import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf-8'));
const hiddenSlugs = new Set(['bollywood', 'hollywood', 'web-series', 'star-wars']);
const visibleCategories = categories.filter(({ slug }) => !hiddenSlugs.has(slug));

export const getCategories = async (req, res) => {
  try {
    const list = visibleCategories.map(({ slug, name, group, description, image, items }) => ({
      slug,
      name,
      group,
      description,
      image,
      count: items ? items.length : 0
    }));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRandomItem = async (req, res) => {
  try {
    const allItems = visibleCategories.flatMap((c) =>
      (c.items || []).map((item) => ({
        slug: c.slug,
        categoryName: c.name,
        categoryImage: c.image,
        id: item.id,
        question: item.question,
        answer: item.answer
      }))
    );
    if (allItems.length === 0) {
      return res.status(404).json({ message: 'No questions found' });
    }
    const randomIndex = Math.floor(Math.random() * allItems.length);
    return res.json(allItems[randomIndex]);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = visibleCategories.find((c) => c.slug === slug);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
