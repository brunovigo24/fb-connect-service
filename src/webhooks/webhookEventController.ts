import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../shared/database/dataSource';
import { WebhookEvent } from './entities/WebhookEvent';

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pageId, since, until, limit = '50' } = req.query as { pageId?: string; since?: string; until?: string; limit?: string };
    const repo = AppDataSource.getRepository(WebhookEvent);
    const qb = repo.createQueryBuilder('e').orderBy('e.createdAt', 'DESC');
    if (pageId) qb.andWhere('e.facebookPageId = :pageId', { pageId });
    if (since) qb.andWhere('e.createdAt >= :since', { since });
    if (until) qb.andWhere('e.createdAt <= :until', { until });
    qb.limit(Math.min(Number(limit) || 50, 200));
    const events = await qb.getMany();
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(WebhookEvent);
    const event = await repo.findOne({ where: { id } });
    if (!event) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}


