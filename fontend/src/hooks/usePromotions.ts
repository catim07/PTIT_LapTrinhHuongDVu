import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromotions, fetchHotDeals, setFilters } from '../slices/promotionsSlice';

export const usePromotions = () => {
  const dispatch = useAppDispatch();
  const { data, hotDeals, status, error, filters } = useAppSelector(state => state.promotions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPromotions());
      dispatch(fetchHotDeals());
    }
  }, [status, dispatch]);

  const refresh = () => {
    dispatch(fetchPromotions());
    dispatch(fetchHotDeals());
  };

  const updateFilters = (newFilters: Parameters<typeof setFilters>[0]) => {
    dispatch(setFilters(newFilters));
  };

  // Process filters
  const filteredData = [...data];

  if (filters.category && filters.category !== 'Tất cả') {
    // Just a basic mock for demonstration
    // If Promotions had real category, we would filter here.
  }

  // Example sorting
  if (filters.sort) {
    if (filters.sort === 'Mới nhất') {
      filteredData.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime());
    } else if (filters.sort === 'Giảm nhiều nhất') {
      filteredData.sort((a, b) => (b.value || 0) - (a.value || 0));
    } else if (filters.sort === 'Sắp hết hạn') {
      filteredData.sort((a, b) => new Date(a.end_date || 0).getTime() - new Date(b.end_date || 0).getTime());
    }
  }

  return {
    promotions: filteredData,
    hotDeals,
    loading: status === 'loading',
    error,
    filters,
    refresh,
    updateFilters
  };
};
