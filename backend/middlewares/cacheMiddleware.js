import { getCache, setCache } from '../services/redisService.js';
import { resolveLocale } from '../services/localizationService.js';

export const cacheMiddleware = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip if user is authenticated (unless it's a global resource)
    // To be safe, we'll cache based on URL. If it needs user-specific, we should add user_id to key.
    const isAuthRequest = req.headers.authorization;
    const locale = resolveLocale(req);
    const key = `cache:${locale}:${req.originalUrl || req.url}${isAuthRequest ? `:${req.user?.id || 'auth'}` : ''}`;

    try {
      const cached = await getCache(key);
      if (cached) {
        return res.json(cached);
      }

      // Overwrite res.json to intercept the response
      const originalJson = res.json;
      res.json = function (body) {
        // Only cache success responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, ttlSeconds).catch(err => console.error('Cache set error', err));
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      next(); // fallback to normal execution if cache errors
    }
  };
};
