import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from './env';

type Scope = 'mon-amour' | 'admin';

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(data: string): string {
  if (!env.jwtSecret) throw new Error('JWT_SECRET manquant');
  return createHmac('sha256', env.jwtSecret).update(data).digest('base64url');
}

/** Jeton signé HMAC très simple : base64url(payload).signature */
export function createToken(scope: Scope, ttlSeconds: number): string {
  const payload = b64url(JSON.stringify({ scope, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined, scope: Scope): boolean {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.scope === scope && typeof data.exp === 'number' && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

/** Comparaison en temps constant (évite les attaques par mesure du temps). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}

export const COOKIE = { 'mon-amour': 'vn_ma', admin: 'vn_admin' } as const;

export function setCookie(res: VercelResponse, name: string, value: string, maxAge: number): void {
  const parts = [`${name}=${value}`, 'Path=/api', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`];
  if (process.env['VERCEL_ENV'] && process.env['VERCEL_ENV'] !== 'development') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function readCookie(req: VercelRequest, name: string): string | undefined {
  const raw = req.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

export function isAuthorized(req: VercelRequest, scope: Scope): boolean {
  return verifyToken(readCookie(req, COOKIE[scope]), scope);
}
