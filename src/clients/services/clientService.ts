import { AppDataSource } from '../../shared/database/dataSource';
import { Client } from '../entities/Client';

export async function findByCredentials(clientId: string, clientSecret: string): Promise<Client | null> {
  const repo = AppDataSource.getRepository(Client);
  const client = await repo.findOne({ where: { clientId, clientSecret } });
  return client;
}

