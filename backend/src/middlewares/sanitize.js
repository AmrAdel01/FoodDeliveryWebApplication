import xss from 'xss';

function sanitize(value) {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitize(item)]));
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: sanitize(req.query),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
}
