import { NextFunction, Request, Response } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const { method, originalUrl } = req;
  const start = Date.now();
  req.on('close', () => {
    const duration = Date.now() - start;
    // minimal custom log; morgan already logs, but this helps correlate durations
    console.log(`${method} ${originalUrl} - ${duration}ms`);
  });
  next();
}

