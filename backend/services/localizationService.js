import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPPORTED_LOCALES = ['vi', 'en', 'ja'];
const DEFAULT_LOCALE = 'vi';
const localeCache = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeLocale = (value) => {
  if (!value) return null;
  const token = String(value).trim().toLowerCase();
  if (!token) return null;
  const primary = token.split(',')[0].split('-')[0].trim();
  return SUPPORTED_LOCALES.includes(primary) ? primary : null;
};

const parseAcceptLanguage = (headerValue) => {
  if (!headerValue) return null;
  const raw = String(headerValue).trim();
  if (!raw) return null;
  const parts = raw.split(',');
  for (const part of parts) {
    const langToken = part.split(';')[0];
    const normalized = normalizeLocale(langToken);
    if (normalized) return normalized;
  }
  return null;
};

export const resolveLocaleDetail = (req) => {
  const queryLang = normalizeLocale(req?.query?.lang || req?.query?.locale);
  if (queryLang) return { locale: queryLang, source: 'query' };

  const headerLang = parseAcceptLanguage(req?.headers?.['accept-language'] || req?.headers?.['x-language']);
  if (headerLang) return { locale: headerLang, source: 'header' };

  const userLang = normalizeLocale(req?.user?.preferences?.language || req?.user?.settings?.language);
  if (userLang) return { locale: userLang, source: 'user' };

  return { locale: DEFAULT_LOCALE, source: 'default' };
};

export const resolveLocale = (req) => resolveLocaleDetail(req).locale;

const loadTranslations = (locale) => {
  if (!SUPPORTED_LOCALES.includes(locale)) return {};
  if (localeCache.has(locale)) return localeCache.get(locale);

  const filePath = path.resolve(__dirname, `../i18n/content/${locale}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    localeCache.set(locale, parsed);
    return parsed;
  } catch (err) {
    const empty = { entities: {}, status: {}, messages: {} };
    localeCache.set(locale, empty);
    return empty;
  }
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const markTranslated = (debug, field, source) => {
  if (!debug) return;
  debug.translated += 1;
  debug.sources[source] = (debug.sources[source] || 0) + 1;
  debug.fields.push(field);
};

const markFallback = (debug, field) => {
  if (!debug) return;
  debug.fallback += 1;
  debug.fallbackFields.push(field);
};

const getEntityTranslation = (translations, entityType, entity) => {
  const entityMap = translations?.entities?.[entityType];
  if (!entityMap || !entity) return null;

  const id = entity._id || entity.id || null;
  const slug = entity.slug || null;
  const code = entity.code || entity.sku || null;
  const name = entity.name || entity.title || null;
  const level = entity.level || null;

  const candidates = [
    { map: entityMap.byId, key: id },
    { map: entityMap.bySlug, key: slug },
    { map: entityMap.byCode, key: code },
    { map: entityMap.byName, key: name || level },
  ];

  for (const candidate of candidates) {
    if (!candidate.map || candidate.key === null || candidate.key === undefined) continue;
    const key = String(candidate.key).trim();
    if (!key) continue;
    if (candidate.map[key]) return candidate.map[key];
  }

  return null;
};

const localizeScalarField = (entityType, entity, field, locale, translations, debug) => {
  const original = entity[field];
  if (locale === DEFAULT_LOCALE) return original;

  const directLocalized = entity?.[`${field}_${locale}`];
  if (isNonEmptyString(directLocalized)) {
    markTranslated(debug, `${entityType}.${field}`, 'field');
    return directLocalized;
  }

  const entityTranslation = getEntityTranslation(translations, entityType, entity);
  if (entityTranslation && isNonEmptyString(entityTranslation[field])) {
    markTranslated(debug, `${entityType}.${field}`, 'map');
    return entityTranslation[field];
  }

  if (locale === 'ja') {
    const fallbackEn = entity?.[`${field}_en`];
    if (isNonEmptyString(fallbackEn)) {
      markTranslated(debug, `${entityType}.${field}`, 'fallback-en');
      return fallbackEn;
    }
  }

  markFallback(debug, `${entityType}.${field}`);
  return original;
};

const localizeArrayField = (entityType, entity, field, locale, translations, debug) => {
  const original = entity[field];
  if (!Array.isArray(original)) return original;
  if (locale === DEFAULT_LOCALE) return original;

  const directLocalized = entity?.[`${field}_${locale}`];
  if (Array.isArray(directLocalized) && directLocalized.length > 0) {
    markTranslated(debug, `${entityType}.${field}`, 'field');
    return directLocalized;
  }

  const entityTranslation = getEntityTranslation(translations, entityType, entity);
  if (entityTranslation && Array.isArray(entityTranslation[field]) && entityTranslation[field].length > 0) {
    markTranslated(debug, `${entityType}.${field}`, 'map');
    return entityTranslation[field];
  }

  if (locale === 'ja') {
    const fallbackEn = entity?.[`${field}_en`];
    if (Array.isArray(fallbackEn) && fallbackEn.length > 0) {
      markTranslated(debug, `${entityType}.${field}`, 'fallback-en');
      return fallbackEn;
    }
  }

  markFallback(debug, `${entityType}.${field}`);
  return original;
};

const localizeBadgeText = (text, translations, debug) => {
  if (!isNonEmptyString(text)) return text;
  const badgeMap = translations?.labels?.badges || {};
  if (badgeMap[text]) {
    markTranslated(debug, 'badge.text', 'map');
    return badgeMap[text];
  }

  const expiryMatch = text.match(/^(?:T\s*\u1edbi\s*h\u1ea1n:|Toi han:)\s*(\d+)\s*ng\u00e0y/i);
  if (expiryMatch) {
    const template = badgeMap.expiryIn || badgeMap.expiry_in || null;
    if (template) {
      markTranslated(debug, 'badge.text', 'template');
      return String(template).replace('{{days}}', expiryMatch[1]);
    }
  }

  const remainMatch = text.match(/^(?:C\u00f2n|Con)\s*(\d+)\s*ng\u00e0y/i);
  if (remainMatch) {
    const template = badgeMap.remainingIn || badgeMap.remaining_in || null;
    if (template) {
      markTranslated(debug, 'badge.text', 'template');
      return String(template).replace('{{days}}', remainMatch[1]);
    }
  }

  markFallback(debug, 'badge.text');
  return text;
};

const ENTITY_FIELDS = {
  product: {
    scalar: [
      'name',
      'description',
      'short_description',
      'usage_guide',
      'storage_instructions',
      'storage_guide',
      'notes',
      'category_name',
      'supplier_name',
      'brand',
      'origin',
      'unit',
    ],
    array: ['highlights', 'product_details', 'recipe_suggestions', 'tags'],
    nested: [{ field: 'promotions', type: 'promotion' }],
  },
  branchProduct: {
    scalar: ['category_name', 'supplier_name'],
    array: [],
    nested: [{ field: 'product', type: 'product' }],
    badges: true,
  },
  category: { scalar: ['name', 'description'], array: [] },
  banner: { scalar: ['title', 'subtitle', 'alt_text'], array: [] },
  hotDeal: { scalar: ['title', 'description', 'badge_text'], array: [] },
  featuredCollection: { scalar: ['title', 'description'], array: [] },
  promotion: { scalar: ['title', 'description', 'badge_text'], array: [] },
  coupon: { scalar: ['title', 'description', 'badge_text'], array: [] },
  event: { scalar: ['title', 'excerpt'], array: [] },
  notification: { scalar: ['title', 'message'], array: [] },
  branch: { scalar: ['name'], array: [] },
  inventoryBatch: {
    scalar: ['product_name', 'category_name', 'supplier_name', 'branch_name'],
    array: [],
    badges: true,
  },
  cart: {
    scalar: [],
    array: [],
    nested: [{ field: 'items', type: 'cartItem' }],
  },
  cartItem: {
    scalar: ['product_name', 'category'],
    array: [],
    nested: [{ field: 'branchProduct', type: 'branchProduct' }],
  },
  viewHistory: { scalar: ['product_name', 'category'], array: [] },
  membershipTier: { scalar: ['level'], array: [] },
  order: {
    scalar: ['branch_name'],
    array: [],
    nested: [
      { field: 'items', type: 'orderItem' },
      { field: 'applied_promotions', type: 'promotion' },
      { field: 'applied_coupon', type: 'coupon' },
      { field: 'gift_items', type: 'giftItem' },
    ],
  },
  orderItem: { scalar: ['product_name', 'category_name', 'supplier_name'], array: [] },
  giftItem: { scalar: ['name'], array: [] },
};

const applyStatusLabel = (entityType, entity, locale, translations) => {
  if (!entity || !entity.status) return entity;
  const statusMap = translations?.status?.[entityType];
  if (!statusMap) return entity;
  const statusKey = String(entity.status).trim();
  const label = statusMap[statusKey] || statusMap[statusKey.toUpperCase()];
  if (isNonEmptyString(label)) {
    entity.status_label = label;
  }
  return entity;
};

const localizeEntity = (entityType, entity, locale, translations, debug) => {
  if (!entity || typeof entity !== 'object') return entity;
  const config = ENTITY_FIELDS[entityType];
  if (!config) return entity;

  const cloned = typeof entity.toObject === 'function' ? entity.toObject() : { ...entity };

  for (const field of config.scalar || []) {
    if (cloned[field] !== undefined && cloned[field] !== null) {
      const localized = localizeScalarField(entityType, cloned, field, locale, translations, debug);
      if (localized !== undefined) cloned[field] = localized;
    }
  }

  for (const field of config.array || []) {
    if (cloned[field] !== undefined && cloned[field] !== null) {
      const localized = localizeArrayField(entityType, cloned, field, locale, translations, debug);
      if (localized !== undefined) cloned[field] = localized;
    }
  }

  for (const nested of config.nested || []) {
    if (!nested?.field || !nested?.type) continue;
    const nestedValue = cloned[nested.field];
    if (Array.isArray(nestedValue)) {
      cloned[nested.field] = nestedValue.map((item) => localizeEntity(nested.type, item, locale, translations, debug));
    } else if (nestedValue && typeof nestedValue === 'object') {
      cloned[nested.field] = localizeEntity(nested.type, nestedValue, locale, translations, debug);
    }
  }

  if (config.badges && Array.isArray(cloned.badges)) {
    cloned.badges = cloned.badges.map((badge) => {
      if (!badge || typeof badge !== 'object') return badge;
      const nextBadge = { ...badge };
      if (isNonEmptyString(nextBadge.text)) {
        nextBadge.text = localizeBadgeText(nextBadge.text, translations, debug);
      }
      return nextBadge;
    });
  }

  applyStatusLabel(entityType, cloned, locale, translations);
  return cloned;
};

const localizeData = (entityType, data, locale, translations, debug) => {
  if (Array.isArray(data)) {
    return data.map((item) => localizeEntity(entityType, item, locale, translations, debug));
  }
  if (data && typeof data === 'object') {
    if (entityType === 'cart') {
      if (Array.isArray(data.items)) {
        return localizeEntity(entityType, data, locale, translations, debug);
      }

      const mapped = {};
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          mapped[key] = value.map((item) => localizeEntity('cartItem', item, locale, translations, debug));
        } else {
          mapped[key] = value;
        }
      });
      return mapped;
    }

    return localizeEntity(entityType, data, locale, translations, debug);
  }
  return data;
};

const resolveEntityType = (req) => {
  const routePath = req?.route?.path ? String(req.route.path) : '';
  const baseUrl = req?.baseUrl ? String(req.baseUrl) : '';
  const combinedRoute = routePath ? `${baseUrl}${routePath}` : '';
  const rawPath = combinedRoute || String(req?.originalUrl || req?.url || '');
  const pathNoQuery = rawPath.split('?')[0];

  if (/\/search\/products/.test(pathNoQuery)) return 'product';
  if (/\/products\//.test(pathNoQuery) && /(reviews|questions|policies|compare)/.test(pathNoQuery)) return null;
  if (/\/products(\/|$)/.test(pathNoQuery)) return 'product';
  if (/\/branch-products(\/|$)/.test(pathNoQuery)) return 'branchProduct';
  if (/\/categories(\/|$)/.test(pathNoQuery)) return 'category';
  if (/\/banners(\/|$)/.test(pathNoQuery)) return 'banner';
  if (/\/(hot-deals|flash-deals)(\/|$)/.test(pathNoQuery)) return 'hotDeal';
  if (/\/featured-collections(\/|$)/.test(pathNoQuery)) return 'featuredCollection';
  if (/\/events(\/|$)/.test(pathNoQuery)) return 'event';
  if (/\/promotions(\/|$)/.test(pathNoQuery)) return 'promotion';
  if (/\/coupons(\/|$)/.test(pathNoQuery)) return 'coupon';
  if (/\/notifications(\/|$)/.test(pathNoQuery)) return 'notification';
  if (/\/branches(\/|$)/.test(pathNoQuery)) return 'branch';
  if (/\/inventory-batches(\/|$)/.test(pathNoQuery)) return 'inventoryBatch';
  if (/\/cart(\/|$)/.test(pathNoQuery)) return 'cart';
  if (/\/view-history(\/|$)/.test(pathNoQuery)) return 'viewHistory';
  if (/\/orders(\/|$)/.test(pathNoQuery)) return 'order';
  if (/\/membership-tiers(\/|$)/.test(pathNoQuery)) return 'membershipTier';

  return null;
};

/**
 * Apply status labels for ANY locale (including default).
 * Status labels like "Chờ xử lý" → "Pending" are always useful for API consumers.
 */
const applyStatusLabelsToCollection = (entityType, data, locale, translations) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => applyStatusLabel(entityType, typeof item?.toObject === 'function' ? item.toObject() : { ...item }, locale, translations));
  }
  if (typeof data === 'object') {
    return applyStatusLabel(entityType, typeof data.toObject === 'function' ? data.toObject() : { ...data }, locale, translations);
  }
  return data;
};

export const localizeApiResponse = (req, body, debugOptions = null) => {
  if (!body || typeof body !== 'object') return body;
  const locale = req?.locale || resolveLocale(req);
  const entityType = resolveEntityType(req);
  if (!entityType) return body;

  const translations = loadTranslations(locale);
  const debug = debugOptions
    ? { translated: 0, fallback: 0, fields: [], fallbackFields: [], sources: {} }
    : null;

  // For default locale: still apply status labels but skip field translations
  if (locale === DEFAULT_LOCALE) {
    const result = { ...body };
    if (result.data !== undefined) {
      result.data = applyStatusLabelsToCollection(entityType, result.data, locale, translations);
    }
    if (result.items !== undefined) {
      result.items = applyStatusLabelsToCollection(entityType, result.items, locale, translations);
    }
    return result;
  }

  const localized = { ...body };

  if (localized.data !== undefined) {
    localized.data = localizeData(entityType, localized.data, locale, translations, debug);
  }
  if (localized.items !== undefined) {
    localized.items = localizeData(entityType, localized.items, locale, translations, debug);
  }

  // Also localize a bare response (no .data/.items wrapper) for direct array/object responses
  if (localized.data === undefined && localized.items === undefined) {
    if (Array.isArray(body)) {
      return body.map(item => localizeEntity(entityType, item, locale, translations, debug));
    }
    // Check if this looks like a single entity (has name/title/status)
    if (body.name || body.title || body.status) {
      const cloned = localizeEntity(entityType, body, locale, translations, debug);
      if (debugOptions && debug) debugOptions.stats = debug;
      return cloned;
    }
  }

  if (isNonEmptyString(localized.message)) {
    const msgMap = translations?.messages || {};
    if (msgMap[localized.message]) {
      localized.message = msgMap[localized.message];
    }
  }

  if (debugOptions && debug) {
    debugOptions.stats = debug;
  }

  return localized;
};
