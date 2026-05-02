import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { orderId?: string; reason?: string } || {};

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 lg:px-40">
        <div className="max-w-[480px] w-full flex flex-col items-center text-center gap-8">
          <div className="relative">
            <div className="flex items-center justify-center size-32 rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-primary text-6xl">error</span>
            </div>
            <div className="absolute -bottom-2 -right-2 size-10 bg-white dark:bg-background-dark rounded-full flex items-center justify-center shadow-lg border border-primary/20">
              <span className="material-symbols-outlined text-primary text-xl">warning</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Thanh toán thất bại</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              Rất tiếc, giao dịch của bạn không thể hoàn tất. {state.reason || 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác. Nếu tiền đã bị trừ, vui lòng liên hệ hỗ trợ.'}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button onClick={() => navigate('/payment')} className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-white text-base font-bold tracking-wide hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              Thử lại ngay
            </button>
            <button onClick={() => navigate('/cart')} className="flex h-14 w-full items-center justify-center rounded-xl bg-primary/10 text-primary text-base font-bold tracking-wide hover:bg-primary/20 transition-colors">
              Quay về giỏ hàng
            </button>
          </div>

          <div className="w-full mt-4">
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-primary/20 bg-white dark:bg-background-dark/50 p-6 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-1 text-left">
                <p className="text-slate-900 dark:text-slate-100 text-base font-bold">Cần hỗ trợ gấp?</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Liên hệ với đội ngũ CSKH 24/7</p>
              </div>
              <a href="tel:18001234" className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all">
                Gọi 1800 1234
                <span className="material-symbols-outlined text-sm">call</span>
              </a>
            </div>
          </div>

          {state.orderId && (
            <div className="flex flex-col gap-6 w-full pt-8 border-t border-primary/10">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Chi tiết lỗi</p>
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex justify-between items-center py-2 border-b border-primary/5">
                  <span className="text-slate-500 text-sm">Mã đơn hàng:</span>
                  <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">#{state.orderId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary/5">
                  <span className="text-slate-500 text-sm">Thời gian:</span>
                  <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{new Date().toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;