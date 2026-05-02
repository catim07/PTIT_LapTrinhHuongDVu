import { dataService } from './dataService';

export const settingsService = {
  getAdminSettings: () => dataService.getAdminSettings(),
  updateAdminSettings: (payload: Record<string, unknown>) => dataService.updateAdminSettings(payload),
  resetAdminSettings: () => dataService.resetAdminSettings(),
  getPaymentProviders: () => dataService.getPaymentProviders(),
  updatePaymentProviders: (providers: unknown[]) => dataService.updatePaymentProviders(providers),
  getNotificationTemplates: () => dataService.getNotificationTemplates(),
  updateNotificationTemplate: (templateId: string | number, payload: Record<string, unknown>) => dataService.updateNotificationTemplate(String(templateId), payload),
  getLoyaltyRules: () => dataService.getLoyaltyRules(),
  updateLoyaltyRules: (rules: unknown[]) => dataService.updateLoyaltyRules(rules),
  getMembershipTiers: () => dataService.getMembershipTiers(),
};
