import React, { useEffect, useState } from 'react';
import { adminAnalyticsService } from '../../services/adminAnalyticsService';
import type { DashboardSummary, RevenueSeries, RecentOrder, ProductItem, BranchPerformance, SupportOverview } from '../../services/adminAnalyticsService';
import { dataService } from '../../services/dataService';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSeries[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);
  const [topBranches, setTopBranches] = useState<BranchPerformance[]>([]);
  const [support, setSupport] = useState<SupportOverview | null>(null);
  
  // Operational Alerts state
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<any[]>([]);

  const [timeFilter, setTimeFilter] = useState('30d');

  const { adminBranchId } = useAppSelector((s) => s.adminAuth);
  const currentBranchId = adminBranchId === 'ALL' ? 'all' : adminBranchId;
  
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await adminAnalyticsService.getDashboardData(timeFilter, currentBranchId);
      
      // Fetch operational alerts based on branch
      const lowStock = await dataService.getLowStock(currentBranchId);
      const expiring = await dataService.getExpiringSoon(currentBranchId);
      setLowStockProducts(Array.isArray(lowStock) ? lowStock : []);
      setExpiringProducts(Array.isArray(expiring) ? expiring : []);
      setSummary(data.summary);
      setRevenue(data.revenueSeries);
      setRecentOrders(data.recentOrders);
      setTopProducts(data.topProducts);
      setTopBranches(data.topBranches);
      setSupport(data.support);
      setError(null);
    } catch (err: any) {
      setError(err.message || t('adminDash.systemError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter, currentBranchId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">{t('adminDash.loadingReport')}</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 p-6 rounded-2xl w-full max-w-md">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
          <h3 className="text-lg font-bold text-on-surface">{t('adminDash.systemError')}</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button onClick={fetchData} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-sm hover:bg-primary-container">{t('adminDash.retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Dashboard Header Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">{t('adminDash.title')}</h2>
            <p className="text-slate-500 text-sm mt-1">{t('adminDash.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-surface-container-high p-1 rounded-xl">
              <button onClick={() => setTimeFilter('today')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'today' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}>Today</button>
              <button onClick={() => setTimeFilter('7d')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === '7d' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}>7d</button>
              <button onClick={() => setTimeFilter('30d')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === '30d' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}>30d</button>
            </div>
            <button
              onClick={() => {
                const lines = [
                  `Lotte Mart Dashboard Report - ${new Date().toLocaleDateString('vi-VN')}`,
                  ``,
                  `Doanh thu,${summary.sales.value},VND,Thay đổi,+${summary.sales.change}%`,
                  `Đơn hàng,${summary.orders.value},,Thay đổi,+${summary.orders.change}%`,
                  `Khách hàng,${summary.customers.value},,Mới tháng này,${summary.customers.newThisMonth}`,
                  `Tỷ lệ CR,${summary.cr.value}%,,Thay đổi,${summary.cr.change}%`,
                  ``,
                  `Doanh thu theo tháng`,
                  `Tháng,In-Store,Online`,
                  ...revenue.map(r => `${r.month},${r.inStore},${r.online}`),
                  ``,
                  `Top sản phẩm bán chạy`,
                  `Tên,Giá,Đã bán`,
                  ...topProducts.map(p => `"${p.name}",${p.price},${p.soldCount}`),
                ];
                const csv = lines.join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-primary text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              {t('adminDash.exportReport')}
            </button>
            <button onClick={fetchData} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors" title="Làm mới">
              <span className="material-symbols-outlined text-slate-600">refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales */}
          <div onClick={() => navigate('/admin/orders')} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[100px]">payments</span>
            </div>
            <div className="flex justify-between items-start z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('adminDash.sales')}</p>
              <span className="material-symbols-outlined text-red-600 bg-red-50 p-1.5 rounded-lg">payments</span>
            </div>
            <div className="z-10">
              <h3 className="text-3xl font-black text-on-surface">{summary.sales.value.toLocaleString()} ₫</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+{summary.sales.change}%</span>
                <span className="text-slate-400 font-medium ml-1">{t('adminDash.vsLastPeriod')}</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div onClick={() => navigate('/admin/orders')} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[100px]">shopping_basket</span>
            </div>
            <div className="flex justify-between items-start z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('adminDash.orders')}</p>
              <span className="material-symbols-outlined text-slate-600 bg-slate-100 p-1.5 rounded-lg">shopping_basket</span>
            </div>
            <div className="z-10">
              <h3 className="text-3xl font-black text-on-surface">{summary.orders.value.toLocaleString()}</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+{summary.orders.change}%</span>
                <span className="text-slate-400 font-medium ml-1">{t('adminDash.vsYesterday')}</span>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div onClick={() => navigate('/admin/customers')} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[100px]">person_add</span>
            </div>
            <div className="flex justify-between items-start z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('adminDash.customers')}</p>
              <span className="material-symbols-outlined text-slate-600 bg-slate-100 p-1.5 rounded-lg">person_add</span>
            </div>
            <div className="z-10">
              <h3 className="text-3xl font-black text-on-surface">{summary.customers.value.toLocaleString()}</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                <span className="material-symbols-outlined text-sm">group</span>
                <span className="text-emerald-600">+{summary.customers.newThisMonth}</span>
                <span className="font-medium ml-1">{t('adminDash.newThisMonth')}</span>
              </div>
            </div>
          </div>

          {/* CR */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between h-40 group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[100px]">ads_click</span>
            </div>
            <div className="flex justify-between items-start z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('adminDash.conversionRate')}</p>
              <span className="material-symbols-outlined text-slate-600 bg-slate-100 p-1.5 rounded-lg">ads_click</span>
            </div>
            <div className="z-10">
              <h3 className="text-3xl font-black text-on-surface">{summary.cr.value}%</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mt-1">
                <span className="material-symbols-outlined text-sm">trending_down</span>
                <span>{summary.cr.change}%</span>
                <span className="text-slate-400 font-medium ml-1">{t('adminDash.thresholdDrop')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Revenue Overview Chart */}
          <div className="xl:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h4 className="text-xl font-bold text-on-surface">{t('adminDash.revenueOverview')}</h4>
                <p className="text-slate-500 text-sm">{t('adminDash.monthlyComparison')}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <span className="text-xs font-semibold text-slate-600">{t('adminDash.inStore')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                  <span className="text-xs font-semibold text-slate-600">{t('adminDash.online')}</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4 relative">
              <div className="w-full flex items-end justify-between px-2 h-56 border-b border-slate-100 relative">
                {revenue.map((item, idx) => {
                  // calculate a relative height percentage for visuals (max 100%)
                  const maxVal = Math.max(...revenue.map(r => r.inStore + r.online));
                  const total = item.inStore + item.online;
                  const heightPct = total > 0 ? (total / maxVal) * 100 : 0;
                  // Ratio
                  const inStorePct = total > 0 ? (item.inStore / total) * 100 : 0;

                  return (
                    <div key={idx} className="h-full w-[8%] relative group flex flex-col justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold">
                         Total: {total.toLocaleString()} ₫
                      </div>
                      
                      <div style={{ height: `${heightPct}%` }} className="w-full flex items-end relative rounded-t-lg bg-slate-100 overflow-hidden">
                        <div style={{ height: `${inStorePct}%` }} className="absolute bottom-0 w-full bg-red-600 hover:bg-red-500 transition-colors cursor-pointer"></div>
                      </div>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="xl:col-span-1 bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-on-surface">{t('adminDash.recentOrders')}</h4>
              <button onClick={() => navigate('/admin/orders')} className="text-xs font-bold text-red-600 hover:underline">{t('adminDash.viewAll')}</button>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <p className="text-sm">{t('adminDash.noOrders')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentOrders.map((order, i) => (
                  <div key={i} onClick={() => navigate('/admin/orders')} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{order.id}</p>
                        <p className="text-[11px] text-slate-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">{order.amount.toLocaleString()} ₫</p>
                      
                      {/* Dynamic i18n Status Rendering thay vì Hard-Code */}
                      {order.status === 'PENDING' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">{t(`orderStatuses.${order.status}`)}</span>}
                      {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">{t(`orderStatuses.${order.status}`)}</span>}
                      {(order.status !== 'PENDING' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED') && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{t(`orderStatuses.${order.status}`)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          {/* Top Selling Products */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h4 className="text-lg font-bold text-on-surface mb-6">{t('adminDash.topSelling')}</h4>
            
            {topProducts.length === 0 ? (
               <div className="text-center py-8 opacity-50 text-sm">{t('adminDash.noData')}</div>
            ) : (
              <div className="space-y-5">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <img className="w-12 h-12 rounded-xl object-cover bg-slate-100" src={p.image || "https://placehold.co/100"} alt={p.name} />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-on-surface truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.soldCount} {t('adminDash.sold')}</p>
                    </div>
                    <p className="text-sm font-bold text-red-600">{p.price.toLocaleString()} ₫</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch Performance */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h4 className="text-lg font-bold text-on-surface mb-6">{t('adminDash.branchPerformance')}</h4>
            
            {topBranches.length === 0 ? (
               <div className="text-center py-8 opacity-50 text-sm">{t('adminDash.noData')}</div>
            ) : (
              <div className="space-y-4">
                {topBranches.map((b, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer ${i === 0 ? 'bg-surface' : 'hover:bg-surface'}`}>
                    <span className={`w-6 text-center font-black ${i === 0 ? 'text-red-600' : 'text-slate-300'}`}>{i + 1}</span>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-on-surface truncate">{b.name}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div style={{ width: `${b.score}%` }} className={`h-full rounded-full ${i === 0 ? 'bg-red-600' : 'bg-red-600 opacity-60'}`}></div>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-500">{b.score}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Support Overview */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h4 className="text-lg font-bold text-on-surface mb-6">{t('adminDash.supportOverview')}</h4>
            
            {support ? (
              <div className="flex flex-col items-center justify-center h-48 relative cursor-pointer group">
                <div className="w-28 h-28 rounded-full border-[12px] border-slate-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 w-full h-full rounded-full border-[12px] border-transparent border-t-red-600 border-r-red-600 rotate-45"></div>
                  <div className="text-center">
                    <p className="text-xl font-black text-on-surface">{support.open}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">{t('adminDash.open')}</p>
                  </div>
                </div>
                <div className="mt-8 flex gap-4 w-full justify-between px-4">
                  <div className="text-center transform hover:-translate-y-1 transition-transform">
                    <p className="text-xs font-bold text-red-600">{support.urgent}</p>
                    <p className="text-[10px] text-slate-400">{t('adminDash.urgent')}</p>
                  </div>
                  <div className="text-center transform hover:-translate-y-1 transition-transform">
                    <p className="text-xs font-bold text-emerald-600">{support.resolved}</p>
                    <p className="text-[10px] text-slate-400">{t('adminDash.resolved')}</p>
                  </div>
                  <div className="text-center transform hover:-translate-y-1 transition-transform">
                    <p className="text-xs font-bold text-amber-500">{support.waiting}</p>
                    <p className="text-[10px] text-slate-400">{t('adminDash.waiting')}</p>
                  </div>
                </div>
              </div>
            ) : (
                <div className="text-center py-8 opacity-50 text-sm">{t('adminDash.noData')}</div>
            )}
          </div>
        </div>

        {/* Operational Alerts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {/* Low Stock Alerts */}
          <div className="bg-orange-50/50 p-6 rounded-2xl shadow-sm border border-orange-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">inventory_2</span>
                {t('adminDash.lowStock')}
              </h4>
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">{lowStockProducts.length} SP</span>
            </div>
            
            {lowStockProducts.length === 0 ? (
               <div className="text-center py-8 opacity-50 text-sm flex flex-col items-center">
                 <span className="material-symbols-outlined mb-2 text-3xl">check_circle</span>
                 {t('adminDash.allInStock')}
               </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((p, i) => (
                  <div key={p.id || p._id || `low-stock-${i}`} className="flex flex-col bg-white p-3 rounded-xl border border-orange-50/50 shadow-sm">
                    <div className="flex justify-between items-start">
                       <p className="text-sm font-bold text-on-surface truncate pr-4">{p.product?.name || p.batch_code || t('adminDash.product')}</p>
                       <span className="text-xs font-black text-red-600 flex-shrink-0">{t('adminDash.remaining', { count: p.quantity })}</span>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <button onClick={() => navigate('/admin/products')} className="w-full text-center text-xs font-bold text-orange-600 hover:text-orange-700 mt-2 py-2">
                    {t('adminDash.viewAllCount', { count: lowStockProducts.length })}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Expiring Soon Alerts */}
          <div className="bg-red-50/50 p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">event_busy</span>
                {t('adminDash.expiringSoon')}
              </h4>
              <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">{expiringProducts.length} Lô</span>
            </div>
            
            {expiringProducts.length === 0 ? (
               <div className="text-center py-8 opacity-50 text-sm flex flex-col items-center">
                 <span className="material-symbols-outlined mb-2 text-3xl">check_circle</span>
                 {t('adminDash.noExpiring')}
               </div>
            ) : (
              <div className="space-y-3">
                {expiringProducts.slice(0, 5).map((p, i) => {
                  const daysLeft = Math.ceil((new Date(p.expiration_date || p.exp_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                  <div key={p.id || p._id || `expiring-${i}`} className="flex flex-col bg-white p-3 rounded-xl border border-red-50/50 shadow-sm">
                    <div className="flex justify-between items-start">
                       <p className="text-sm font-bold text-on-surface truncate pr-4">{p.product?.name || p.batch_code || t('adminDash.product')}</p>
                       <span className={`text-xs font-black flex-shrink-0 ${daysLeft < 0 ? 'text-red-700' : 'text-red-500'}`}>
                         {daysLeft < 0 ? t('adminDash.expired') : t('adminDash.daysLeft', { days: daysLeft })}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{t('adminDash.batchLabel')} {p.batch_code} • {t('adminDash.stockLabel')} {p.quantity}</p>
                  </div>
                )})}
                {expiringProducts.length > 5 && (
                  <button onClick={() => navigate('/admin/products')} className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 mt-2 py-2">
                    {t('adminDash.viewAllCount', { count: expiringProducts.length })}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;