import i18n from '../i18n';

export interface ViewHistoryTrackPayload {
  product_id?: string | number;
  branch_product_id?: string | number;
  product_name?: string;
  product_image?: string;
  price?: number;
  original_price?: number;
  category?: string;
  viewed_at?: string;
}

export interface ViewHistoryItem {
  id: string;
  product_id: string;
  branch_product_id: string | null;
  product_name: string;
  product_image: string;
  price: number;
  original_price: number;
  category: string;
  viewed_at: string;
  view_count: number;
  stock?: number;
  in_stock?: boolean;
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x300?text=Product';

const toSafeString = (value: unknown, fallback = ''): string => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const toSafeNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toSafeISODate = (value: unknown): string => {
  const date = value ? new Date(String(value)) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const buildSyntheticId = (input: any): string => {
  const productId = toSafeString(input?.product_id || input?.productId || '');
  const branchProductId = toSafeString(input?.branch_product_id || input?.branchProductId || '');
  const viewedAt = toSafeISODate(input?.viewed_at || input?.viewedAt || new Date().toISOString());
  return `${productId || 'unknown'}:${branchProductId || 'none'}:${viewedAt}`;
};

export const normalizeViewHistoryItem = (input: any): ViewHistoryItem | null => {
  if (!input || typeof input !== 'object') return null;

  const productId = toSafeString(input.product_id || input.productId || input.id || input._id || '');
  if (!productId) return null;

  const viewedAt = toSafeISODate(input.viewed_at || input.viewedAt || input.updated_at || input.updatedAt || input.created_at || input.createdAt);

  const id = toSafeString(input.id || input._id || '', buildSyntheticId({
    product_id: productId,
    branch_product_id: input.branch_product_id || input.branchProductId || null,
    viewed_at: viewedAt,
  }));

  return {
    id,
    product_id: productId,
    branch_product_id: toSafeString(input.branch_product_id || input.branchProductId || '') || null,
    product_name: toSafeString(input.product_name || input.productName || input.name || i18n.t('common.product')),
    product_image: toSafeString(input.product_image || input.productImage || input.image || '', FALLBACK_IMAGE),
    price: toSafeNumber(input.price, 0),
    original_price: toSafeNumber(input.original_price || input.originalPrice, 0),
    category: toSafeString(input.category || input.category_name || input.categoryName || ''),
    viewed_at: viewedAt,
    view_count: Math.max(1, toSafeNumber(input.view_count || input.viewCount, 1)),
    stock: input.stock !== undefined ? toSafeNumber(input.stock, 0) : undefined,
    in_stock: input.in_stock !== undefined ? Boolean(input.in_stock) : undefined,
  };
};
