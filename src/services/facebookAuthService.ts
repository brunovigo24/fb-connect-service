import axios from 'axios';
import dotenv from 'dotenv';
import { AppDataSource } from '../shared/database/dataSource';
import { User } from '../users/entities/User';
import { Token } from '../tokens/entities/Token';
import { Page } from '../pages/entities/Page';

dotenv.config();

const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v23.0';
const APP_ID = process.env.FACEBOOK_APP_ID as string;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET as string;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI as string;

export function buildFacebookAuthURL(state?: string): string {
  const DEFAULT_SCOPES = [
    'public_profile',
    'email',
    'pages_manage_posts',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'pages_read_user_content',
    'pages_manage_engagement',
  ];
  const scopeEnv = process.env.FACEBOOK_SCOPES;
  const scope = (scopeEnv ? scopeEnv.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_SCOPES).join(',');
  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set('client_id', APP_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
}

export async function handleFacebookCallback(code: string): Promise<{ user: User; token: Token; pages: Page[] }>{
  // Código de troca para token de acesso
  const tokenUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  tokenUrl.searchParams.set('client_id', APP_ID);
  tokenUrl.searchParams.set('client_secret', APP_SECRET);
  tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  tokenUrl.searchParams.set('code', code);

  const tokenRes = await axios.get(tokenUrl.toString());
  const { access_token: shortLivedToken } = tokenRes.data as { access_token: string; token_type: string; expires_in: number };

  // Troque token de curta duração por token de longa duração
  const exchangeUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
  exchangeUrl.searchParams.set('client_id', APP_ID);
  exchangeUrl.searchParams.set('client_secret', APP_SECRET);
  exchangeUrl.searchParams.set('fb_exchange_token', shortLivedToken);
  const exchangeRes = await axios.get(exchangeUrl.toString());
  const { access_token: accessToken, token_type: _llType, expires_in: expiresIn } = exchangeRes.data as { access_token: string; token_type: string; expires_in: number };

  // Obter perfil do usuário
  const meUrl = `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
  const meRes = await axios.get(meUrl);
  const { id: fbId, name, email } = meRes.data as { id: string; name?: string; email?: string };

  const userRepo = AppDataSource.getRepository(User);
  const tokenRepo = AppDataSource.getRepository(Token);
  const pageRepo = AppDataSource.getRepository(Page);

  let user = await userRepo.findOne({ where: { email: email || `${fbId}@facebook.local` } });
  if (!user) {
    user = userRepo.create({ email: email || `${fbId}@facebook.local`, name });
    await userRepo.save(user);
  }

  const expiresAt = Date.now() + (expiresIn ? expiresIn * 1000 : 0);
  let token = await tokenRepo.findOne({ where: { user: { id: user.id }, provider: 'facebook' }, relations: { user: true } });
  if (!token) {
    token = tokenRepo.create({ user, provider: 'facebook', accessToken, expiresAt: String(expiresAt) });
  } else {
    token.accessToken = accessToken;
    token.expiresAt = String(expiresAt);
  }
  await tokenRepo.save(token);

  // Buscar páginas gerenciadas pelo usuário e armazená-las com tokens de acesso à página
  const accountsUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`);
  accountsUrl.searchParams.set('fields', 'id,name,access_token');
  accountsUrl.searchParams.set('access_token', accessToken);
  const accountsRes = await axios.get(accountsUrl.toString());
  const pagesData = (accountsRes.data?.data || []) as Array<{ id: string; name?: string; access_token?: string }>;
  const savedPages: Page[] = [];
  for (const p of pagesData) {
    if (!p.id) continue;
    let pageEntity = await pageRepo.findOne({ where: { pageId: p.id, user: { id: user.id } }, relations: { user: true } });
    if (!pageEntity) {
      pageEntity = pageRepo.create({ user, pageId: p.id });
    }
    pageEntity.pageName = p.name;
    if (p.access_token) pageEntity.pageAccessToken = p.access_token;
    await pageRepo.save(pageEntity);
    savedPages.push(pageEntity);
  }

  return { user, token, pages: savedPages };
}

export async function getAppAccessToken(): Promise<string> {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  url.searchParams.set('client_id', APP_ID);
  url.searchParams.set('client_secret', APP_SECRET);
  url.searchParams.set('grant_type', 'client_credentials');
  const res = await axios.get(url.toString());
  return res.data.access_token as string;
}

