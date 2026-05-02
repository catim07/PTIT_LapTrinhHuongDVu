import React, { useEffect, useMemo, useState } from 'react';
import { productService } from '../../services/productService';
import { toast } from '../../components/Toast/toastEvent';

const defaultForm = {
  name: '',
  icon: 'category',
  parent_id: '',
  sort_order: 0,
  is_active: true,
};

const AdminCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const categoryMap = useMemo(() => {
    const map = new Map<string, any>();
    categories.forEach((c: any) => {
      const key = String(c.id || c._id || '');
      if (key) map.set(key, c);
    });
    return map;
  }, [categories]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await productService.getCategories({ include_inactive: true });
      setCategories(Array.isArray(result) ? result : []);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const onEdit = (category: any) => {
    setEditingId(String(category.id || category._id));
    setForm({
      name: category.name || '',
      icon: category.icon || 'category',
      parent_id: category.parent_id ? String(category.parent_id) : '',
      sort_order: Number(category.sort_order || 0),
      is_active: category.is_active !== false,
    });
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        icon: form.icon || 'category',
        parent_id: form.parent_id || null,
        sort_order: Number(form.sort_order || 0),
        is_active: Boolean(form.is_active),
      };

      if (editingId) {
        await productService.updateCategory(editingId, payload);
        toast.success('Đã cập nhật danh mục');
      } else {
        await productService.createCategory(payload);
        toast.success('Đã tạo danh mục');
      }

      resetForm();
      await loadCategories();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (category: any) => {
    try {
      setSaving(true);
      await productService.updateCategory(String(category.id || category._id), {
        is_active: category.is_active === false,
      });
      await loadCategories();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi trạng thái');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (category: any) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;
    try {
      setSaving(true);
      await productService.deleteCategory(String(category.id || category._id));
      toast.success('Đã xóa danh mục');
      if (editingId === String(category.id || category._id)) resetForm();
      await loadCategories();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa danh mục');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface mb-2">Quản lý Danh mục</h1>
          <p className="text-secondary text-sm">Quản lý cây danh mục cho Shop, Products và bộ lọc admin.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
                placeholder="Tên danh mục"
                required
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
                placeholder="Icon"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={form.parent_id}
                onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
              >
                <option value="">Danh mục cha (không có)</option>
                {categories
                  .filter((c: any) => String(c.id || c._id) !== String(editingId || ''))
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
                value={form.sort_order}
                onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value || 0) }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
                placeholder="STT"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-primary"
                />
                Active
              </label>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {editingId ? 'Lưu' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Mới
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 font-semibold">Đang tải danh mục...</div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-semibold">Chưa có danh mục nào</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((category: any) => {
                const id = String(category.id || category._id);
                const parent = category.parent_id ? categoryMap.get(String(category.parent_id)) : null;
                return (
                  <div key={id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">{category.name}</p>
                      <p className="text-xs text-slate-500">
                        {parent ? `Cha: ${parent.name}` : 'Danh mục gốc'}
                        {' • '}
                        {category.is_active ? 'Đang hoạt động' : 'Đang ẩn'}
                        {' • '}
                        STT: {Number(category.sort_order || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggle(category)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${category.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                      >
                        {category.is_active ? 'Ẩn' : 'Bật'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200"
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
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
