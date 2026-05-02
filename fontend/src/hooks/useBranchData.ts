import { useMemo } from 'react';
import { useAppSelector } from '../store';

export const useBranchData = () => {
  const { currentBranch } = useAppSelector(state => state.branch);
  const { products, branchProducts, categories } = useAppSelector(state => state.product);

  const currentBranchId = currentBranch ? String(currentBranch.id || (currentBranch as any)._id) : null;

  // 1. Lấy danh sách branch_products của current branch
  const branchProductsData = useMemo(() => {
    if (!currentBranchId || !branchProducts) return [];
    return branchProducts.filter(bp => String(bp.branch_id) === currentBranchId && bp.is_active !== false && Number(bp.stock) > 0);
  }, [branchProducts, currentBranchId]);

  // 2. Chuyển thành danh sách sản phẩm đầy đủ đã join với bảng products
  const availableProducts = useMemo(() => {
    if (!branchProductsData.length || !products) return [];
    
    return products.map(product => {
      const branchProduct = branchProductsData.find(bp => String(bp.product_id) === String(product.id || (product as any)._id));
      if (!branchProduct) return null;
      
      return {
        ...product,
        price: branchProduct.price || 0,
        original_price: branchProduct.original_price || 0,
        discount_percent: branchProduct.discount_percent || 0,
        stock: branchProduct.stock || 0,
        is_new: branchProduct.is_new || false,
        is_best_seller: branchProduct.is_best_seller || false,
        branch_product_id: branchProduct.id || (branchProduct as any)._id,
        branchProduct
      };
    }).filter(Boolean);
  }, [products, branchProductsData]);

  // 3. Hàm lọc banner: Nếu banner có danh sách product_ids cụ thể, kiểm tra xem ít nhất 1 sản phẩm có bán ở chi nhánh hiện tại không
  const filterBanners = (banners: any[]) => {
    return banners.filter(banner => {
      if (!banner.is_active) return false;
      if (!banner.product_ids || banner.product_ids.length === 0) return true; // banner chung
      
      // Nếu banner gắn với các sản phẩm cụ thể, chi nhánh phải có bán ít nhất 1 sản phẩm đó mới hiện
      return banner.product_ids.some((pid: any) => branchProductsData.some(bp => String(bp.product_id) === String(pid)));
    });
  };

  return {
    currentBranchId,
    branchProductsData,
    availableProducts,
    filterBanners,
    categories
  };
};
