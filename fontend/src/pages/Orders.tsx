import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loadOrders } from '../slices/orderSlice';

const Orders: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data: orders, status } = useAppSelector(state => state.order);
    const { user } = useAppSelector(state => state.auth);
    const { branches } = useAppSelector(state => state.branch);
    const [filter, setFilter] = React.useState('ALL');

    useEffect(() => {
        if (user && status === 'idle') {
            dispatch(loadOrders(undefined));
        }
    }, [user, status, dispatch]);

    const getBranchName = (branchId: string, branchName?: string) => {
        if (branchName) return branchName;
        const branch = branches.find(b => String(b.id) === String(branchId) || String((b as any)?._id) === String(branchId) || b.code === branchId);
        return branch ? branch.name : `Chi nhánh (${branchId})`;
    };

    const filteredOrders = orders.filter((o: any) => {
        if (filter === 'ALL') return true;
        if (filter === 'SHIPPING' && ['PROCESSING', 'SHIPPING'].includes(o.status)) return true;
        if (filter === 'COMPLETED' && ['COMPLETED', 'DELIVERED'].includes(o.status)) return true;
        if (filter === 'CANCELLED' && ['CANCELLED', 'RETURNED'].includes(o.status)) return true;
        return false;
    });

  return (
    <>
        <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Đơn hàng của tôi</h2>
                  <div className="flex border-b border-primary/10 overflow-x-auto no-scrollbar">
                    {['ALL', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((tab) => (
                      <button key={tab} onClick={() => setFilter(tab)} className={`px-6 py-3 border-b-2 whitespace-nowrap ${filter === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-primary transition-colors'}`}>
                        {tab === 'ALL' ? 'Tất cả' : tab === 'SHIPPING' ? 'Đang giao' : tab === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                      </button>
                    ))}
                  </div>
                </div>

                {status === 'loading' && (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">progress_activity</span>
                    <p className="text-slate-500 font-bold">Đang tải đơn hàng...</p>
                  </div>
                )}

                {status === 'succeeded' && filteredOrders.length === 0 && (
                    <div className="text-center py-20 flex flex-col items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-5xl mb-4 opacity-50">shopping_bag</span>
                        <p className="font-bold">Không có đơn hàng nào.</p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                  {filteredOrders.map((order: any) => (
                      <div key={order.id} className={`bg-white dark:bg-background-dark/50 rounded-xl p-5 shadow-sm border border-primary/5 flex flex-col md:flex-row gap-6 items-start ${order.status === 'CANCELLED' || order.status === 'RETURNED' ? 'opacity-75' : ''}`}>
                      <div className={`w-full md:w-32 aspect-square rounded-lg bg-primary/5 flex items-center justify-center overflow-hidden ${(order.status === 'CANCELLED' || order.status === 'RETURNED') ? 'grayscale' : ''}`}>
                        <img alt="Order item" className="w-full h-full object-cover" src={order.items?.[0]?.product_image || "https://via.placeholder.com/150"} />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${['COMPLETED', 'DELIVERED'].includes(order.status) ? 'bg-green-100 text-green-800' : ['CANCELLED', 'RETURNED'].includes(order.status) ? 'bg-slate-100 text-slate-800' : 'bg-blue-100 text-blue-800'}`}>
                              {order.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'HOÀN THÀNH' : order.status === 'CANCELLED' ? 'ĐÃ HỦY' : order.status === 'PROCESSING' || order.status === 'SHIPPING' ? 'ĐANG GIAO' : 'ĐANG CHỜ'}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Đơn hàng #{order.id}</h3>
                          </div>
                          <p className="text-lg font-bold text-primary">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-500 mb-6">
                          <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</div>
                          <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">inventory_2</span>{(order.items || []).reduce((s: number, i: any) => s + i.quantity, 0)} sản phẩm</div>
                          <div className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-sm">storefront</span>{getBranchName(order.branch_id, order.branch_name)}</div>
                        </div>
                        <div className="flex justify-end border-t border-primary/5 pt-4">
                          <Link to={`/account/orders/${order.id}`} className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                            Xem chi tiết đơn hàng <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
    </>
  );
};

export default Orders;