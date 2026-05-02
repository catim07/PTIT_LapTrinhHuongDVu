import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCartAsync } from '../slices/cartSlice';
import { toast } from '../components/Toast/toastEvent';
import viewHistoryService, { getViewHistory } from '../services/viewHistoryService';
import type { ViewHistoryItem } from '../types/viewHistory';

const ViewedHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { currentBranch } = useAppSelector((state) => state.branch);

  const [items, setItems] = useState<ViewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const branchId = currentBranch ? String(currentBranch.id || (currentBranch as any)?._id || '') : '';

  const getRowId = (item: ViewHistoryItem): string => {
    return String((item as any)._id || item.id || item.product_id || '');
  };

  const canAddToCart = (item: ViewHistoryItem): boolean => {
    const outOfStockByFlag = item.in_stock === false;
    const outOfStockByQty = typeof item.stock === 'number' && item.stock <= 0;
    return !outOfStockByFlag && !outOfStockByQty;
  };

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getViewHistory();
      console.log('HISTORY DATA', data);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Khong the tai lich su da xem. Vui long thu lai.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (id: string) => {
    setBusyIds((prev) => ({ ...prev, [id]: true }));
    try {
      await viewHistoryService.removeHistoryItem(id, { isAuthenticated, user });
      setItems((prev) => prev.filter((item) => getRowId(item) !== String(id) && String(item.id) !== String(id)));
      toast.success('Đã xóa khỏi lịch sử');
    } catch {
      toast.error('Không thể xóa khỏi lịch sử');
    } finally {
      setBusyIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đã xem?')) return;
    try {
      await viewHistoryService.clearHistory({ isAuthenticated, user });
      setItems([]);
      toast.success('Đã xóa toàn bộ lịch sử đã xem');
    } catch {
      toast.error('Không thể xóa lịch sử đã xem');
    }
  };

  const handleAddToCart = async (item: ViewHistoryItem) => {
    const rowId = getRowId(item);

    if (!branchId) {
      toast.error('Vui lòng chọn chi nhánh trước khi thêm giỏ hàng');
      return;
    }

    if (!canAddToCart(item)) {
      toast.warning('Sản phẩm hiện đang hết hàng');
      return;
    }

    const branchProductId = String(item.branch_product_id || '');
    if (!branchProductId) {
      toast.warning('Sản phẩm này chưa có dữ liệu bán tại chi nhánh');
      return;
    }

    const key = rowId || String(item.id || branchProductId);
    console.log('[ViewedHistory] add-to-cart request', {
      key,
      branchId,
      branch_product_id: branchProductId,
      product_id: item.product_id,
      in_stock: item.in_stock,
      stock: item.stock,
      price: item.price,
    });

    setBusyIds((prev) => ({ ...prev, [key]: true }));
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
      console.log('[ViewedHistory] add-to-cart success', { key, branch_product_id: branchProductId });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error: any) {
      console.error('[ViewedHistory] add-to-cart failed', {
        key,
        branchId,
        branch_product_id: branchProductId,
        error,
      });
      const message = typeof error === 'string' ? error : (error?.message || 'Không thể thêm vào giỏ hàng');
      toast.error(message);
    } finally {
      setBusyIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <div className="py-12 text-center font-bold">Đang tải lịch sử đã xem...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-sm font-medium">
          {error}
        </div>
        <button
          onClick={loadHistory}
          className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90"
        >
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">Lịch sử đã xem ({items.length})</h2>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
          >
            Xóa toàn bộ
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-10 text-center text-slate-500">
          Chưa có sản phẩm nào trong lịch sử đã xem.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const rowId = getRowId(item);
            const busy = Boolean(busyIds[rowId]);
            return (
              <div key={String((item as any)._id || item.product_id || rowId)} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                <Link to={`/products/${item.product_id || ''}`} className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={item.product_image || 'https://via.placeholder.com/300x300?text=Product'}
                    alt={item.product_name || 'product'}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id || ''}`} className="font-bold line-clamp-1 hover:text-primary">
                    {item.product_name || 'Sản phẩm'}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    Đã xem: {item.viewed_at ? new Date(item.viewed_at).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                  <p className="text-sm text-primary font-bold mt-1">{Number(item.price || 0).toLocaleString('vi-VN')}đ</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={busy || !canAddToCart(item)}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
                  >
                    Thêm giỏ
                  </button>
                  <button
                    onClick={() => handleRemove(String(item.id || rowId))}
                    disabled={busy}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewedHistory;
