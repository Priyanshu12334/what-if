import express from 'express';
import auth from '../middleware/auth.js';
import { getCategories, getRandomItem, getCategoryBySlug } from '../controllers/exploreController.js';

const router = express.Router();

router.use(auth);

router.get('/', getCategories);
router.get('/random', getRandomItem);
router.get('/:slug', getCategoryBySlug);

export default router;
