import { dataService } from './dataService';

export const branchService = {
  list: () => dataService.getBranches(),
  getDetail: (id: string | number) => dataService.getBranchById(id),
};
