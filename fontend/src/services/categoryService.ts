import { productService } from './productService';

export const categoryService = {
  list: () => productService.getCategories(),
};

export default categoryService;
