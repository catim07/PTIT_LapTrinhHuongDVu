import { dataService } from './dataService';

export const inventoryService = {
  listBranchProducts: (branchId?: string) => dataService.getBranchProducts(branchId),
  listAllBranchProducts: () => dataService.getAllBranchProducts(),
  getBranchProductDetail: (id: string | number) => dataService.getBranchProduct(id),
  createBranchProduct: (payload: Record<string, unknown>) => dataService.createBranchProduct(payload),
  updateBranchProduct: (id: string | number, payload: Record<string, unknown>) => dataService.updateBranchProduct(id, payload),
  deleteBranchProduct: (id: string | number) => dataService.deleteBranchProduct(id),
  adjustStock: (id: string | number, quantityChange: number, reason: string) => dataService.adjustStock(id, quantityChange, reason),
};
