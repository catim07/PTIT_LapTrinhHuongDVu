export const paginateQuery = (query, { page = 1, limit = 20, sort = '-created_at' }) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return query.sort(sort).skip((p - 1) * l).limit(l);
};

export const paginateMeta = (total, { page = 1, limit = 20 }) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { page: p, limit: l, total, totalPages: Math.ceil(total / l) };
};

export const ok = (res, data, message = 'Success', meta) => {
  const body = { success: true, data, message };
  if (meta) body.meta = meta;
  return res.json(body);
};

export const created = (res, data, message = 'Created') =>
  res.status(201).json({ success: true, data, message });

export const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });
