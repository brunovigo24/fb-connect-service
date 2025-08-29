import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  next();
}

