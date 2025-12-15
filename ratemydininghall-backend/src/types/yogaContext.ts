import type { Db } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type AuthUser = { sub: string; role: 'admin' | 'user' };

export type YogaContext = {
  req: VercelRequest;
  res: VercelResponse;
  db: Db;
  user: AuthUser | null;
};
