import { filterXSS } from 'xss';

const clean = (value) => {
  if (typeof value === 'string') return filterXSS(value);
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = clean(value[key]);
  }
  return value;
};

const sanitizeBody = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  next();
};

export default sanitizeBody;
