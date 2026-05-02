import flashDealService from './flashDealService';

export const hotDealService = {
  getHotDeals: async (params?: Record<string, any>) => {
    return flashDealService.getFlashDeals(params, { forceRefresh: true, debug: true });
  },

  getHotDealById: async (id: string | number) => {
    return flashDealService.getFlashDealById(id);
  },

  createHotDeal: async (data: any) => {
    return flashDealService.createFlashDeal(data);
  },

  updateHotDeal: async (id: string, data: any) => {
    return flashDealService.updateFlashDeal(id, data);
  },

  deleteHotDeal: async (id: string) => {
    return flashDealService.deleteFlashDeal(id);
  },

  toggleHotDeal: async (id: string | number) => {
    return flashDealService.toggleFlashDeal(id);
  },
};
