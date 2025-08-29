import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import { AppDataSource } from '../shared/database/dataSource';
import { Page } from '../pages/entities/Page';
import { getValidUserToken } from './tokenService';

dotenv.config();

const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v23.0';

interface CreatePagePostInput {
  pageId: string;
  message?: string;
  link?: string;
  mediaUrl?: string;
}

async function refreshPageAccessToken(page: Page): Promise<Page> {
  const pageRepo = AppDataSource.getRepository(Page);
  // get or refresh user's long-lived token
  const userToken = await getValidUserToken(page.user.id);
  if (!userToken) {
    throw Object.assign(new Error('User token not found for page'), { status: 404 });
  }
  // obter novo token de acesso à página
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(page.pageId)}`);
  url.searchParams.set('fields', 'access_token');
  url.searchParams.set('access_token', userToken.accessToken);
  const res = await axios.get(url.toString());
  const newToken: string | undefined = res.data?.access_token;
  if (newToken) {
    page.pageAccessToken = newToken;
    await pageRepo.save(page);
  }
  return page;
}

export async function createPagePost({ pageId, message, link, mediaUrl }: CreatePagePostInput): Promise<any> {
  const pageRepo = AppDataSource.getRepository(Page);
  let page = await pageRepo.findOne({ where: { pageId }, relations: { user: true } });
  if (!page) {
    throw Object.assign(new Error('Page not found'), { status: 404 });
  }
  if (!page.pageAccessToken) {
    page = await refreshPageAccessToken(page);
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/feed`;
  const payload: Record<string, string> = {};
  if (message) payload.message = message;
  if (link) payload.link = link;
  if (mediaUrl) payload.url = mediaUrl;

  try {
    const res = await axios.post(endpoint, undefined, {
      params: {
        access_token: page.pageAccessToken as string,
        ...payload,
      },
    });
    return res.data;
  } catch (e) {
    const err = e as AxiosError<any>;
    const code = err.response?.data?.error?.code;
    const message = err.response?.data?.error?.message as string | undefined;
    if (code === 190) {
      // token de página inválido/expirado → atualizar token de usuário + token de página e tentar novamente uma vez
      page = await refreshPageAccessToken(page);
      const retry = await axios.post(endpoint, undefined, {
        params: {
          access_token: page.pageAccessToken as string,
          ...payload,
        },
      });
      return retry.data;
    }
    if (code === 613 || code === 4) {
      // Rate limit 
      const friendly = 'Facebook rate limit exceeded. Reduce batch size or try again later.';
      throw Object.assign(new Error(friendly), { status: 429, providerCode: code, providerMessage: message });
    }
    throw err;
  }
}

export async function createBulkPagePosts(pageId: string, posts: Array<{ message?: string; link?: string; mediaUrl?: string }>): Promise<any[]> {
  const results: any[] = [];
  for (const post of posts) {
    // Processamento sequencial
    const created = await createPagePost({ pageId, ...post });
    results.push(created);
  }
  return results;
}

