import { dataService } from './dataService';

export const loyaltyService = {
  getTransactions: () => dataService.getLoyaltyTransactions(),
  getRules: () => dataService.getLoyaltyRules(),
  updateRules: (rules: any[]) => dataService.updateLoyaltyRules(rules),
};
