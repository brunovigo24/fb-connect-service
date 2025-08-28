import axios from 'axios';
import dotenv from 'dotenv';
import { AppDataSource } from '../shared/database/dataSource';
import { Token } from '../tokens/entities/Token';

dotenv.config();

const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v23.0';
const APP_ID = process.env.FACEBOOK_APP_ID as string;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET as string;

export async function getValidUserToken(userId: string): Promise<Token | null> {
  const tokenRepo = AppDataSource.getRepository(Token);
  const token = await tokenRepo.findOne({ where: { user: { id: userId }, provider: 'facebook' }, relations: { user: true } });
  if (!token) return null;

  const now = Date.now();
  if (token.expiresAt && Number(token.expiresAt) - now < 60_000) {
    const refreshed = await refreshUserToken(token);
    return refreshed;
  }
  return token;
}

export async function refreshUserToken(token: Token): Promise<Token> {
  // Troque token de curta duração por token de longa duração, ou renove long-lived
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', APP_ID);
  url.searchParams.set('client_secret', APP_SECRET);
  url.searchParams.set('fb_exchange_token', token.accessToken);

  const res = await axios.get(url.toString());
  const { access_token: newAccessToken, token_type: _tokenType, expires_in: expiresIn } = res.data as { access_token: string; token_type: string; expires_in: number };

  const tokenRepo = AppDataSource.getRepository(Token);
  token.accessToken = newAccessToken;
  token.expiresAt = String(Date.now() + (expiresIn ? expiresIn * 1000 : 0));
  await tokenRepo.save(token);
  return token;
}

