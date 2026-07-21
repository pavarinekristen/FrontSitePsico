import type { Article, ArticleSource } from '../data/articles';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ArticleSourcePayload {
  name: string;
  url: string;
  type: ArticleSource['type'];
  topics: string[];
  active: boolean;
}

export interface CreateArticlePayload {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
}

export interface ArticleImportResult {
  run_id?: string;
  sources_checked: number;
  items_found: number;
  imported: number;
  skipped: number;
  featured: number;
  source_errors?: Array<{ source: string; url: string; error: string }>;
}

export async function fetchPublishedArticles(options?: { featured?: boolean; limit?: number }): Promise<Article[]> {
  const params = new URLSearchParams();
  if (options?.featured) {
    params.set('featured', '1');
  }
  if (options?.limit) {
    params.set('limit', String(options.limit));
  }

  const query = params.toString();
  const response = await articleFetch<ApiResponse<{ articles: Article[] }>>(`/articles${query ? `?${query}` : ''}`);
  return response.data?.articles ?? [];
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const response = await articleFetch<ApiResponse<{ article: Article | null }>>(`/articles/show?slug=${encodeURIComponent(slug)}`);
  return response.data?.article ?? null;
}

export async function adminFetchArticles(adminToken: string): Promise<{ articles: Article[]; pending: Article[]; sources: ArticleSource[] }> {
  const response = await articleFetch<ApiResponse<{ articles: Article[]; pending: Article[]; sources: ArticleSource[] }>>('/admin/articles', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  return {
    articles: response.data?.articles ?? [],
    pending: response.data?.pending ?? [],
    sources: response.data?.sources ?? [],
  };
}

export async function adminCreateArticle(adminToken: string, payload: CreateArticlePayload): Promise<Article> {
  const response = await articleFetch<ApiResponse<{ article: Article }>>('/admin/articles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: payload.title,
      summary: payload.summary,
      content: payload.content,
      category: payload.category,
      tags: payload.tags,
      image_url: payload.imageUrl,
    }),
  });

  if (!response.data?.article) {
    throw new Error('A API nao retornou o artigo criado.');
  }

  return response.data.article;
}

export async function adminApproveArticle(adminToken: string, articleId: string): Promise<Article> {
  const response = await articleFetch<ApiResponse<{ article: Article }>>('/admin/articles/approve', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ article_id: articleId }),
  });

  if (!response.data?.article) {
    throw new Error('A API nao retornou o artigo aprovado.');
  }

  return response.data.article;
}

export async function adminRejectArticle(adminToken: string, articleId: string): Promise<void> {
  await articleFetch<ApiResponse<{ rejected: boolean }>>('/admin/articles/reject', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ article_id: articleId }),
  });
}

export async function adminCreateSource(adminToken: string, payload: ArticleSourcePayload): Promise<ArticleSource> {
  const response = await articleFetch<ApiResponse<{ source: ArticleSource }>>('/admin/article-sources', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: payload.name,
      url: payload.url,
      type: payload.type,
      topics: payload.topics,
      active: payload.active,
    }),
  });

  if (!response.data?.source) {
    throw new Error('A API nao retornou a fonte criada.');
  }

  return response.data.source;
}

export async function adminRunArticleImport(adminToken: string): Promise<ArticleImportResult> {
  const response = await articleFetch<ApiResponse<ArticleImportResult>>('/admin/articles/import', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const result: ArticleImportResult = {
    sources_checked: response.data?.sources_checked ?? 0,
    items_found: response.data?.items_found ?? 0,
    imported: response.data?.imported ?? 0,
    skipped: response.data?.skipped ?? 0,
    featured: response.data?.featured ?? 0,
    source_errors: response.data?.source_errors ?? [],
  };
  if (response.data?.run_id) {
    result.run_id = response.data.run_id;
  }

  return result;
}

async function articleFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error?.message || 'Erro ao comunicar com a API de artigos.');
  }

  return payload as T;
}
