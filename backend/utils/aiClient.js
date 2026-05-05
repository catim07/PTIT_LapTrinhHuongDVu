import '../config/loadEnv.js';

const GEMINI_API_BASE = (process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 60000);
const GEMINI_MAX_MODEL_ATTEMPTS = Number(process.env.GEMINI_MAX_MODEL_ATTEMPTS || 2);

const getGeminiModel = () => String(process.env.GEMINI_MODEL || GEMINI_MODEL).replace(/^models\//, '').trim();

const getCandidateModels = () => {
  const models = [
    getGeminiModel(),
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
  ]
    .map((m) => String(m || '').replace(/^models\//, '').trim())
    .filter(Boolean);

  return [...new Set(models)];
};

const hasGeminiKey = () => Boolean(process.env.GEMINI_COMPARE_KEY);

const toGeminiSchemaType = (type) => {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'object') return 'OBJECT';
  if (normalized === 'array') return 'ARRAY';
  if (normalized === 'string') return 'STRING';
  if (normalized === 'number') return 'NUMBER';
  if (normalized === 'integer') return 'INTEGER';
  if (normalized === 'boolean') return 'BOOLEAN';
  return 'STRING';
};

const toGeminiSchema = (schema) => {
  if (!schema || typeof schema !== 'object') {
    return { type: 'OBJECT', properties: {} };
  }

  const result = {
    type: toGeminiSchemaType(schema.type),
  };

  if (Array.isArray(schema.required) && schema.required.length) {
    result.required = schema.required.map((x) => String(x));
  }

  if (schema.properties && typeof schema.properties === 'object') {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, toGeminiSchema(value)]),
    );
  }

  if (schema.items && typeof schema.items === 'object') {
    result.items = toGeminiSchema(schema.items);
  }

  return result;
};

const extractMessageContent = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part) => {
      if (typeof part?.text === 'string') return part.text;
      return '';
    })
    .join('')
    .trim();
};

const parseJsonFromText = (text) => {
  if (!text) return null;

  const cleaned = String(text)
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) {
      const sliced = cleaned.slice(first, last + 1);
      return JSON.parse(sliced);
    }
    throw new Error('AI response is not valid JSON');
  }
};

const callGemini = async (body, modelName = getGeminiModel()) => {
  const apiKey = process.env.GEMINI_COMPARE_KEY;
  if (!apiKey) {
    const err = new Error('AI provider is not configured');
    err.code = 'AI_NOT_READY';
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  const endpoint = `${GEMINI_API_BASE}/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error?.name === 'AbortError') {
      const err = new Error('AI provider timed out');
      err.code = 'AI_TIMEOUT';
      throw err;
    }
    const err = new Error('AI provider request failed');
    err.code = 'AI_REQUEST_FAILED';
    err.model = modelName;
    throw err;
  }

  clearTimeout(timeout);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const providerMessage = data?.error?.message || data?.message || 'AI provider request failed';
    const err = new Error(providerMessage);
    const normalizedMessage = String(providerMessage).toLowerCase();

    if (res.status === 401 || res.status === 403) {
      err.code = 'AI_AUTH_FAILED';
    } else if (res.status === 404) {
      err.code = 'AI_MODEL_NOT_FOUND';
    } else if (res.status === 429 || normalizedMessage.includes('quota') || normalizedMessage.includes('rate limit') || normalizedMessage.includes('too many requests')) {
      err.code = 'AI_QUOTA_EXCEEDED';
    } else {
      err.code = 'AI_REQUEST_FAILED';
    }

    err.status = res.status;
    err.providerMessage = providerMessage;
    err.model = modelName;
    throw err;
  }

  return data;
};

const isRetryableModelError = (err) => {
  if (!err) return false;
  if (err.code === 'AI_QUOTA_EXCEEDED' || err.code === 'AI_TIMEOUT' || err.code === 'AI_MODEL_NOT_FOUND') return true;
  if (err.code === 'AI_REQUEST_FAILED') {
    const msg = String(err.message || '').toLowerCase();
    if (msg.includes('high demand') || msg.includes('try again later') || msg.includes('unavailable') || msg.includes('overload')) {
      return true;
    }
  }
  return false;
};

const callGeminiWithFallback = async (body) => {
  const models = getCandidateModels().slice(0, Math.max(1, GEMINI_MAX_MODEL_ATTEMPTS));
  let lastErr;

  for (const model of models) {
    try {
      return await callGemini(body, model);
    } catch (err) {
      lastErr = err;
      if (!isRetryableModelError(err)) {
        throw err;
      }
    }
  }

  throw lastErr || new Error('AI provider request failed');
};

export const isAIClientReady = () => hasGeminiKey();

export const requestJsonCompletion = async ({ systemPrompt, userPrompt, schema, temperature = 0.1, maxTokens = 900 }) => {
  if (!isAIClientReady()) {
    const err = new Error('AI provider is not configured');
    err.code = 'AI_NOT_READY';
    throw err;
  }

  const fullPrompt = [
    userPrompt,
    'IMPORTANT: Return only a JSON object.',
    'The output JSON must match this schema exactly:',
    JSON.stringify(schema),
  ].join('\n\n');

  const geminiSchema = toGeminiSchema(schema);

  try {
    const response = await callGeminiWithFallback({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
        responseSchema: geminiSchema,
      },
    });

    return parseJsonFromText(extractMessageContent(response));
  } catch (err) {
    if (err?.code === 'AI_NOT_READY' || err?.code === 'AI_AUTH_FAILED' || err?.code === 'AI_TIMEOUT' || err?.code === 'AI_QUOTA_EXCEEDED' || err?.code === 'AI_MODEL_NOT_FOUND') throw err;

    const fallbackResponse = await callGeminiWithFallback({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const fallbackText = extractMessageContent(fallbackResponse);

    try {
      return parseJsonFromText(fallbackText);
    } catch {
      const repairPrompt = [
        'Convert the following content into valid JSON object that matches the schema exactly.',
        'Do not add extra fields. Do not include markdown.',
        `Schema: ${JSON.stringify(schema)}`,
        `Content: ${fallbackText}`,
      ].join('\n\n');

      const repairResponse = await callGeminiWithFallback({
        contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
          responseSchema: geminiSchema,
        },
      });

      return parseJsonFromText(extractMessageContent(repairResponse));
    }
  }
};

export const requestTextCompletion = async ({ systemPrompt, userPrompt, temperature = 0.2, maxTokens = 500 }) => {
  if (!isAIClientReady()) {
    const err = new Error('AI provider is not configured');
    err.code = 'AI_NOT_READY';
    throw err;
  }

  const response = await callGeminiWithFallback({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const text = extractMessageContent(response);
  if (!text) {
    const err = new Error('AI provider returned empty response');
    err.code = 'AI_EMPTY_RESPONSE';
    throw err;
  }

  return text;
};
