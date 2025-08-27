import { NextFunction, Request, Response } from 'express';
import { verifyToken, ClientJwtPayload } from '../services/jwtService';

declare module 'express-serve-static-core' {
  interface Request {
    client?: ClientJwtPayload;
  }
}

export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const payload = verifyToken(token);
    req.client = { clientId: payload.clientId, name: payload.name, scopes: payload.scopes };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

