import type { User } from '../types';
import { dataService } from './dataService';
import httpClient from '../api/httpClient';
import { endpoints } from '../api/endpoints';
import i18n from '../i18n';
import type { ViewHistoryItem, ViewHistoryTrackPayload } from '../types/viewHistory';
import { normalizeViewHistoryItem } from '../types/viewHistory';

const LOCAL_HISTORY_KEY = 'view_history';
const LEGACY_LOCAL_HISTORY_KEY = 'lotte_view_history_guest_v1';
const MAX_LOCAL_ITEMS = 100;
const MERGE_BATCH_LIMIT = 100;

interface ViewHistoryAuthContext {
  isAuthenticated: boolean;
  user?: Partial<User> | null;
}

const toSafeString = (value: unknown): string => String(value ?? '').trim();

const toSafeNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const resolveViewedAt = (value?: string): string => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const getUserId = (auth?: ViewHistoryAuthContext): string => {
  const user = auth?.user || null;
  return toSafeString((user as any)?.id || (user as any)?._id || (user as any)?.user_id || '');
};

const toProductKey = (item: Pick<ViewHistoryTrackPayload, 'product_id'> | Pick<ViewHistoryItem, 'product_id'>): string => {
  return toSafeString(item?.product_id || '');
};

const buildLocalId = (productId: string): string => `local:${productId}`;

const normalizeTrackPayload = (payload: ViewHistoryTrackPayload): ViewHistoryTrackPayload => {
  return {
    product_id: toSafeString(payload.product_id || ''),
    branch_product_id: toSafeString(payload.branch_product_id || '') || undefined,
    product_name: toSafeString(payload.product_name || '') || i18n.t('common.product'),
    product_image: toSafeString(payload.product_image || '') || 'https://via.placeholder.com/300x300?text=Product',
    price: toSafeNumber(payload.price, 0),
    original_price: toSafeNumber(payload.original_price, 0),
    category: toSafeString(payload.category || ''),
    viewed_at: resolveViewedAt(payload.viewed_at),
  };
};

const sortByViewedAtDesc = (rows: ViewHistoryItem[]): ViewHistoryItem[] => {
  return [...rows].sort((a, b) => {
    const ta = new Date(a.viewed_at).getTime();
    const tb = new Date(b.viewed_at).getTime();
    return tb - ta;
  });
};

const parseStoredHistoryRows = (raw: string | null): ViewHistoryItem[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeViewHistoryItem(item))
      .filter(Boolean) as ViewHistoryItem[];
  } catch {
    return [];
  }
};

const readLocalHistory = (): ViewHistoryItem[] => {
  const primary = parseStoredHistoryRows(localStorage.getItem(LOCAL_HISTORY_KEY));
  const legacy = parseStoredHistoryRows(localStorage.getItem(LEGACY_LOCAL_HISTORY_KEY));

  const deduped = new Map<string, ViewHistoryItem>();
  [...primary, ...legacy].forEach((item) => {
    const key = toProductKey(item);
    if (!key) return;
    const current = deduped.get(key);
    if (!current || new Date(item.viewed_at).getTime() >= new Date(current.viewed_at).getTime()) {
      deduped.set(key, item);
    }
  });

  return sortByViewedAtDesc(Array.from(deduped.values())).slice(0, MAX_LOCAL_ITEMS);
};

const writeLocalHistory = (items: ViewHistoryItem[]) => {
  const normalized = sortByViewedAtDesc(
    items
      .map((item) => normalizeViewHistoryItem(item))
      .filter(Boolean) as ViewHistoryItem[],
  ).slice(0, MAX_LOCAL_ITEMS);

  const serialized = JSON.stringify(normalized);
  localStorage.setItem(LOCAL_HISTORY_KEY, serialized);
  localStorage.setItem(LEGACY_LOCAL_HISTORY_KEY, serialized);
};

const upsertLocalHistory = (payload: ViewHistoryTrackPayload): ViewHistoryItem | null => {
  const productId = toProductKey(payload);
  if (!productId) return null;

  const viewedAt = resolveViewedAt(payload.viewed_at);
  const current = readLocalHistory();
  const existing = current.find((item) => toProductKey(item) === productId);

  const nextItem = normalizeViewHistoryItem({
    id: buildLocalId(productId),
    product_id: productId,
    branch_product_id: payload.branch_product_id || null,
    product_name: payload.product_name || existing?.product_name || i18n.t('common.product'),
    product_image: payload.product_image || existing?.product_image || '',
    price: payload.price ?? existing?.price ?? 0,
    original_price: payload.original_price ?? existing?.original_price ?? 0,
    category: payload.category || existing?.category || '',
    viewed_at: viewedAt,
    view_count: Math.max(1, Number(existing?.view_count || 0) + 1),
    stock: existing?.stock,
    in_stock: existing?.in_stock,
  });

  if (!nextItem) return null;

  const filtered = current.filter((item) => toProductKey(item) !== productId);
  writeLocalHistory([nextItem, ...filtered]);
  return nextItem;
};

const removeLocalHistoryItem = (id: string): void => {
  const next = readLocalHistory().filter((item) => String(item.id) !== String(id));
  writeLocalHistory(next);
};

const clearLocalHistory = (): void => {
  localStorage.removeItem(LOCAL_HISTORY_KEY);
  localStorage.removeItem(LEGACY_LOCAL_HISTORY_KEY);
};

const normalizeRemoteRows = (rows: any[]): ViewHistoryItem[] => {
  return sortByViewedAtDesc(
    (Array.isArray(rows) ? rows : [])
      .map((item) => normalizeViewHistoryItem(item))
      .filter(Boolean) as ViewHistoryItem[],
  );
};

let mergeInFlight: Promise<void> | null = null;
let mergedUserId = '';

const mergeLocalIntoServer = async (auth: ViewHistoryAuthContext): Promise<void> => {
  const userId = getUserId(auth);
  if (!auth?.isAuthenticated || !userId) return;

  const localRows = readLocalHistory();
  console.log('[viewHistoryService] mergeLocalIntoServer', {
    userId,
    localCount: localRows.length,
  });

  if (localRows.length === 0) {
    mergedUserId = userId;
    return;
  }

  if (mergeInFlight) {
    await mergeInFlight;
    return;
  }

  mergeInFlight = (async () => {
    try {
      const payload = localRows.slice(0, MERGE_BATCH_LIMIT).map((item) => ({
        product_id: item.product_id,
        branch_product_id: item.branch_product_id || undefined,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        original_price: item.original_price,
        category: item.category,
        viewed_at: item.viewed_at,
      }));

      await dataService.mergeViewedHistory(payload);
      clearLocalHistory();
      mergedUserId = userId;
      console.log('[viewHistoryService] mergeLocalIntoServer success', {
        userId,
        mergedCount: payload.length,
      });
    } catch (error) {
      console.error('[viewHistoryService] mergeLocalIntoServer failed', {
        userId,
        error,
      });
      throw error;
    } finally {
      mergeInFlight = null;
    }
  })();

  await mergeInFlight;
};

type SaveViewHistoryInput = {
  id?: string | number;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  image?: string;
  product_image?: string;
  price?: number;
  original_price?: number;
  category?: string;
  branch_product_id?: string | number;
  viewed_at?: string;
};

const toTrackPayload = (product: SaveViewHistoryInput): ViewHistoryTrackPayload => {
  return {
    product_id: product.product_id ?? product.id,
    branch_product_id: product.branch_product_id,
    product_name: product.product_name ?? product.name,
    product_image: product.product_image ?? product.image,
    price: product.price,
    original_price: product.original_price,
    category: product.category,
    viewed_at: product.viewed_at,
  };
};

export const saveViewHistory = async (
  product: SaveViewHistoryInput,
  auth?: ViewHistoryAuthContext,
): Promise<ViewHistoryItem | null> => {
  const payload = normalizeTrackPayload(toTrackPayload(product));
  if (!payload.product_id) return null;

  const debugPayload = {
    product_id: payload.product_id,
    name: payload.product_name,
    image: payload.product_image,
    price: payload.price,
  };

  console.log('CALL API VIEW HISTORY', debugPayload);

  const token = localStorage.getItem('lottemart_token') || localStorage.getItem('accessToken');
  if (!token) {
    return upsertLocalHistory(payload);
  }

  try {
    if (auth?.isAuthenticated && getUserId(auth)) {
      await mergeLocalIntoServer(auth).catch(() => {});
    }

    const res = await httpClient.post(endpoints.viewHistory.track, {
      product_id: payload.product_id,
      name: payload.product_name,
      image: payload.product_image,
      price: payload.price,
      product_name: payload.product_name,
      product_image: payload.product_image,
      branch_product_id: payload.branch_product_id,
      original_price: payload.original_price,
      category: payload.category,
      viewed_at: payload.viewed_at,
    });
    const responsePayload = res?.data ?? res;
    const normalized = normalizeViewHistoryItem(responsePayload?.data || responsePayload);
    return normalized || upsertLocalHistory(payload);
  } catch (err) {
    console.error('SAVE HISTORY ERROR', err);
    return upsertLocalHistory(payload);
  }
};

export const getViewHistory = async (): Promise<ViewHistoryItem[]> => {
  const token = localStorage.getItem('lottemart_token') || localStorage.getItem('accessToken');
  if (!token) {
    console.log('[viewHistoryService] getViewHistory source=local reason=no_token');
    return readLocalHistory();
  }

  try {
    const res = await httpClient.get(endpoints.viewHistory.list);
    const responsePayload = res?.data ?? res;
    const rows = normalizeRemoteRows(Array.isArray(responsePayload?.data) ? responsePayload.data : []);
    if (rows.length > 0) {
      writeLocalHistory(rows);
      console.log('[viewHistoryService] getViewHistory source=server rows', rows.length);
      return rows;
    }

    console.log('[viewHistoryService] getViewHistory source=local reason=server_empty');
    return readLocalHistory();
  } catch {
    console.log('[viewHistoryService] getViewHistory source=local reason=server_error');
    return readLocalHistory();
  }
};

export const viewHistoryService = {
  getLocalHistory: (): ViewHistoryItem[] => readLocalHistory(),

  async mergeLocalOnLogin(auth: ViewHistoryAuthContext): Promise<void> {
    const userId = getUserId(auth);
    if (!auth?.isAuthenticated || !userId) return;
    if (mergedUserId === userId && readLocalHistory().length === 0) return;

    try {
      await mergeLocalIntoServer(auth);
    } catch {
      // Keep local rows for retry.
    }
  },

  async trackProductView(payload: ViewHistoryTrackPayload, auth: ViewHistoryAuthContext): Promise<ViewHistoryItem | null> {
    return saveViewHistory(payload, auth);
  },

  async getHistory(auth: ViewHistoryAuthContext): Promise<ViewHistoryItem[]> {
    if (auth?.isAuthenticated && getUserId(auth)) {
      await this.mergeLocalOnLogin(auth).catch(() => {});
    }

    return getViewHistory();
  },

  async removeHistoryItem(id: string, auth: ViewHistoryAuthContext): Promise<void> {
    const userId = getUserId(auth);
    if (auth?.isAuthenticated && userId && !String(id).startsWith('local:')) {
      await dataService.removeViewedHistory(id);
      return;
    }

    removeLocalHistoryItem(id);
  },

  async clearHistory(auth: ViewHistoryAuthContext): Promise<void> {
    const userId = getUserId(auth);
    if (auth?.isAuthenticated && userId) {
      await dataService.clearViewedHistory();
      return;
    }

    clearLocalHistory();
  },
};

export default viewHistoryService;
