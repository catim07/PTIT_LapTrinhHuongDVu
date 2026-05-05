import httpClient from '../api/httpClient';
import { endpoints } from '../api/endpoints';

export const recipeService = {
  getRecipes: async (limit = 20) => {
    const response = await httpClient.get(endpoints.recipes.list, { params: { limit } });
    return response.data;
  },

  searchRecipes: async (query: string) => {
    const response = await httpClient.get(endpoints.recipes.search, { params: { q: query } });
    return response.data;
  },

  getRecipeByName: async (name: string) => {
    const response = await httpClient.get(endpoints.recipes.byName(name));
    return response.data;
  },

  getRecipeById: async (id: string) => {
    const response = await httpClient.get(endpoints.recipes.detail(id));
    return response.data;
  },

  generateRecipe: async (payload: { dishName: string; servings: number; appetite: string }) => {
    // AI generation can take 15-30 seconds — use extended timeout
    const response = await httpClient.post(endpoints.recipes.generate, payload, {
      timeout: 60000, // 60s timeout for AI generation
    });
    return response.data;
  }
};
