const toId = (value: any): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object' && value !== null) {
    if ((value as any).$oid) return String((value as any).$oid);
    if ((value as any).toString) return String((value as any).toString());
  }
  return String(value);
};

const toNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toBool = (value: any, fallback = false): boolean => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
  }
  return Boolean(value);
};

const toImageArray = (raw: any): string[] => {
  if (Array.isArray(raw.images)) {
    return raw.images.map((img: any) => String(img)).filter(Boolean);
  }
  if (typeof raw.image === 'string' && raw.image.trim()) return [raw.image.trim()];
  if (typeof raw.thumbnail === 'string' && raw.thumbnail.trim()) return [raw.thumbnail.trim()];
  return [];
};

export const normalizeProduct = (raw: any): any => {
  const id = toId(raw?.id || raw?._id);
  const categoryId = raw?.category_id !== undefined && raw?.category_id !== null
    ? toId(raw.category_id)
    : '';
  const categoryShop = raw?.category?.name || raw?.categoryShop || raw?.category_name || 'Khac';
  const image = toImageArray(raw)[0] || 'https://via.placeholder.com/600x600?text=Product';
  const price = toNumber(raw?.price, 0);
  const originalPrice = toNumber(raw?.original_price, price);
  const stock = toNumber(raw?.stock, 0);
  const discountPercent = toNumber(
    raw?.discount_percent,
    originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  );

  return {
    ...raw,
    id,
    _id: raw?._id || id || undefined,
    product_id: raw?.product_id ? toId(raw.product_id) : id,
    category_id: categoryId,
    images: toImageArray(raw),
    image,
    categoryShop,
    price,
    original_price: originalPrice,
    discount_percent: discountPercent,
    stock,
    isOutOfStock: stock <= 0,
    sold_count: toNumber(raw?.sold_count, 0),
    review_count: toNumber(raw?.review_count ?? raw?.total_reviews, 0),
    rating: toNumber(raw?.rating ?? raw?.average_rating, 0),
    average_rating: toNumber(raw?.average_rating ?? raw?.rating, 0),
    is_active: toBool(raw?.is_active, true),
    is_new: toBool(raw?.is_new, false),
    is_featured: toBool(raw?.is_featured, false),
    is_best_seller: toBool(raw?.is_best_seller, false),
  };
};

export const normalizeCategory = (raw: any): any => {
  const id = toId(raw?.id || raw?._id);
  const parentId = raw?.parent_id === undefined || raw?.parent_id === null || raw?.parent_id === ''
    ? null
    : toId(raw?.parent_id);

  return {
    ...raw,
    id,
    _id: raw?._id || id || undefined,
    parent_id: parentId,
    sort_order: toNumber(raw?.sort_order, 0),
    product_count: toNumber(raw?.product_count, 0),
    is_active: toBool(raw?.is_active, true),
  };
};

export const normalizeBranchProduct = (raw: any): any => {
  const id = toId(raw?.id || raw?._id);
  const productId = toId(raw?.product_id || raw?.product?.id || raw?.product?._id);
  const branchId = toId(raw?.branch_id);
  const normalizedProduct = raw?.product ? normalizeProduct(raw.product) : null;
  const categoryShop = raw?.categoryShop || raw?.category_name || normalizedProduct?.categoryShop || 'Khac';
  const image = normalizedProduct?.image || toImageArray(raw)[0] || 'https://via.placeholder.com/600x600?text=Product';
  const stock = toNumber(raw?.stock, 0);
  const price = toNumber(raw?.price, 0);
  const originalPrice = toNumber(raw?.original_price, price);
  const discountPercent = toNumber(
    raw?.discount_percent,
    originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0
  );

  return {
    ...raw,
    id,
    _id: raw?._id || id || undefined,
    product_id: productId,
    branch_id: branchId,
    category_id: raw?.category_id ? toId(raw.category_id) : (normalizedProduct?.category_id || ''),
    categoryShop,
    is_active: toBool(raw?.is_active, toBool(raw?.is_available, true)),
    is_available: toBool(raw?.is_available, toBool(raw?.is_active, true)),
    image,
    stock,
    price,
    original_price: originalPrice,
    discount_percent: discountPercent,
    isOutOfStock: stock <= 0,
    sold_count: toNumber(raw?.sold_count, 0),
    product: normalizedProduct,
  };
};

export const normalizeProducts = (input: any): any[] => {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeProduct);
};

export const normalizeCategories = (input: any): any[] => {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeCategory);
};

export const normalizeBranchProducts = (input: any): any[] => {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeBranchProduct);
};

export const normalizeProductLike = (raw: any): any => {
  if (!raw || typeof raw !== 'object') return raw;
  if (raw.product_id || raw.branch_id || raw.is_available !== undefined) {
    return normalizeBranchProduct(raw);
  }
  return normalizeProduct(raw);
};
