const COMPARISON_OPERATORS = ['gte', 'gt', 'lte', 'lt', 'ne'];

export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Translates a request query string into a safe Mongo filter.
 *
 * Only fields named in `allowedFilters` are honoured, and only the comparison
 * operators listed above are accepted. The original implementation JSON.parsed
 * req.query straight into .find(), which let a caller smuggle in $where or
 * $expr and read arbitrary documents.
 */
export const buildFilter = (query, { allowedFilters = [], searchFields = [] } = {}) => {
  const filter = {};

  for (const field of allowedFilters) {
    const raw = query[field];
    if (raw === undefined || raw === '') continue;

    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const conditions = {};
      for (const [op, value] of Object.entries(raw)) {
        if (!COMPARISON_OPERATORS.includes(op)) continue;
        const numeric = Number(value);
        conditions[`$${op}`] = Number.isNaN(numeric) ? value : numeric;
      }
      if (Object.keys(conditions).length) filter[field] = conditions;
      continue;
    }

    const values = String(raw)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (values.length > 1) filter[field] = { $in: values };
    else if (values.length === 1) filter[field] = values[0];
  }

  const term = typeof query.search === 'string' ? query.search.trim() : '';
  if (term && searchFields.length) {
    const pattern = new RegExp(escapeRegex(term), 'i');
    filter.$or = searchFields.map((field) => ({ [field]: pattern }));
  }

  return filter;
};

export const buildSort = (sortKey, sortMap, fallback) =>
  sortMap[sortKey] || fallback;

export const buildPagination = (query, { defaultLimit = 12, maxLimit = 60 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requested = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requested), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

export const paginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages: Math.max(1, Math.ceil(total / limit)),
});
