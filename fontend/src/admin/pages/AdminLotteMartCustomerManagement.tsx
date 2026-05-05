import React from "react";

const AdminLotteMartCustomerManagement: React.FC = () => {
  return (
    <>
      {/* Global Styles & Fonts (thêm vào index.html hoặc global CSS) */}
      {/* 
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        
        Thêm vào global CSS hoặc tailwind.config:
        body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .premium-gradient {
          background: linear-gradient(135deg, #970012 0%, #c1121f 100%);
        }
      */}

      {/* Tailwind Config (thêm vào tailwind.config.ts - giống hệ thống trước) */}
      {/* 
        export default {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "primary": "#970012",
                "surface-container-highest": "#e0e3e5",
                "on-tertiary": "#ffffff",
                "on-surface-variant": "#5c403d",
                "surface-variant": "#e0e3e5",
                "on-tertiary-container": "#4c3f00",
                "on-primary-fixed-variant": "#930011",
                "inverse-on-surface": "#eff1f3",
                "error-container": "#ffdad6",
                "tertiary-container": "#caa900",
                "surface-container": "#eceef0",
                "outline-variant": "#e5bdb9",
                "inverse-primary": "#ffb3ad",
                "on-secondary-fixed": "#131b2e",
                "error": "#ba1a1a",
                "background": "#f7f9fb",
                "secondary-container": "#dae2fd",
                "on-tertiary-fixed-variant": "#554600",
                "on-tertiary-fixed": "#221b00",
                "surface": "#f7f9fb",
                "surface-container-high": "#e6e8ea",
                "outline": "#906f6c",
                "surface-tint": "#bd0d1d",
                "primary-container": "#c1121f",
                "secondary-fixed-dim": "#bec6e0",
                "tertiary-fixed": "#ffe171",
                "secondary": "#565e74",
                "on-surface": "#191c1e",
                "on-secondary-fixed-variant": "#3f465c",
                "primary-fixed": "#ffdad6",
                "secondary-fixed": "#dae2fd",
                "on-primary-fixed": "#410003",
                "primary-fixed-dim": "#ffb3ad",
                "surface-bright": "#f7f9fb",
                "on-secondary-container": "#5c647a",
                "on-error": "#ffffff",
                "on-primary": "#ffffff",
                "on-secondary": "#ffffff",
                "inverse-surface": "#2d3133",
                "tertiary": "#705d00",
                "surface-dim": "#d8dadc",
                "on-primary-container": "#ffd2ce",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f2f4f6",
                "on-error-container": "#93000a",
                "on-background": "#191c1e",
                "tertiary-fixed-dim": "#e9c400"
              },
              fontFamily: {
                headline: ["Inter"],
                body: ["Inter"],
                label: ["Inter"]
              },
              borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
              },
            },
          },
        }
      */}

      <div className="bg-[#f7f9fb] text-on-surface antialiased min-h-screen overflow-hidden">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-slate-900 dark:bg-black font-medium text-sm flex flex-col py-6">
          <div className="px-6 mb-8">
            <h1 className="text-xl font-black text-white tracking-tight">Lotte Mart</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">Enterprise Admin</p>
          </div>

          <nav className="flex-1 space-y-1 px-2 overflow-y-auto no-scrollbar">
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">inventory_2</span>
              <span>Products</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">category</span>
              <span>Categories</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">shopping_cart</span>
              <span>Orders</span>
            </a>
            {/* Customers - ACTIVE */}
            <a href="#" className="flex items-center px-4 py-3 bg-[#C1121F] text-white rounded-lg mx-2">
              <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
              <span>Customers</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">confirmation_number</span>
              <span>Coupons</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">campaign</span>
              <span>Promotions</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">event</span>
              <span>Events</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg">
              <span className="material-symbols-outlined mr-3">analytics</span>
              <span>Reports</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-2 rounded-lg mt-auto">
              <span className="material-symbols-outlined mr-3">settings</span>
              <span>Settings</span>
            </a>
          </nav>

          <div className="px-6 pt-6 mt-6 border-t border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold">LM</div>
              <div>
                <p className="text-xs text-white font-semibold">Lotte Mart Admin</p>
                <p className="text-[10px] text-slate-500 uppercase">Super Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* TopNavBar */}
        <header className="sticky top-0 w-full z-40 bg-[#f7f9fb] border-b border-slate-200/50 shadow-sm flex justify-between items-center px-8 py-3 ml-64 max-w-[calc(100%-16rem)]">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group flex items-center">
              <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[20px] leading-none block">search</span>
              </div>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                placeholder="Tìm kiếm khách hàng, đơn hàng..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <div className="flex gap-4">
              <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">location_on</span>
              </button>
              <button className="p-2 text-slate-500 hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="ml-64 p-8 min-h-screen">
          {/* Page Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <nav className="flex text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
                <span>Admin</span>
                <span className="mx-2">/</span>
                <span className="text-primary">Khách hàng</span>
              </nav>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Khách hàng</h2>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center px-4 py-2.5 bg-surface-container-lowest text-on-surface font-semibold text-sm rounded-xl transition-all hover:bg-surface-container-high border border-slate-200/30 shadow-sm">
                <span className="material-symbols-outlined mr-2 text-sm">file_download</span>
                Xuất Báo Cáo
              </button>
              <button className="flex items-center px-6 py-2.5 premium-gradient text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                <span className="material-symbols-outlined mr-2 text-sm">person_add</span>
                Thêm Khách Hàng
              </button>
            </div>
          </div>

          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Members */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-slate-200/20 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Thành Viên</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">1,248,902</h3>
              </div>
            </div>

            {/* Gold Tier */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-slate-200/20 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+4.2%</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hạng Gold (VIP)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">42,506</h3>
              </div>
            </div>

            {/* Points Issued */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-slate-200/20 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">30 ngày</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Đã Cấp</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">12.8M</h3>
              </div>
            </div>

            {/* Active Monitoring */}
            <div className="bg-primary p-6 rounded-xl shadow-lg premium-gradient flex flex-col justify-between text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Đang hoạt động</span>
                </div>
                <p className="text-xs opacity-70">Khách hàng trực tuyến</p>
                <h3 className="text-2xl font-black mt-1">12,402</h3>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined !text-[120px]">language</span>
              </div>
            </div>
          </div>

          {/* Main Table + Sidebar */}
          <div className="bg-surface-container-lowest rounded-2xl border border-slate-200/20 shadow-sm overflow-hidden flex">
            {/* Table Container */}
            <div className="flex-1 overflow-x-auto">
              <div className="p-6 border-b border-slate-100/50 flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900">Danh sách khách hàng</h4>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">filter_list</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">sort</span>
                  </button>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">Khách Hàng</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">Thông Tin Liên Hệ</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">Hạng Thành Viên</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] text-right">Điểm Tích Lũy</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] text-center">Trạng Thái</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          alt="Female customer avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcUA6cAh5vFqxYoPeVvlmy8qS50x462aW5IpDFR8Y9M2Yz08McFIQBXK-WIO0H82kLoACrYJ4vAwYC60MLeICl6qDjyjJusE_TwQC5U8w8xVG6F-CedjJI8VVcJuNCnp-N7hwfe0ohDc2hE13A6j5T6cQ9fkZo3TWnuESQTU4DV47hNJ1ZzKdG4u4_w-Cpyqiy7_ikzAMk_e-UMZhB34jWeHAywnTsCfFcvRIuk28shAOGXBY7T4ZGIzU8mG9PPx-Y0R1aOPJ23ks"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Nguyễn Thu Hà</p>
                          <p className="text-[10px] text-slate-400">ID: LM-90124</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-medium text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                          thuha.n@gmail.com
                        </p>
                        <p className="flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                          098****321
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100">Gold</span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-900 text-sm">12,450</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Nâng hạng">
                          <span className="material-symbols-outlined text-lg">trending_up</span>
                        </button>
                        <button className="p-1.5 text-error hover:bg-error-container rounded-lg transition-colors" title="Khóa tài khoản">
                          <span className="material-symbols-outlined text-lg">block</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer bg-slate-50/30">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          alt="Male customer avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJxI_4o-QQIYyI_bzhxuYc8Fc_vF6oprIIsKkzOslT2-WbgxnhPF7GYQkx3CpOAvMSi5JnILYGP4U56lsCb_rCsu_D5SU4pyp-D9YGJrqr3XCUDWKiGOaPB00m56laqPYuVDYB9uVI55brzZ3FdVH6H6ROnW8u7HrspPmVlKpoJpeuNzN--3JzyiLSxw7tQhwVyOMhD4gyhI0NkmtK8XrRmS_nlWzOrE_Ay4VKnBWIGF-JyiRloxPSbIIOFWXuDohd1IrO2VoEaZw"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Trần Văn Nam</p>
                          <p className="text-[10px] text-slate-400">ID: LM-90455</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-medium text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                          nam.tran@company.vn
                        </p>
                        <p className="flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                          090****888
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-slate-200">Silver</span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-900 text-sm">4,120</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">trending_up</span>
                        </button>
                        <button className="p-1.5 text-error hover:bg-error-container rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">block</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 (Locked) */}
                  <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">LK</div>
                        <div>
                          <p className="text-sm font-bold text-slate-400 line-through">Lê Kim Anh</p>
                          <p className="text-[10px] text-slate-400">ID: LM-88123</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-medium text-slate-400 line-through">
                        <p>anhle@test.com</p>
                        <p>091****999</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-orange-100">Bronze</span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-400 text-sm">890</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded-lg">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span> Locked
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">lock_open</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-6 border-t border-slate-100/50 flex justify-between items-center bg-surface-container-low/30">
                <p className="text-xs text-slate-500 font-medium">Hiển thị 10 trong tổng số 1,248,902 khách hàng</p>
                <div className="flex gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-[10px] font-black">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-slate-600 text-[10px] font-black hover:border-primary transition-all">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-slate-600 text-[10px] font-black hover:border-primary transition-all">3</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contextual Sidebar (Customer Detail) */}
            <aside className="w-96 bg-surface-container-low border-l border-slate-200/50 flex flex-col hidden lg:flex">
              <div className="p-8 border-b border-slate-200/50">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md">
                    <img
                      alt="Detailed customer profile"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUNI_phIMcSSMGhdY9Rr4nbwqB_8LV2Z5vJkDewuBYf8ZAGFJMnuZmF7duN0yKLlWHoH-ID6pNAQSy5-kxcW7qaFuSL6jalljsrBDFBp1qLhH6z0VuIl6a3yPcm_YGHZtZmNOzC3A8h2-F6i3WSvvXze-QY_D4QDEWj-Ix4nBIeVpmqmv3ivmbbA4yXrbVVbwdqACXq6P8Op0s8SA3liqpGRtQpsQqE2EuRiVLoZobOG_Rg3E8vd18GGh8uwHQlCarbkbbuguKEh0"
                    />
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-slate-400">close</span>
                  </button>
                </div>
                <h5 className="text-xl font-black text-slate-900 leading-tight">Nguyễn Thu Hà</h5>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Khách hàng từ 20/05/2021</p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hạng VIP</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      <span className="text-sm font-bold text-slate-800">Gold Tier</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giao dịch</p>
                    <p className="text-sm font-bold text-slate-800">154 Đơn</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
                {/* Recent Orders */}
                <section>
                  <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Đơn hàng gần đây</h6>
                  <div className="space-y-3">
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-slate-200/10 shadow-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">#ORD-5523</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Giao thành công</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] text-slate-400 italic">22/10/2023</p>
                        <p className="text-xs font-bold text-primary">1,250,000đ</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-slate-200/10 shadow-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">#ORD-5481</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Giao thành công</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] text-slate-400 italic">15/10/2023</p>
                        <p className="text-xs font-bold text-primary">850,000đ</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 text-[10px] font-bold text-slate-400 uppercase hover:text-primary transition-colors py-2 border border-dashed border-slate-200 rounded-lg">
                    Xem tất cả lịch sử
                  </button>
                </section>

                {/* Saved Addresses */}
                <section>
                  <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Địa chỉ giao hàng</h6>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl">
                      <span className="material-symbols-outlined text-slate-400">home</span>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700">Nhà riêng (Mặc định)</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">469 Nguyễn Hữu Thọ, P. Tân Hưng, Quận 7, TP.HCM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl">
                      <span className="material-symbols-outlined text-slate-400">work</span>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700">Văn phòng</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Toà nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-slate-200/50 bg-surface-container-low">
                <button className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-black transition-all">
                  Xem Chi Tiết Hồ Sơ
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminLotteMartCustomerManagement;