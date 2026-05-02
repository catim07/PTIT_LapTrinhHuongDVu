import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCartAsync } from '../slices/cartSlice';
import { dataService } from '../services/dataService';
import { toast } from '../components/Toast/toastEvent';

const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentBranch } = useAppSelector((state) => state.branch);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const branchId = currentBranch ? String(currentBranch.id || (currentBranch as any)?._id || '') : '';

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const rows = await dataService.getWishlist();
      setItems(Array.isArray(rows) ? rows : []);
    } catch {
      toast.error('Không thể tải danh sách yêu thích');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (id: string) => {
    setProcessingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await dataService.removeWishlist(id);
      setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
      toast.success('Đã xóa khỏi yêu thích');
    } catch {
      toast.error('Không thể xóa sản phẩm yêu thích');
    } finally {
      setProcessingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAddToCart = async (item: any) => {
    if (!branchId) {
      toast.error('Vui lòng chọn chi nhánh trước khi thêm giỏ hàng');
      return;
    }

    const branchProductId = String(item.branch_product_id || '');
    if (!branchProductId) {
      toast.warning('Sản phẩm này chưa có dữ liệu bán tại chi nhánh');
      return;
    }

    const key = String(item.id || branchProductId);
    setProcessingIds((prev) => ({ ...prev, [key]: true }));
    try {
      await dispatch(addToCartAsync({
        branchId,
        branch_product_id: branchProductId,
        quantity: 1,
        price: Number(item.price || 0),
        unit_price: Number(item.price || 0),
        product_name: item.product_name || 'Sản phẩm',
        product_image: item.product_image || '',
      })).unwrap();
      toast.success('Đã thêm vào giỏ hàng');
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setProcessingIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ yêu thích?')) return;
    try {
      await dataService.clearWishlist();
      setItems([]);
      toast.success('Đã xóa toàn bộ danh sách yêu thích');
    } catch {
      toast.error('Không thể xóa danh sách yêu thích');
    }
  };

  if (loading) {
    return <div className="py-12 text-center font-bold">Đang tải danh sách yêu thích...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">Sản phẩm yêu thích ({items.length})</h2>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-10 text-center text-slate-500">
          Chưa có sản phẩm nào trong danh sách yêu thích.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const rowId = String(item.id || item.branch_product_id || item.product_id);
            const busy = Boolean(processingIds[rowId]);
            return (
              <div key={rowId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex gap-4">
                <Link to={`/products/${item.product_id || ''}`} className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={item.product_image || 'https://via.placeholder.com/200'}
                    alt={item.product_name || 'product'}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id || ''}`} className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-primary">
                    {item.product_name || 'Sản phẩm'}
                  </Link>
                  <p className="mt-2 text-primary font-extrabold">
                    {Number(item.price || 0).toLocaleString('vi-VN')}đ
                  </p>
                  <p className={`text-xs mt-1 ${item.in_stock ? 'text-green-600' : 'text-red-500'}`}>
                    {item.in_stock ? `Còn hàng: ${Number(item.stock || 0)}` : 'Tạm hết hàng'}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={busy || !item.in_stock}
                      className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                      Thêm giỏ
                    </button>
                    <button
                      onClick={() => handleRemove(String(item.id))}
                      disabled={busy}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
