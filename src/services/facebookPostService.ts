import axios from 'axios';
import dotenv from 'dotenv';
import { AppDataSource } from '../shared/database/dataSource';
import { Page } from '../pages/entities/Page';

dotenv.config();

const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v23.0';

interface CreatePagePostInput {
  pageId: string;
  message?: string;
  link?: string;
  mediaUrl?: string;
}

export async function createPagePost({ pageId, message, link, mediaUrl }: CreatePagePostInput): Promise<any> {
  const pageRepo = AppDataSource.getRepository(Page);
  const page = await pageRepo.findOne({ where: { pageId } });
  if (!page || !page.pageAccessToken) {
    throw Object.assign(new Error('Page or page access token not found'), { status: 404 });
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/feed`;
  const payload: Record<string, string> = {};
  if (message) payload.message = message;
  if (link) payload.link = link;
  if (mediaUrl) payload.url = mediaUrl;

  const res = await axios.post(endpoint, undefined, {
    params: {
      access_token: page.pageAccessToken,
      ...payload,
    },
  });
  return res.data;
}

export async function createBulkPagePosts(pageId: string, posts: Array<{ message?: string; link?: string; mediaUrl?: string }>): Promise<any[]> {
  const results: any[] = [];
  for (const post of posts) {
    // No futuro: enfileiramento de tarefas. Por enquanto: sequencial.
    const created = await createPagePost({ pageId, ...post });
    results.push(created);
  }
  return results;
}

