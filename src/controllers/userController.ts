import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../shared/database/dataSource';
import { User } from '../users/entities/User';

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await repo.remove(user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


