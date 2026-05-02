import React, { useState, useEffect } from 'react';
import { couponService } from '../../services/couponService';
import { promotionService } from '../../services/promotionService';

interface VoucherPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  currentShippingFee: number;
  selectedProductVoucher: any | null;
  selectedShippingVoucher: any | null;
  onSelectProductVoucher: (voucher: any | null) => void;
  onSelectShippingVoucher: (voucher: any | null) => void;
}

const VoucherPickerDrawer: React.FC<VoucherPickerDrawerProps> = ({
  isOpen,
  onClose,
  subtotal,
  selectedProductVoucher,
  selectedShippingVoucher,
  onSelectProductVoucher,
  onSelectShippingVoucher,
}) => {
  const [wallet, setWallet] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'product' | 'shipping'>('product');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        couponService.getMyWallet(),
        promotionService.getMyPromotionWallet(),
      ]).then(([couponRes, promoRes]) => {
        const couponItems = (couponRes.data || []).map((w: any) => ({ ...w, id: w.id || w._id }));
        const promoItems = (promoRes.data || []).map((w: any) => ({ ...w, id: w.id || w._id }));
        setWallet([...couponItems, ...promoItems]);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Normalize voucher_type: if type is 'free_shipping', it's always a shipping voucher regardless of voucher_type field
  const normalizeVoucherType = (v: any): 'product' | 'shipping' => {
    const vType = String(v.voucher_type || '').toLowerCase();
    const mechanic = String(v.type || '').toLowerCase();
    if (vType === 'shipping') return 'shipping';
    if (mechanic === 'free_shipping') return 'shipping';
    // Also catch titles/descriptions that clearly indicate shipping
    if (v.title && /v[aậ]n chuy[eể]n|ship/i.test(v.title)) return 'shipping';
    return 'product';
  };

  const walletWithType = wallet.map(v => ({ ...v, _resolved_type: normalizeVoucherType(v) }));
  const productVouchers = walletWithType.filter(v => v._resolved_type === 'product');
  const shippingVouchers = walletWithType.filter(v => v._resolved_type === 'shipping');

  console.log('[VoucherPicker] wallet:', wallet.length, 'product:', productVouchers.length, 'shipping:', shippingVouchers.length);
  console.log('[VoucherPicker] all voucher types:', wallet.map(v => ({ id: v.id || v._id, title: v.title, voucher_type: v.voucher_type, type: v.type, resolved: normalizeVoucherType(v) })));

  const isVoucherUsable = (v: any): { usable: boolean; reason: string } => {
    const now = Date.now();
    if (v.end_date && new Date(v.end_date).getTime() < now) return { usable: false, reason: 'Đã hết hạn' };
    if (v.start_date && new Date(v.start_date).getTime() > now) return { usable: false, reason: 'Chưa tới ngày áp dụng' };
    if (v.is_sold_out) return { usable: false, reason: 'Đã hết lượt' };
    if (v.user_claim_status === 'used') return { usable: false, reason: 'Đã sử dụng' };
    if (v.user_claim_status === 'expired') return { usable: false, reason: 'Đã hết hạn' };

    const minOrder = Number(v.min_order_amount || v.min_order_value || 0);
    if (v.voucher_type !== 'shipping' && subtotal < minOrder) {
      return { usable: false, reason: `Đơn tối thiểu ${minOrder.toLocaleString('vi-VN')}đ` };
    }
    if (v.voucher_type === 'shipping' && subtotal < minOrder) {
      return { usable: false, reason: `Đơn tối thiểu ${minOrder.toLocaleString('vi-VN')}đ` };
    }

    return { usable: true, reason: '' };
  };

  const calcDiscount = (v: any): string => {
    if (!v) return '0đ';
    const type = String(v.type || '').toLowerCase();
    const val = Number(v.discount_value || 0);
    if (type === 'percent') {
      const maxDiscount = Number(v.max_discount_amount || 0);
      const raw = (subtotal * val) / 100;
      const d = maxDiscount > 0 ? Math.min(raw, maxDiscount) : raw;
      return `-${Math.round(d).toLocaleString('vi-VN')}đ`;
    }
    if (type === 'free_shipping') return 'Miễn phí ship';
    return `-${val.toLocaleString('vi-VN')}đ`;
  };

  const renderVoucherCard = (v: any, type: 'product' | 'shipping') => {
    const id = v.id || v._id;
    const { usable, reason } = isVoucherUsable(v);
    const isSelected = type === 'product'
      ? (selectedProductVoucher?.id || selectedProductVoucher?._id) === id
      : (selectedShippingVoucher?.id || selectedShippingVoucher?._id) === id;

    const handleSelect = () => {
      if (!usable) return;
      if (type === 'product') {
        onSelectProductVoucher(isSelected ? null : v);
      } else {
        onSelectShippingVoucher(isSelected ? null : v);
      }
    };

    return (
      <div
        key={id}
        onClick={handleSelect}
        className={`flex items-stretch rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-lotteRed bg-red-50 shadow-md'
            : usable
              ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
        }`}
      >
        {/* Left strip */}
        <div className={`w-14 shrink-0 flex items-center justify-center ${
          type === 'shipping' ? 'bg-teal-500' : 'bg-lotteRed'
        } text-white`}>
          <span className="material-symbols-outlined text-2xl">
            {type === 'shipping' ? 'local_shipping' : 'card_giftcard'}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 p-3 min-w-0">
          <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{v.title || v.code}</h4>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{v.description || `Mã: ${v.code}`}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-bold text-lotteRed">{calcDiscount(v)}</span>
            {v.end_date && (
              <span className="text-[10px] text-gray-400">
                HSD: {new Date(v.end_date).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          {!usable && <p className="text-[10px] text-red-500 font-bold mt-1">{reason}</p>}
        </div>

        {/* Checkbox */}
        <div className="flex items-center pr-3">
          {usable ? (
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
              isSelected ? 'bg-lotteRed border-lotteRed' : 'border-gray-300'
            }`}>
              {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
            </div>
          ) : (
            <span className="material-symbols-outlined text-gray-300 text-lg">block</span>
          )}
        </div>
      </div>
    );
  };

  const currentList = activeTab === 'product' ? productVouchers : shippingVouchers;

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chọn voucher</h2>
            <p className="text-xs text-gray-500 mt-0.5">Chọn tối đa 1 voucher sản phẩm + 1 voucher vận chuyển</p>
          </div>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('product')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'product' ? 'border-lotteRed text-lotteRed' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
            Giảm giá ({productVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'shipping' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            Vận chuyển ({shippingVouchers.length})
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-3xl text-gray-300 mb-2">progress_activity</span>
              <p className="text-sm text-gray-400">Đang tải ví voucher...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">confirmation_number</span>
              <p className="font-bold text-gray-500 mb-1">
                {activeTab === 'product' ? 'Chưa có voucher giảm giá' : 'Chưa có voucher vận chuyển'}
              </p>
              <p className="text-sm text-gray-400">Hãy qua trang Khuyến mãi để nhận voucher</p>
            </div>
          ) : (
            currentList.map(v => renderVoucherCard(v, activeTab))
          )}
        </div>

        {/* Footer summary */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 dark:bg-slate-800 space-y-2">
          {selectedProductVoucher && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lotteRed text-base">card_giftcard</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-48">{selectedProductVoucher.title || selectedProductVoucher.code}</span>
              </div>
              <span className="font-bold text-green-600">{calcDiscount(selectedProductVoucher)}</span>
            </div>
          )}
          {selectedShippingVoucher && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500 text-base">local_shipping</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-48">{selectedShippingVoucher.title || selectedShippingVoucher.code}</span>
              </div>
              <span className="font-bold text-green-600">{calcDiscount(selectedShippingVoucher)}</span>
            </div>
          )}
          {!selectedProductVoucher && !selectedShippingVoucher && (
            <p className="text-sm text-gray-400 text-center">Chưa chọn voucher nào</p>
          )}
          <button
            onClick={onClose}
            className="w-full h-12 bg-lotteRed text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-base cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherPickerDrawer;
