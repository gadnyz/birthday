import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from './env';

export function json(res: VercelResponse, status: number, body: unknown): void {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, { error: 'method_not_allowed' });
}

export function body<T = Record<string, unknown>>(req: VercelRequest): T {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      return {} as T;
    }
  }
  return (req.body ?? {}) as T;
}

/** Empreinte de l'adresse IP (on ne stocke jamais l'IP en clair). */
export function ipHash(req: VercelRequest): string {
  const fwd = String(req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim();
  const ip = fwd || req.socket?.remoteAddress || 'unknown';
  return createHash('sha256').update(`${ip}:${env.jwtSecret}`).digest('hex').slice(0, 32);
}

export function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
