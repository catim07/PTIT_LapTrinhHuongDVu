// src/admin/pages/AdminProductManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../components/Toast/toastEvent';
import { useAppSelector } from '../../store';
import { productService } from '../../services/productService';

type SortOption = 'newest' | 'stock-low' | 'best-seller' | 'price-high' | 'price-low';

const AdminProductManagement: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'category',
    parent_id: '',
    sort_order: 0,
    is_active: true,
  });

  // Modal state
  const [editItem, setEditItem] = useState<any | null>(null);

  // Quick Filters
  const [quickFilter, setQuickFilter] = useState<'none' | 'low-stock' | 'promo' | 'new' | 'expiring'>('none');

  // Branch filter (Admin) from global Redux
  const { adminBranchId: branchFilter } = useAppSelector(state => state.adminAuth);

  const loadData = async () => {
    setLoading(true);
    try {
       // Need to import enterpriseService at the top
       const [bpRes, catRes, suppRes] = await Promise.all([
         productService.getBranchProducts(), // Get all since UI handles local filtering
         productService.getCategories({ include_inactive: true }),
         import('../services/enterpriseService').then(m => m.enterpriseService.getSuppliers({ limit: 1000 })).catch(() => ({ data: [] }))
       ]);
       setItems((bpRes || []).filter((b: any) => b.product)); // Must have mapping
       if (catRes) setCategories(catRes);
       if (suppRes?.data) setSuppliers(suppRes.data);
    } catch(err) {
       toast.error('Lỗi khi tải dữ liệu cấu hình kho');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const itemsPerPage = 8;

  const enrichedProducts: any[] = useMemo(() => {
    return items.map((bp) => {
      const master = bp.product || {};
      // Merge: master first, then BP overrides, then computed fields
      const merged: any = { 
         ...master, 
         ...bp, 
         master_id: master.id || master._id || bp.product_id, 
         id: bp.id || bp._id,
         product_id: bp.product_id, // Keep original product_id for master updates
         is_active: bp.is_available ?? master.is_active ?? true,
         // Sync expiry_date for modal: prefer BP field, fallback to batch-enriched exp_date
         expiry_date: bp.expiry_date || bp.exp_date || master.expiry_date || null,
         manufacture_date: bp.manufacture_date || master.manufacture_date || null,
         // Ensure badge-related master fields are available
         is_featured: master.is_featured ?? false,
         is_best_seller: master.is_best_seller ?? false,
         is_new: master.is_new ?? false,
      };
      return merged;
    });
  }, [items]);

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let list = [...enrichedProducts];

    // Branch filter  
    if (branchFilter !== 'ALL') {
      list = list.filter(p => String(p.branch_id) === String(branchFilter));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.sku?.toLowerCase().includes(term) ||
        String(p.id).includes(term)
      );
    }

    if (activeCategory !== 'all') {
      list = list.filter(p => String(p.category_id) === String(activeCategory));
    }

    if (activeStatus !== 'all') {
      if (activeStatus === 'active') list = list.filter(p => p.is_active);
      if (activeStatus === 'inactive') list = list.filter(p => !p.is_active);
      if (activeStatus === 'out-of-stock') list = list.filter(p => p.stock <= 0);
    }

    if (quickFilter === 'low-stock') list = list.filter(p => p.stock > 0 && p.stock <= 10);
    if (quickFilter === 'promo') list = list.filter(p => (p.discount_percent || 0) > 0);
    if (quickFilter === 'new') list = list.filter(p => p.is_new);
    if (quickFilter === 'expiring') list = list.filter(p => p.expiry_status === 'critical' || p.expiry_status === 'warning' || p.expiry_status === 'expired');

    list.sort((a, b) => {
      switch (activeSort) {
        case 'newest': 
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'stock-low': 
          return (a.stock || 0) - (b.stock || 0);
        case 'best-seller':
          return (b.sold_count || 0) - (a.sold_count || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        default: return 0;
      }
    });

    return list;
  }, [enrichedProducts, searchTerm, activeCategory, activeStatus, activeSort, quickFilter, branchFilter]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (safePage !== currentPage && safePage > 0) {
      setCurrentPage(safePage);
    }
  }, [safePage, currentPage]);

  const displayedItems = filteredAndSorted.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      icon: 'category',
      parent_id: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const startEditCategory = (category: any) => {
    setEditingCategoryId(String(category.id || category._id));
    setCategoryForm({
      name: category.name || '',
      icon: category.icon || 'category',
      parent_id: category.parent_id ? String(category.parent_id) : '',
      sort_order: Number(category.sort_order || 0),
      is_active: category.is_active !== false,
    });
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }

    try {
      setCategoryBusy(true);
      const payload = {
        name: categoryForm.name.trim(),
        icon: categoryForm.icon || 'category',
        parent_id: categoryForm.parent_id || null,
        sort_order: Number(categoryForm.sort_order || 0),
        is_active: Boolean(categoryForm.is_active),
      };

      if (editingCategoryId) {
        await productService.updateCategory(editingCategoryId, payload);
        toast.success('Đã cập nhật danh mục');
      } else {
        await productService.createCategory(payload);
        toast.success('Đã tạo danh mục mới');
      }

      resetCategoryForm();
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu danh mục');
    } finally {
      setCategoryBusy(false);
    }
  };

  const toggleCategoryStatus = async (category: any) => {
    try {
      setCategoryBusy(true);
      await productService.updateCategory(String(category.id || category._id), {
        is_active: category.is_active === false,
      });
      toast.success(category.is_active ? 'Đã ẩn danh mục' : 'Đã bật danh mục');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi trạng thái danh mục');
    } finally {
      setCategoryBusy(false);
    }
  };

  const deleteCategory = async (category: any) => {
    const categoryId = String(category.id || category._id || '');
    if (!categoryId) return;
    const shouldDelete = window.confirm(`Xóa danh mục "${category.name}"?`);
    if (!shouldDelete) return;

    try {
      setCategoryBusy(true);
      await productService.deleteCategory(categoryId);
      toast.success('Đã xóa danh mục');
      if (activeCategory === categoryId) setActiveCategory('all');
      if (editingCategoryId === categoryId) resetCategoryForm();
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa danh mục');
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleToggleActive = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    try {
      setIsProcessing(true);
      await productService.updateBranchProduct(item.id, { is_available: !item.is_active });
      await loadData();
      toast.success(`Đã ${item.is_active ? 'ẩn' : 'hiện'} sản phẩm ${item.name || item.sku}`);
    } catch {
      toast.error('Lỗi khi đổi trạng thái');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateDraftPromotion = (item: any) => {
    const daysLeft = item.days_until_expiry ?? null;
    // Smart discount: closer to expiry → deeper discount
    let discountValue = '50';
    if (daysLeft !== null && daysLeft <= 3) discountValue = '70';
    else if (daysLeft !== null && daysLeft <= 7) discountValue = '50';
    else if (daysLeft !== null && daysLeft <= 14) discountValue = '30';

    const payload = {
      title: `⚠️ Xả hàng sắp hết hạn: ${item.name}`,
      description: `Xả hàng sắp hết hạn ${item.name}. SKU: ${item.sku || 'N/A'}. Nhập từ: ${item.supplier_name || 'N/A'}. Lô: ${item.batch_code || 'N/A'}. HSD: ${item.exp_date ? new Date(item.exp_date).toLocaleDateString('vi-VN') : 'N/A'}. Còn ${daysLeft ?? '?'} ngày. Tồn hiện tại: ${item.stock || 0}.`,
      imageUrl: item.images?.[0] || item.product?.images?.[0] || 'https://via.placeholder.com/800x400.png?text=Clearance+Sale',
      type: 'percent',
      discount_value: discountValue,
      scope: 'product',
      target_product_ids: [String(item.master_id || item.product_id)],
      target_branch_ids: branchFilter !== 'ALL' ? [String(branchFilter)] : [],
      start_date: new Date().toISOString(),
      end_date: item.exp_date || '',
      total_quantity: String(item.stock || ''),
      per_user_limit: '1',
      badge_text: 'Giải phóng hàng sắp hết hạn',
      source: 'expiry_alert',
      is_auto_generated: true,
      autoOpenDraft: true,
    };
    navigate('/admin/coupons', { state: { draftPromotion: payload } });
  };

  const handleExport = () => {
    const headers = ['ID', 'SKU', 'Name', 'Price', 'Original Price', 'Stock', 'Sold', 'Active', 'Featured', 'Best Seller', 'New'];
    const rows = filteredAndSorted.map(item => [
      item.id, item.sku || '', `"${item.name || ''}"`, item.price || 0, item.original_price || 0,
      item.stock || 0, item.sold_count || 0, item.is_active ? 'Yes' : 'No',
      item.is_featured ? 'Yes' : 'No', item.is_best_seller ? 'Yes' : 'No', item.is_new ? 'Yes' : 'No'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lotte_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filteredAndSorted.length} sản phẩm ra file CSV!`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = () => {
      if (input.files?.[0]) {
        toast.success(`Đã chọn file "${input.files[0].name}" — chức năng import sẽ xử lý khi kết nối API Import.`);
      }
    };
    input.click();
  };

  const handleCreateSKU = async () => {
    setEditItem({
      id: '',
      name: '',
      sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      master_id: `MAS-${Date.now().toString(36).toUpperCase()}`,
      category_id: '',
      category_name: '',
      supplier_id: '',
      supplier_name: '',
      batch_code: '',
      manufacture_date: '',
      expiry_date: '',
      import_price: 0,
      original_price: 0,
      price: 0,
      stock: 0,
      is_active: false,
      is_featured: false,
      is_best_seller: false,
      is_new: false,
    });
  };

  const saveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      setIsProcessing(true);
      const discountPct = Number(editItem.original_price) > 0
        ? Math.round((1 - Number(editItem.price) / Number(editItem.original_price)) * 100)
        : 0;

      // Fields that belong to BranchProduct schema
      const bpUpdates: Record<string, any> = {
        price: Number(editItem.price),
        original_price: Number(editItem.original_price),
        discount_percent: discountPct,
        stock: Number(editItem.stock),
        is_available: editItem.is_active, // BP uses is_available, not is_active
        sku: editItem.sku || '',
        master_id: editItem.master_id || '',
        category_id: editItem.category_id || null,
        category_name: editItem.category_name || '',
        supplier_id: editItem.supplier_id || null,
        supplier_name: editItem.supplier_name || '',
        batch_code: editItem.batch_code || '',
        manufacture_date: editItem.manufacture_date || null,
        expiry_date: editItem.expiry_date || null,
        import_price: Number(editItem.import_price || 0),
      };

      // Fields that belong to Product (master) schema only
      const productUpdates: Record<string, any> = {
        name: editItem.name?.trim(),
        sku: editItem.sku || '',
        master_id: editItem.master_id || '',
        category_id: editItem.category_id || null,
        category_name: editItem.category_name || '',
        supplier_id: editItem.supplier_id || null,
        supplier_name: editItem.supplier_name || '',
        is_featured: Boolean(editItem.is_featured),
        is_best_seller: Boolean(editItem.is_best_seller),
        is_new: Boolean(editItem.is_new),
        is_active: editItem.is_active,
        price: Number(editItem.price),
        original_price: Number(editItem.original_price),
        import_price: Number(editItem.import_price || 0),
        discount_percent: discountPct,
        manufacture_date: editItem.manufacture_date || null,
        expiry_date: editItem.expiry_date || null,
        batch_code: editItem.batch_code || '',
      };

      if (!editItem.id) {
        // CREATE flow: create Product first, then BranchProduct
        if (!editItem.name?.trim()) {
          toast.error('Vui lòng nhập tên sản phẩm!');
          setIsProcessing(false);
          return;
        }
        const createdProduct = await productService.createProduct({
          name: editItem.name.trim(),
          ...productUpdates,
        });
        if (!createdProduct || !(createdProduct.id || createdProduct._id)) throw new Error('Failed to create product');

        await productService.createBranchProduct({
          ...bpUpdates,
          product_id: createdProduct.id || createdProduct._id,
          branch_id: branchFilter === 'ALL' ? '' : branchFilter,
        });
        toast.success(`Đã tạo sản phẩm "${editItem.name}" thành công!`);
      } else {
        // UPDATE flow: update BranchProduct + update Product master if we have product_id
        await productService.updateBranchProduct(editItem.id, bpUpdates);

        // Also update the master Product record so is_featured/is_best_seller/is_new persist
        const masterId = editItem.product_id || editItem.product?._id || editItem.product?.id;
        if (masterId) {
          try {
            await productService.updateProduct(masterId, productUpdates);
          } catch {
            // Non-critical: BP updated successfully, master update is best-effort
          }
        }
        toast.success('Đã cập nhật cấu hình sản phẩm');
      }

      setEditItem(null);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface mb-2">
              Quản lý Tồn kho & Sản phẩm
            </h1>
            <p className="text-secondary text-sm">
              Quản lý kho hàng, giá bán, tình trạng hiển thị của toàn bộ {enrichedProducts.length} SKU trên hệ thống.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]">
              <span className="material-symbols-outlined">ios_share</span>
              Xuất Data
            </button>
            <button onClick={handleImport} className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]">
              <span className="material-symbols-outlined">publish</span>
              Import Data
            </button>
            <button onClick={handleCreateSKU} disabled={isProcessing} className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary-container transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              <span className="material-symbols-outlined">add</span>
              Tạo mới SKU
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Quản lý Danh mục</h2>
              <p className="text-xs text-slate-500 mt-1">Tạo và cập nhật danh mục để đồng bộ bộ lọc ở Shop.</p>
            </div>
            <button
              type="button"
              onClick={resetCategoryForm}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Tạo danh mục mới
            </button>
          </div>

          <form onSubmit={saveCategory} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Tên danh mục"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="icon"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={categoryForm.parent_id}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
              >
                <option value="">Danh mục cha (không có)</option>
                {categories
                  .filter((c: any) => String(c.id || c._id) !== String(editingCategoryId || ''))
                  .map((c: any) => (
                    <option key={String(c.id || c._id)} value={String(c.id || c._id)}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <input
                type="number"
                min={0}
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, sort_order: Number(e.target.value || 0) }))}
                placeholder="Thứ tự"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-primary"
                />
                Active
              </label>
              <button
                type="submit"
                disabled={categoryBusy}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {editingCategoryId ? 'Lưu danh mục' : 'Thêm danh mục'}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((cat: any) => {
              const catId = String(cat.id || cat._id);
              const parent = categories.find((c: any) => String(c.id || c._id) === String(cat.parent_id));
              return (
                <div key={catId} className="border border-slate-200 rounded-xl px-3 py-2.5 bg-white flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{cat.name}</p>
                    <p className="text-[11px] text-slate-500">{parent ? `Cha: ${parent.name}` : 'Danh mục gốc'}</p>
                    <p className="text-[11px] text-slate-500">Thứ tự: {Number(cat.sort_order || 0)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditCategory(cat)}
                      className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                      title="Chỉnh sửa"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategoryStatus(cat)}
                      className={`p-1.5 rounded-md ${cat.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                      title={cat.is_active ? 'Ẩn danh mục' : 'Bật danh mục'}
                    >
                      <span className="material-symbols-outlined text-[16px]">{cat.is_active ? 'visibility' : 'visibility_off'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat)}
                      className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                      title="Xóa danh mục"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm mb-8 space-y-6 border border-slate-100">
          {/* Branch Filter Row removed because it's in the Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-4 relative flex items-center">
              <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 leading-none block">search</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none placeholder:text-slate-400"
                placeholder="Tên sản phẩm, SKU hoặc mã..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                type="text"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <select 
                value={activeCategory} 
                onChange={e => { setActiveCategory(e.target.value === 'all' ? 'all' : String(e.target.value)); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-surface-container-low border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none cursor-pointer"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(c => <option key={String(c.id || c._id)} value={String(c.id || c._id)}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <select 
                value={activeStatus} 
                onChange={e => { setActiveStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-surface-container-low border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang bán (Active)</option>
                <option value="inactive">Đã ẩn (Inactive)</option>
                <option value="out-of-stock">Hết hàng (Stock 0)</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <select 
                value={activeSort}
                onChange={e => { setActiveSort(e.target.value as SortOption); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-surface-container-low border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none cursor-pointer font-medium"
              >
                <option value="newest">Ngày tạo (Mới nhất)</option>
                <option value="stock-low">Tồn kho (Thấp đến cao)</option>
                <option value="best-seller">Bán chạy nhất</option>
                <option value="price-low">Giá (Thấp đến cao)</option>
                <option value="price-high">Giá (Cao đến thấp)</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                  setActiveStatus('all');
                  setQuickFilter('none');
                }}
                className="w-full h-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Xóa lọc
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter nhanh:</span>
            <button 
              onClick={() => { setQuickFilter('none'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${quickFilter === 'none' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => { setQuickFilter('low-stock'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${quickFilter === 'low-stock' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sắp hết hàng (≤10)
            </button>
            <button 
              onClick={() => { setQuickFilter('promo'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${quickFilter === 'promo' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Đang Sale
            </button>
            <button 
              onClick={() => { setQuickFilter('new'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${quickFilter === 'new' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Hàng mới
            </button>
            <button 
              onClick={() => { setQuickFilter('expiring'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${quickFilter === 'expiring' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <span className="material-symbols-outlined text-xs">schedule</span> Sắp hết hạn
            </button>
            
            <div className="ml-auto flex items-center gap-2 text-xs text-secondary font-medium">
              <span className="material-symbols-outlined text-xs">info</span>
              <span>{filteredAndSorted.length} kết quả</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100 overflow-x-auto mb-8 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 font-bold text-slate-400">Đang tải dữ liệu kho...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-slate-400 mb-6">Thử thay đổi bộ lọc hoặc xóa lọc để xem lại.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 w-10">
                    <input className="rounded border-slate-300 text-primary focus:ring-primary/20" type="checkbox" />
                  </th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Sản phẩm & NCC</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Giá bán / Nhập</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Tồn kho / Bán</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Badges & Hạn dùng</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Trạng thái</th>
                  <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayedItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 align-top"><input className="rounded border-slate-300 text-primary mt-3" type="checkbox" /></td>
                    <td className="px-5 py-4 max-w-[300px]">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative">
                          <img className="w-full h-full object-cover" src={item.images?.[0] || item.product?.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} />
                          {item.stock <= 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[8px] font-bold text-white">HẾT</span></div>}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="font-bold text-slate-800 text-sm line-clamp-1 mb-0.5" title={item.name}>{item.name || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1 rounded">SKU: {item.sku}</span>
                            <span className="text-[11px] text-slate-400 font-mono">Master: {String(item.master_id || '').slice(-6)}</span>
                          </div>
                          {item.supplier_name ? (
                            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate w-full" title={item.supplier_name}>
                              NCC: {item.supplier_name}
                              {item.supplier_code && <span className="font-mono text-slate-400 ml-1">({item.supplier_code})</span>}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Chưa có NCC</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <div className="mt-1">
                        <p className="font-extrabold text-primary text-[15px]">{(item.price || 0).toLocaleString()}đ</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-xs text-slate-400 line-through">{(item.original_price || 0).toLocaleString()}đ</span>
                          {item.original_price > item.price && (
                            <span className="text-[10px] font-bold px-1.5 bg-red-100 text-red-600 rounded">-{item.discount_percent}%</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <div className="mt-1">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${item.stock > 10 ? 'bg-emerald-100 text-emerald-700' : item.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            Kho: {item.stock || 0}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Đã bán: <b>{item.sold_count || 0}</b></p>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(item.badges) && item.badges.length > 0 ? item.badges.map((b: any, index: number) => (
                            <span key={index} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              b.color === 'red' ? 'bg-red-100 text-red-700' :
                              b.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                              b.color === 'yellow' ? 'bg-amber-100 text-amber-800' :
                              b.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {b.text}
                            </span>
                          )) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}
                        </div>
                        {item.manufacture_date && (
                          <span className="text-[11px] font-bold text-slate-500">
                            NSX: {new Date(item.manufacture_date).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        {item.exp_date ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[11px] font-bold ${
                              item.expiry_status === 'expired' ? 'text-red-600' :
                              item.expiry_status === 'critical' ? 'text-orange-600' :
                              item.expiry_status === 'warning' ? 'text-amber-600' :
                              'text-slate-600'
                            }`}>
                              HSD: {new Date(item.exp_date).toLocaleDateString('vi-VN')}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              item.expiry_status === 'expired' ? 'text-red-600' :
                              item.expiry_status === 'critical' ? 'text-orange-600' :
                              item.expiry_status === 'warning' ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                              {item.days_until_expiry !== null && item.days_until_expiry !== undefined
                                ? item.days_until_expiry < 0
                                  ? `Đã hết hạn ${Math.abs(item.days_until_expiry)} ngày`
                                  : item.days_until_expiry === 0
                                    ? 'Hết hạn hôm nay!'
                                    : `Còn ${item.days_until_expiry} ngày`
                                : ''}
                            </span>
                            {(item.expiry_status === 'critical' || item.expiry_status === 'expired') && (
                              <button
                                onClick={() => handleCreateDraftPromotion(item)}
                                className="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="Tạo khuyến mãi xả hàng từ cảnh báo hết hạn"
                              >
                                <span className="material-symbols-outlined text-[12px]">sell</span>
                                Tạo sale xả hàng
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Không có hạn</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      {item.is_active ? (
                        <span className="inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full border border-emerald-200 whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors" onClick={(e) => handleToggleActive(e, item)} title="Nhấp để ẩn">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full border border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={(e) => handleToggleActive(e, item)} title="Nhấp để hiển thị">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center align-middle">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setEditItem({ ...item })}
                          disabled={isProcessing}
                          className="px-4 py-2 border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-primary/50 text-primary font-bold text-xs rounded-lg transition-all"
                        >
                          Chỉnh sửa
                        </button>
                        {(item.expiry_status === 'critical' || item.expiry_status === 'warning') && (
                          <button 
                            onClick={() => handleCreateDraftPromotion(item)}
                            className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 w-full whitespace-nowrap"
                            title="Tạo khuyến mãi xả hàng nháp"
                          >
                            <span className="material-symbols-outlined text-[14px]">sell</span>
                            Tạo sale
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Hiển thị <b>{(safePage - 1) * itemsPerPage + 1}</b> đến <b>{Math.min(safePage * itemsPerPage, filteredAndSorted.length)}</b> trong tổng <b>{filteredAndSorted.length}</b> SP
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md">
                  {safePage}
                </span>
                <span className="text-slate-400 text-xs px-1">/</span>
                <span className="text-slate-600 text-xs font-bold px-1">{totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-lg">{editItem.id ? 'Chỉnh sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={editItem.name || ''}
                  onChange={e => setEditItem({...editItem, name: e.target.value})}
                  className="mt-2 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-md font-bold text-slate-800 outline-none focus:border-primary shadow-sm"
                  required
                />
              </div>
              <button onClick={() => setEditItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={saveQuickEdit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Số lượng tồn kho</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={editItem.stock}
                      onChange={e => setEditItem({...editItem, stock: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">inventory_2</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái rổ hàng</label>
                  <select 
                    value={editItem.is_active ? 'true' : 'false'}
                    onChange={e => setEditItem({...editItem, is_active: e.target.value === 'true'})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                  >
                    <option value="true">Hiển thị (Khách mua được)</option>
                    <option value="false">Ẩn (Không mua được)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-100 pt-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">SKU</label>
                  <input type="text" value={editItem.sku || ''} onChange={e => setEditItem({...editItem, sku: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Master ID</label>
                  <input type="text" value={editItem.master_id || ''} onChange={e => setEditItem({...editItem, master_id: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Danh mục</label>
                  <select 
                    value={editItem.category_id || ''} 
                    onChange={e => {
                      const sel = categories.find(c => String(c.id || c._id) === e.target.value);
                      setEditItem({...editItem, category_id: e.target.value, category_name: sel ? sel.name : ''});
                    }} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 text-sm"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nhà Cung Cấp</label>
                  <select 
                    value={editItem.supplier_id || ''} 
                    onChange={e => {
                      const sel = suppliers.find(s => String(s.id || s._id) === e.target.value);
                      setEditItem({...editItem, supplier_id: e.target.value, supplier_name: sel ? sel.name : ''});
                    }} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 text-sm"
                  >
                    <option value="">-- Chọn NCC --</option>
                    {suppliers.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name} {s.code ? `(${s.code})` : ''}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-100 pt-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Batch Code</label>
                  <input type="text" value={editItem.batch_code || ''} onChange={e => setEditItem({...editItem, batch_code: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 font-mono text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-100 pt-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ngày SX</label>
                  <input type="date" value={editItem.manufacture_date ? editItem.manufacture_date.split('T')[0] : ''} onChange={e => setEditItem({...editItem, manufacture_date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hạn Sử Dụng</label>
                  <input type="date" value={editItem.expiry_date ? editItem.expiry_date.split('T')[0] : ''} onChange={e => setEditItem({...editItem, expiry_date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Giá Nhập (Import Price)</label>
                  <div className="relative">
                    <input type="number" min="0" value={editItem.import_price || 0} onChange={e => setEditItem({...editItem, import_price: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 text-sm text-amber-600 font-bold" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 text-xs font-bold">VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá niêm yết (Gốc)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={editItem.original_price}
                      onChange={e => setEditItem({...editItem, original_price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-400 line-through"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá hiện tại (Sale)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={editItem.price}
                      onChange={e => setEditItem({...editItem, price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-black text-primary text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs font-bold">VNĐ</span>
                  </div>
                  {Number(editItem.original_price) > Number(editItem.price) && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-2">
                       Tự động tính giảm: -{Math.round((1 - Number(editItem.price) / Number(editItem.original_price)) * 100)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Huy hiệu hiển thị (Badges)</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={editItem.is_featured} onChange={e => setEditItem({...editItem, is_featured: e.target.checked})} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Nổi Bật (Featured)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={editItem.is_best_seller} onChange={e => setEditItem({...editItem, is_best_seller: e.target.checked})} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Bán Chạy (Best Seller)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={editItem.is_new} onChange={e => setEditItem({...editItem, is_new: e.target.checked})} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Hàng Mới (New)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setEditItem(null)} className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] border border-slate-200">Hủy thao tác</button>
                <button type="submit" disabled={isProcessing} className="inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary-container transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {isProcessing ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">save</span>}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;