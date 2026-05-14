import { localizeApiResponse, resolveLocaleDetail } from '../services/localizationService.js';

const appendVaryHeader = (res, value) => {
  const existing = res.getHeader('Vary');
  if (!existing) {
    res.setHeader('Vary', value);
    return;
  }
  const existingValue = String(existing);
  if (!existingValue.toLowerCase().includes(value.toLowerCase())) {
    res.setHeader('Vary', `${existingValue}, ${value}`);
  }
};

export const localizationMiddleware = (req, res, next) => {
  const localeInfo = resolveLocaleDetail(req);
  req.locale = localeInfo.locale;
  req.localeSource = localeInfo.source;
  res.locals.locale = localeInfo.locale;
  res.setHeader('Content-Language', localeInfo.locale);
  appendVaryHeader(res, 'Accept-Language');

  // Always log locale resolution for debuggability
  const debugEnabled = process.env.LOCALE_DEBUG === 'true';
  if (debugEnabled) {
    console.log('[i18n][resolve]', {
      method: req.method,
      path: req.originalUrl || req.url,
      locale: localeInfo.locale,
      source: localeInfo.source,
      headerAcceptLanguage: req.headers?.['accept-language'] || '(none)',
      queryLang: req.query?.lang || '(none)',
    });
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const debugOptions = debugEnabled ? {} : null;
    const localized = localizeApiResponse(req, body, debugOptions);

    if (debugEnabled && debugOptions?.stats) {
      const stats = debugOptions.stats;
      console.log('[i18n][transform]', {
        method: req.method,
        path: req.originalUrl || req.url,
        locale: req.locale,
        source: req.localeSource,
        translatedFields: stats.translated,
        fallbackFields: stats.fallback,
        sources: stats.sources,
      });
    }
    return originalJson(localized);
  };

  next();
};
