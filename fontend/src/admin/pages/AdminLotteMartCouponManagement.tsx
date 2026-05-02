import React from "react";

const AdminLotteMartCouponManagement: React.FC = () => {
  return (
    <div>
      {/* Page Content */}
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-[2.75rem] font-extrabold tracking-tight text-on-surface leading-tight">Coupon Management</h2>
                <p className="text-on-surface-variant font-medium mt-2">Manage customer incentives and promotional vouchers across all branches.</p>
              </div>
              <button className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                <span className="material-symbols-outlined">add_circle</span>
                Tạo mã mới
              </button>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Active Coupons */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Coupons</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-on-surface">124</span>
                  <span className="text-green-600 text-xs font-bold">+12%</span>
                </div>
              </div>

              {/* Total Redemptions */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Redemptions</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-on-surface">18.4K</span>
                  <span className="text-slate-400 text-xs">this month</span>
                </div>
              </div>

              {/* Revenue Impact */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue Impact</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-on-surface">$2.4M</span>
                  <span className="text-primary text-xs font-bold">ROI 4.2x</span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="z-10 relative">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversion Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-on-surface">24.8%</span>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mb-10"></div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-surface-container flex justify-between items-center">
                <h3 className="text-lg font-bold text-on-surface">Voucher Listings</h3>
                <div className="flex gap-2">
                  <button className="bg-surface-container-low px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-surface-container-high transition-colors">Export CSV</button>
                  <button className="bg-surface-container-low px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-surface-container-high transition-colors">Filter</button>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Coupon Code</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Popularity / Usage</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Expiry</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {/* Row 1 - Active */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">GIAM10</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-on-surface">10% Off All Groceries</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Applies to fresh produce &amp; dairy</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <span>Min: $50.00</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-sm">percent</span>
                          <span className="font-bold text-primary">Percentage</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-48">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500">1,240 / 5,000 used</span>
                          <span className="text-[10px] font-bold text-primary">24.8%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[24.8%] rounded-full"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-medium text-slate-600">Dec 31, 2024</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-primary">
                        <span className="translate-x-5 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded-lg text-slate-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 - Active */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">WELCOME50</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-on-surface">New User Discount</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">One-time use for new accounts</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <span>Min: $10.00</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-sm">attach_money</span>
                          <span className="font-bold text-slate-900">Fixed Value ($50)</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-48">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500">8,902 / 10,000 used</span>
                          <span className="text-[10px] font-bold text-primary">89.0%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[89%] rounded-full"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-medium text-slate-600">Jan 15, 2025</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-primary">
                        <span className="translate-x-5 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded-lg text-slate-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 - Expired */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group opacity-60 bg-slate-50/50">
                    <td className="px-6 py-5">
                      <span className="font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">LOTTESUMMER</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-500 line-through">Summer Flash Sale</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Exclusive seasonal promo</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <span>Min: $100.00</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="material-symbols-outlined text-sm">percent</span>
                          <span className="font-bold">Percentage (20%)</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-48">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400">500 / 500 used</span>
                          <span className="text-[10px] font-bold text-slate-400">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 w-full rounded-full"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-medium text-slate-400">Expired</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-300">
                        <span className="translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded-lg text-slate-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-6 bg-surface-container-low/30 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Showing 1 to 10 of 124 entries</p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-slate-400 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-xs font-bold hover:bg-slate-50">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-xs font-bold hover:bg-slate-50">3</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-slate-400 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Promotion Visualization Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Top Performer Card */}
              <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="bg-primary/20 text-primary-fixed border border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">Top Performer</span>
                    <h4 className="text-3xl font-black text-white mt-6 mb-2">GIAM10 Strategy</h4>
                    <p className="text-slate-400 text-sm max-w-md">The 10% discount on fresh groceries has driven a 15% increase in basket size among recurring customers this quarter.</p>
                  </div>
                  <div className="flex items-center gap-8 mt-12">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Redemption Rate</p>
                      <p className="text-2xl font-black text-white">74%</p>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Customer Retention</p>
                      <p className="text-2xl font-black text-white">42%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Perk Card */}
              <div className="bg-gradient-to-br from-tertiary-fixed to-tertiary-fixed-dim rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-on-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-on-tertiary-fixed">Membership Perk</h4>
                  <p className="text-on-tertiary-fixed-variant text-sm mt-2">New gold-tier exclusive coupons are ready for deployment.</p>
                </div>
                <button className="bg-on-tertiary-fixed text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">Preview Tier</button>
              </div>
            </div>
          </div>
        {/* Demo Modal (Glassmorphism) - hidden by default */}
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 pointer-events-none opacity-0 invisible transition-all">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center bg-surface-container-low/50">
              <h3 className="text-xl font-black text-on-surface">Tạo mã mới</h3>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Coupon Code</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. SUMMER25"
                  type="text"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Discount Type</label>
                <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option>Percentage (%)</option>
                  <option>Fixed Value ($)</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Describe the offer for internal tracking..."
                  rows={2}
                ></textarea>
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Usage Limit</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="5000"
                  type="number"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" type="date" />
              </div>
            </div>
            <div className="px-8 py-6 bg-surface-container-low/50 border-t border-surface-container flex justify-end gap-4">
              <button className="text-slate-500 font-bold px-6 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors">Cancel</button>
              <button className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Create Coupon</button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminLotteMartCouponManagement;