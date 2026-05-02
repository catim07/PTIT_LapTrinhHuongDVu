import { isAIClientReady, requestJsonCompletion, requestTextCompletion } from '../utils/aiClient.js';

const summarySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'pros', 'cons', 'recommendation', 'notes'],
  properties: {
    title: { type: 'string' },
    pros: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    cons: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    recommendation: { type: 'string' },
    notes: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
  },
};

const normalizeLocale = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized.startsWith('en') ? 'en' : 'vi';
};

const languageName = (locale) => (locale === 'en' ? 'English' : 'Vietnamese');

const languageRuleByLocale = (locale) => (
  locale === 'en'
    ? 'Reply strictly in English. Do not include Vietnamese. Do not produce bilingual output.'
    : 'Reply strictly in Vietnamese. Do not include English. Do not produce bilingual output.'
);

const hasVietnameseDiacritics = (text) => /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(String(text || ''));

const englishKeywordRegex = /\b(recommended|budget|users|highlights|consider|comparison|best|value|strong|weak|advantages|disadvantages|product|products|suitable|option)\b/i;

const detectLanguageFromText = (text) => {
  const value = String(text || '').trim();
  if (!value) return 'unknown';

  const hasVietnameseDiacritics = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(value);
  if (hasVietnameseDiacritics) return 'vi';

  const hasEnglishChars = /[a-z]/i.test(value);
  if (hasEnglishChars) return 'en';

  return 'unknown';
};

const detectSummaryLanguage = (summary) => {
  if (!summary || typeof summary !== 'object') return 'unknown';
  const text = [
    summary.title,
    ...(Array.isArray(summary.pros) ? summary.pros : []),
    ...(Array.isArray(summary.cons) ? summary.cons : []),
    summary.recommendation,
    ...(Array.isArray(summary.notes) ? summary.notes : []),
  ]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .join(' ');

  return detectLanguageFromText(text);
};

const summarySegments = (summary) => [
  summary?.title,
  ...(Array.isArray(summary?.pros) ? summary.pros : []),
  ...(Array.isArray(summary?.cons) ? summary.cons : []),
  summary?.recommendation,
  ...(Array.isArray(summary?.notes) ? summary.notes : []),
]
  .map((x) => String(x || '').trim())
  .filter(Boolean);

const hasLocaleViolation = (summary, locale) => {
  const normalizedLocale = normalizeLocale(locale);
  const parts = summarySegments(summary);

  if (normalizedLocale === 'en') {
    return parts.some((part) => hasVietnameseDiacritics(part));
  }

  return parts.some((part) => englishKeywordRegex.test(part) && !hasVietnameseDiacritics(part));
};

const asStringArray = (value, fallback) => {
  const arr = Array.isArray(value) ? value.map((x) => String(x || '').trim()).filter(Boolean) : [];
  return arr.length ? arr.slice(0, 5) : fallback;
};

const buildGroundedTitle = (products, locale = 'vi') => {
  const names = (Array.isArray(products) ? products : [])
    .map((p) => String(p?.name || '').trim())
    .filter(Boolean)
    .slice(0, 3);

  if (names.length >= 2) {
    return locale === 'vi'
      ? `So sánh: ${names.join(' vs ')}`
      : `Comparison: ${names.join(' vs ')}`;
  }

  return locale === 'vi' ? 'Tóm tắt so sánh sản phẩm' : 'Product comparison summary';
};

const isMeaningfulSummary = (raw) => {
  if (!raw || typeof raw !== 'object') return false;
  const pros = Array.isArray(raw.pros) ? raw.pros.filter(Boolean) : [];
  const cons = Array.isArray(raw.cons) ? raw.cons.filter(Boolean) : [];
  const recommendation = String(raw.recommendation || '').trim();
  return pros.length > 0 && cons.length > 0 && recommendation.length >= 20;
};

const titleLooksGrounded = (title, products) => {
  const normalizedTitle = String(title || '').toLowerCase();
  if (!normalizedTitle) return false;
  const productNames = (Array.isArray(products) ? products : [])
    .map((p) => String(p?.name || '').toLowerCase().trim())
    .filter(Boolean);
  if (productNames.length === 0) return false;
  return productNames.some((name) => normalizedTitle.includes(name.slice(0, Math.min(name.length, 12))));
};

const parseBullets = (value) => String(value || '')
  .split(/\r?\n/)
  .map((line) => line.replace(/^[-*•]\s*/, '').trim())
  .filter(Boolean)
  .slice(0, 5);

const parseTextSummary = (text) => {
  const normalized = String(text || '').replace(/\r/g, '').trim();
  const getSection = (name, nextNames = []) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next = nextNames
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const pattern = next
      ? new RegExp(`${escaped}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:${next})\\s*:|$)`, 'i')
      : new RegExp(`${escaped}\\s*:\\s*([\\s\\S]*)`, 'i');
    const match = normalized.match(pattern);
    return match?.[1]?.trim() || '';
  };

  const title = getSection('TITLE', ['PROS', 'CONS', 'RECOMMENDATION', 'NOTES']) || normalized.split(/\n+/)[0] || '';
  const pros = parseBullets(getSection('PROS', ['CONS', 'RECOMMENDATION', 'NOTES']));
  const cons = parseBullets(getSection('CONS', ['RECOMMENDATION', 'NOTES']));
  const recommendation = getSection('RECOMMENDATION', ['NOTES']).replace(/^[-*•]\s*/, '').trim();
  const notes = parseBullets(getSection('NOTES'));

  return {
    title,
    pros,
    cons,
    recommendation,
    notes,
  };
};

const normalizeSummary = (raw, locale = 'vi', products = []) => {
  const normalizedLocale = normalizeLocale(locale);
  const viFallback = {
    title: buildGroundedTitle(products, 'vi'),
    pros: ['Giá trị nổi bật được tổng hợp từ dữ liệu so sánh hiện tại.'],
    cons: ['Một số thuộc tính còn thiếu dữ liệu nên chưa thể kết luận toàn diện.'],
    recommendation: 'Ưu tiên sản phẩm phù hợp ngân sách, nhu cầu và tình trạng tồn kho hiện tại.',
    notes: ['AI chỉ sử dụng dữ liệu đã cung cấp từ bảng so sánh.'],
  };

  const enFallback = {
    title: buildGroundedTitle(products, 'en'),
    pros: ['Key highlights are summarized from the current comparison data.'],
    cons: ['Some fields are missing, so the conclusion cannot be fully comprehensive.'],
    recommendation: 'Prioritize the product that best matches your budget, needs, and current stock status.',
    notes: ['AI summary is grounded only on the provided comparison data.'],
  };

  const fallback = normalizedLocale === 'en' ? enFallback : viFallback;
  const source = raw && typeof raw === 'object' ? raw : {};

  const sourceTitle = String(source.title || '').trim();

  return {
    title: titleLooksGrounded(sourceTitle, products) ? sourceTitle : fallback.title,
    pros: asStringArray(source.pros, fallback.pros),
    cons: asStringArray(source.cons, fallback.cons),
    recommendation: String(source.recommendation || fallback.recommendation).trim(),
    notes: asStringArray(source.notes, fallback.notes),
  };
};

const enforceSummaryLocale = async ({ summary, locale, products }) => {
  const normalizedLocale = normalizeLocale(locale);
  const detectedBefore = detectSummaryLanguage(summary);
  const violation = hasLocaleViolation(summary, normalizedLocale);
  console.info(`[compare-summary] AI response language detected: ${detectedBefore} | violation=${violation}`);

  if ((detectedBefore === 'unknown' || detectedBefore === normalizedLocale) && !violation) {
    return normalizeSummary(summary, normalizedLocale, products);
  }

  try {
    const rewritten = await requestJsonCompletion({
      systemPrompt: [
        'You rewrite product comparison summaries while preserving original meaning and facts.',
        languageRuleByLocale(normalizedLocale),
      ].join(' '),
      userPrompt: JSON.stringify({
        task: 'Rewrite this summary into the target language strictly, keep facts unchanged.',
        target_locale: normalizedLocale,
        summary,
      }),
      schema: summarySchema,
      temperature: 0.1,
      maxTokens: 280,
    });

    const normalized = normalizeSummary(rewritten, normalizedLocale, products);
    const detectedAfter = detectSummaryLanguage(normalized);
    const violationAfter = hasLocaleViolation(normalized, normalizedLocale);
    console.info(`[compare-summary] AI response language after rewrite: ${detectedAfter} | violation=${violationAfter}`);
    return normalized;
  } catch (rewriteErr) {
    console.warn(`[compare-summary] language rewrite failed: ${rewriteErr?.message || 'unknown'}`);
    return normalizeSummary(summary, normalizedLocale, products);
  }
};

export const isCompareAISummaryReady = () => isAIClientReady();

export const buildCompareAISummary = async ({ products, locale = 'vi' }) => {
  if (!Array.isArray(products) || products.length < 2) {
    const err = new Error('Không đủ dữ liệu sản phẩm để tóm tắt');
    err.code = 'INVALID_COMPARE_PRODUCTS';
    throw err;
  }

  const normalizedLocale = normalizeLocale(locale);
  const languageRule = languageRuleByLocale(normalizedLocale);

  console.info(`[compare-summary] prompt locale: ${normalizedLocale}`);
  console.info(`[compare-summary] prompt language rule: ${languageRule}`);

  const systemPrompt = [
    'You are an assistant for e-commerce product comparison analysis.',
    languageRule,
    'Never mix two languages in one answer.',
    'Only use the provided JSON data in products; never speculate outside the data.',
    'Do not add fields outside the output schema.',
    'If data is missing, explicitly mention missing data instead of inventing values.',
    'Keep output concise, practical, and UI-ready.',
  ].join(' ');

  const userPrompt = JSON.stringify({
    locale: normalizedLocale,
    task: 'Tạo summary so sánh sản phẩm dựa trên dữ liệu thật, không bịa thông số.',
    rules: [
      'Không bịa giá, tồn kho, rating, review_count, hạn sử dụng, khuyến mãi, phí vận chuyển.',
      'Nêu điểm mạnh, điểm cần cân nhắc, khác biệt nổi bật và khuyến nghị chọn mua theo nhu cầu.',
      'Không nói đến thuộc tính không tồn tại trong dữ liệu JSON.',
      normalizedLocale === 'en'
        ? 'Reply strictly in English only. Do not include Vietnamese or bilingual output.'
        : 'Reply strictly in Vietnamese only. Do not include English or bilingual output.',
    ],
    products,
  });

  try {
    const raw = await requestJsonCompletion({
      systemPrompt,
      userPrompt,
      schema: summarySchema,
      temperature: 0.1,
      maxTokens: 280,
    });

    if (isMeaningfulSummary(raw)) {
      return await enforceSummaryLocale({
        summary: normalizeSummary(raw, normalizedLocale, products),
        locale: normalizedLocale,
        products,
      });
    }

    const textPrompt = [
      'Return plain text only in this exact format:',
      'TITLE: ...',
      'PROS:',
      '- ...',
      'CONS:',
      '- ...',
      'RECOMMENDATION: ...',
      'NOTES:',
      '- ...',
      `Write content strictly in ${languageName(normalizedLocale)}.`,
      'Keep section labels TITLE, PROS, CONS, RECOMMENDATION, NOTES in English exactly.',
      '',
      userPrompt,
    ].join('\n');

    const enrichedText = await requestTextCompletion({
      systemPrompt,
      userPrompt: textPrompt,
      temperature: 0.1,
      maxTokens: 280,
    });

    return await enforceSummaryLocale({
      summary: normalizeSummary(parseTextSummary(enrichedText), normalizedLocale, products),
      locale: normalizedLocale,
      products,
    });
  } catch (err) {
    if (err?.code === 'AI_NOT_READY' || err?.code === 'AI_AUTH_FAILED' || err?.code === 'AI_TIMEOUT' || err?.code === 'AI_QUOTA_EXCEEDED' || err?.code === 'AI_MODEL_NOT_FOUND' || err?.code === 'AI_REQUEST_FAILED') {
      throw err;
    }

    const textPrompt = [
      'Return plain text only in this exact format:',
      'TITLE: ...',
      'PROS:',
      '- ...',
      'CONS:',
      '- ...',
      'RECOMMENDATION: ...',
      'NOTES:',
      '- ...',
      `Write content strictly in ${languageName(normalizedLocale)}.`,
      'Keep section labels TITLE, PROS, CONS, RECOMMENDATION, NOTES in English exactly.',
      '',
      userPrompt,
    ].join('\n');

    const fallbackText = await requestTextCompletion({
      systemPrompt,
      userPrompt: textPrompt,
      temperature: 0.1,
      maxTokens: 280,
    });

    return await enforceSummaryLocale({
      summary: normalizeSummary(parseTextSummary(fallbackText), normalizedLocale, products),
      locale: normalizedLocale,
      products,
    });
  }
};
