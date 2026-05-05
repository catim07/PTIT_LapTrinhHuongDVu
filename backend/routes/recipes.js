import express from 'express';
import { getRecipes, searchRecipes, getRecipeByName, getRecipeById, generateUserRecipe } from '../controllers/recipeController.js';

const router = express.Router();

router.get('/', getRecipes);
router.get('/search', searchRecipes);
router.get('/by-name/:name', getRecipeByName);
router.post('/generate', generateUserRecipe);
router.get('/:id', getRecipeById);

export default router;
