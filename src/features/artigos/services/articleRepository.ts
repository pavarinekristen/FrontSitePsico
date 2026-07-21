import { seedArticles, type Article } from '../data/articles';

const STORAGE_KEY = 'ideia-articles';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredArticles(): Article[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Article[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredArticles(articles: Article[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export function slugify(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `artigo-${Date.now()}`;
}

export function getAllArticles(): Article[] {
  const stored = readStoredArticles();
  const all = [...stored, ...seedArticles];
  return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPublishedArticles(): Article[] {
  return getAllArticles().filter((article) => article.status === 'published');
}

export function getArticleBySlug(slug: string): Article | null {
  return getPublishedArticles().find((article) => article.slug === slug) ?? null;
}

export function getStoredEditorialArticles(): Article[] {
  return readStoredArticles().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function saveEditorialArticle(article: Article): Article {
  const stored = readStoredArticles();
  const existingSlugs = new Set([...stored, ...seedArticles].map((item) => item.slug));
  let slug = article.slug;
  let suffix = 2;

  while (existingSlugs.has(slug)) {
    slug = `${article.slug}-${suffix}`;
    suffix += 1;
  }

  const saved = { ...article, slug };
  writeStoredArticles([saved, ...stored]);

  return saved;
}
