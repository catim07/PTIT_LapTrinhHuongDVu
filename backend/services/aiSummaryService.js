import { isAIClientReady, requestJsonCompletion, requestTextCompletion } from '../utils/aiClient.js';

const summarySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['markdown'],
  properties: {
    markdown: { type: 'string' }
  }
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
    summary.summary,
    summary.best_choice?.product_name,
    summary.best_choice?.reason,
    summary.price_analysis,
    summary.quality_analysis,
    summary.value_analysis,
    summary.recommendation,
  ]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .join(' ');

  return detectLanguageFromText(text);
};

const summarySegments = (summary) => [
  summary?.summary,
  summary?.best_choice?.reason,
  summary?.price_analysis,
  summary?.quality_analysis,
  summary?.value_analysis,
  summary?.recommendation,
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
  return Boolean(raw.markdown && raw.markdown.length > 20);
};

const parseBullets = (value) => String(value || '')
  .split(/\r?\n/)
  .map((line) => line.replace(/^[-*•]\s*/, '').trim())
  .filter(Boolean)
  .slice(0, 5);

const parseTextSummary = (text) => {
  return null; // Forcing JSON only to avoid complex parsing of the new schema
};

const normalizeSummary = (raw, locale = 'vi', products = []) => {
  const normalizedLocale = normalizeLocale(locale);
  const fallback = {
    markdown: normalizedLocale === 'en' ? 'Comparison based on current data.' : 'So sánh dựa trên dữ liệu hiện tại.',
  };
  
  if (!raw || typeof raw !== 'object') return fallback;
  
  return {
    markdown: String(raw.markdown || fallback.markdown),
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
      maxTokens: 2000,
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

  const userPrompt = `
Bạn là chuyên gia tư vấn mua sắm.

Dựa vào dữ liệu sản phẩm sau:
${JSON.stringify(products)}

Hãy phân tích CHI TIẾT:
1. So sánh giá (cụ thể từng sản phẩm)
2. Chất lượng (dựa vào brand, mô tả)
3. Giá trị/giá tiền
4. Tình trạng tồn kho
5. Kết luận:
   👉 Sản phẩm nào nên mua? (nêu rõ lý do)
6. Gợi ý theo nhu cầu:
   * Tiết kiệm
   * Chất lượng cao
   * Cân bằng

Không nói chung chung.
Phải nêu tên sản phẩm cụ thể.
Sử dụng emoji thích hợp.
Trả về dữ liệu dạng JSON khớp với schema: { "markdown": "Toàn bộ bài viết markdown vào đây" }.
`;

  try {
    const raw = await requestJsonCompletion({
      systemPrompt,
      userPrompt,
      schema: summarySchema,
      temperature: 0.1,
      maxTokens: 2000,
    });

    if (isMeaningfulSummary(raw)) {
      return await enforceSummaryLocale({
        summary: normalizeSummary(raw, normalizedLocale, products),
        locale: normalizedLocale,
        products,
      });
    }

    return normalizeSummary(null, normalizedLocale, products);
  } catch (err) {
    if (err?.code === 'AI_NOT_READY' || err?.code === 'AI_AUTH_FAILED' || err?.code === 'AI_TIMEOUT' || err?.code === 'AI_QUOTA_EXCEEDED' || err?.code === 'AI_MODEL_NOT_FOUND' || err?.code === 'AI_REQUEST_FAILED') {
      throw err;
    }
    console.error('[compare-summary] AI json generation failed:', err.message);
    throw new Error('AI generation failed');
  }
};
