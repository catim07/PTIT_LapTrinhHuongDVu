type AnyRecord = Record<string, any>;

const toNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toDateTimestamp = (value: any): number | null => {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : null;
};

const toArrayStrings = (value: any): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
};

export type NormalizedFlashDeal = {
  id: string;
  _id: string;
  title: string;
  name: string;
  image: string;
  image_url: string;
  is_active: boolean;
  status: 'active' | 'draft' | 'expired';
  start_date: string | null;
  end_date: string | null;
  total_quantity: number | null;
  remaining_quantity: number | null;
  stock_limit: number | null;
  sold_count: number;
  discount_value: number;
  discount_percent: number;
  deal_price: number;
  original_price: number;
  product_id: string;
  branch_product_id: string;
  product_ids: string[];
  branch_ids: string[];
  category_ids: string[];
  raw: AnyRecord;
};

export type FlashDealVisibilityContext = {
  now?: number;
  branchId?: string;
  categoryId?: string;
};

export type FlashDealVisibility = {
  eligible: boolean;
  reasons: string[];
  inWindow: boolean;
  inStock: boolean;
  activeState: boolean;
  scopeMatched: boolean;
};

export const normalizeFlashDeal = (input: AnyRecord): NormalizedFlashDeal | null => {
  if (!input || typeof input !== 'object') return null;

  const id = String(input.id || input._id || '').trim();
  if (!id) return null;

  const startTs = toDateTimestamp(input.start_date);
  const endTs = toDateTimestamp(input.end_date);
  const now = Date.now();

  const rawStatus = String(input.status || '').toLowerCase();
  const isExplicitActive = input.is_active !== false;

  let status: 'active' | 'draft' | 'expired' = 'active';
  if (rawStatus === 'expired' || (endTs !== null && endTs <= now)) {
    status = 'expired';
  } else if (!isExplicitActive || (startTs !== null && startTs > now)) {
    status = 'draft';
  }

  const totalQuantityRaw = input.total_quantity ?? input.stock_limit ?? null;
  const totalQuantity = totalQuantityRaw === null || totalQuantityRaw === undefined || totalQuantityRaw === ''
    ? null
    : Math.max(0, toNumber(totalQuantityRaw, 0));

  const remainingRaw = input.remaining_quantity;
  const remainingQuantity = remainingRaw === null || remainingRaw === undefined || remainingRaw === ''
    ? null
    : Math.max(0, toNumber(remainingRaw, 0));

  return {
    id,
    _id: id,
    title: String(input.title || input.name || '').trim(),
    name: String(input.name || input.title || '').trim(),
    image: String(input.image_url || input.image || '').trim(),
    image_url: String(input.image_url || input.image || '').trim(),
    is_active: status === 'active',
    status,
    start_date: startTs !== null ? new Date(startTs).toISOString() : null,
    end_date: endTs !== null ? new Date(endTs).toISOString() : null,
    total_quantity: totalQuantity,
    remaining_quantity: remainingQuantity,
    stock_limit: totalQuantity,
    sold_count: Math.max(0, toNumber(input.sold_count, 0)),
    discount_value: Math.max(0, toNumber(input.discount_value, 0)),
    discount_percent: Math.max(0, toNumber(input.discount_percent || input.discount_value, 0)),
    deal_price: Math.max(0, toNumber(input.deal_price, 0)),
    original_price: Math.max(0, toNumber(input.original_price, 0)),
    product_id: String(input.product_id || '').trim(),
    branch_product_id: String(input.branch_product_id || '').trim(),
    product_ids: toArrayStrings(input.target_product_ids || input.product_ids),
    branch_ids: toArrayStrings(input.target_branch_ids || input.branch_ids),
    category_ids: toArrayStrings(input.target_category_ids || input.category_ids),
    raw: input,
  };
};

export const normalizeFlashDealArray = (input: any): NormalizedFlashDeal[] => {
  const list = Array.isArray(input) ? input : [];
  return list.map((item) => normalizeFlashDeal(item)).filter(Boolean) as NormalizedFlashDeal[];
};

export const evaluateFlashDealVisibility = (
  deal: NormalizedFlashDeal,
  context: FlashDealVisibilityContext = {},
): FlashDealVisibility => {
  const now = context.now ?? Date.now();
  const startTs = toDateTimestamp(deal.start_date);
  const endTs = toDateTimestamp(deal.end_date);

  const inWindow = (!startTs || startTs <= now) && (!endTs || endTs > now);

  const limit = Math.max(0, toNumber(deal.total_quantity ?? deal.stock_limit ?? 0, 0));
  const hasLimit = limit > 0;
  const remaining = deal.remaining_quantity;
  const inStock = !hasLimit || remaining === null || remaining > 0;

  const activeState = deal.is_active === true && String(deal.status || '').toLowerCase() === 'active';

  const branchId = String(context.branchId || '').trim();
  const categoryId = String(context.categoryId || '').trim();

  const branchOk = !branchId || deal.branch_ids.length === 0 || deal.branch_ids.includes(branchId);
  const categoryOk = !categoryId || deal.category_ids.length === 0 || deal.category_ids.includes(categoryId);
  const scopeMatched = branchOk && categoryOk;

  const reasons: string[] = [];
  if (!activeState) reasons.push('inactive_or_non_active_status');
  if (!inWindow) reasons.push('outside_time_window');
  if (!inStock) reasons.push('out_of_stock');
  if (!scopeMatched) reasons.push('scope_mismatch');

  return {
    eligible: activeState && inWindow && inStock && scopeMatched,
    reasons,
    inWindow,
    inStock,
    activeState,
    scopeMatched,
  };
};

export const filterVisibleFlashDeals = (
  deals: NormalizedFlashDeal[],
  context: FlashDealVisibilityContext = {},
): NormalizedFlashDeal[] => {
  return deals.filter((deal) => evaluateFlashDealVisibility(deal, context).eligible);
};
