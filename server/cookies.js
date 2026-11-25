import crypto from 'node:crypto';

const COOKIE_NAME = 'app_session';
const SECRET = process.env.SESSION_SECRET;
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.sub,
      email: user.email,
      name: user.name,
      exp: Date.now() + TTL_MS,
    })
  ).toString('base64url');

  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${sig}`;
}

export function readSessionToken(req) {
  const raw = req.cookies?.[COOKIE_NAME];
  if (typeof raw !== 'string') return null;

  const dotIdx = raw.indexOf('.');
  if (dotIdx <= 0) return null;

  const payload = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);

  const expectedSig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: TTL_MS,
  });
}

export function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
  });
}