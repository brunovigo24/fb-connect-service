import { Request, Response, NextFunction } from 'express';

export async function postToFacebookExample(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = req.client;
    res.json({ message: 'Authorized call to post-to-facebook', client, payload: req.body });
  } catch (err) {
    next(err);
  }
}

