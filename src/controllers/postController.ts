import { Request, Response, NextFunction } from 'express';
import { createPagePost, createBulkPagePosts } from '../services/facebookPostService';

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pageId } = req.params;
    const { message, link, mediaUrl } = req.body as { message?: string; link?: string; mediaUrl?: string };
    const result = await createPagePost({ pageId, message, link, mediaUrl });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function createBulkPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pageId } = req.params;
    const posts = req.body as Array<{ message?: string; link?: string; mediaUrl?: string }>;
    const result = await createBulkPagePosts(pageId, posts);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

