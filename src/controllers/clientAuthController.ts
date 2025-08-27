import { Request, Response, NextFunction } from 'express';
import { findByCredentials } from '../clients/services/clientService';
import { generateToken } from '../services/jwtService';

export async function issueToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { client_id: clientId, client_secret: clientSecret } = req.body as { client_id?: string; client_secret?: string };
    if (!clientId || !clientSecret) {
      res.status(400).json({ error: 'client_id and client_secret are required' });
      return;
    }
    const client = await findByCredentials(clientId, clientSecret);
    if (!client) {
      res.status(401).json({ error: 'Invalid client credentials' });
      return;
    }
    const token = generateToken({ clientId: client.clientId, name: client.name, scopes: client.scopes || [] });
    res.json({ access_token: token, token_type: 'Bearer' });
  } catch (err) {
    next(err);
  }
}

