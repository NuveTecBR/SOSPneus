const buckets = new Map();

export function createRateLimiter({ windowMs = 60 * 1000, max = 60, mensagem = 'Muitas requisições deste IP.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let reg = buckets.get(key);
    if (!reg || now > reg.resetTime) {
      reg = { count: 0, resetTime: now + windowMs };
      buckets.set(key, reg);
    }

    reg.count += 1;
    const retryAfterSec = Math.max(1, Math.ceil((reg.resetTime - now) / 1000));
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - reg.count)));

    if (reg.count > max) {
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({ erro: mensagem, retryAfter: retryAfterSec });
    }
    next();
  };
}

export const authRateLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 });
export const apiPublicLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120 });
export const sosSubmitLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 15 });
