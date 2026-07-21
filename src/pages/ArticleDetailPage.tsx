import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import type { Article } from '../features/artigos/data/articles';
import { fetchArticleBySlug } from '../features/artigos/services/articleApi';
import { getArticleBySlug } from '../features/artigos/services/articleRepository';
import { formatArticleDate } from '../features/artigos/utils/formatArticleDate';
import { MainLayout } from '../layouts/MainLayout';

export function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(() => (slug ? getArticleBySlug(slug) : null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    if (!slug) {
      setLoaded(true);
      return () => {
        active = false;
      };
    }

    fetchArticleBySlug(slug)
      .then((item) => {
        if (active) {
          setArticle(item ?? getArticleBySlug(slug));
        }
      })
      .catch(() => {
        if (active) {
          setArticle(getArticleBySlug(slug));
        }
      })
      .finally(() => {
        if (active) {
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (!article && loaded) {
    return <Navigate to="/artigos" replace />;
  }

  if (!article) {
    return null;
  }

  const isExternal = article.origin === 'external_curated';

  return (
    <MainLayout>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-5 md:px-8 md:py-16">
        <Link to="/artigos" className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-4 py-2 text-sm font-extrabold text-brand-blue transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-night-card dark:text-brand-sky">
          <ArrowLeft size={16} /> Artigos
        </Link>
        <div className="mt-7 overflow-hidden rounded-[24px] shadow-hero">
          <img src={article.imageUrl} alt="" className="h-[280px] w-full object-cover md:h-[420px]" />
        </div>
        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-yellow px-3 py-1 text-[11px] font-extrabold uppercase text-ink">{article.category}</span>
            <span className="rounded-full bg-brand-blue px-3 py-1 text-[11px] font-extrabold uppercase text-white">{isExternal ? 'Curadoria externa' : 'Artigo autoral'}</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink dark:text-white md:text-6xl md:leading-none">{article.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-slate-300">{article.summary}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
            <span>{formatArticleDate(article.publishedAt)}</span>
            <span>·</span>
            <span>{article.readingMinutes} min de leitura</span>
            <span>·</span>
            <span>{article.sourceName ?? 'Instituto Ideia'}</span>
          </div>
        </div>

        <div className="mt-9 space-y-5 text-lg leading-8 text-slate-700 dark:text-slate-300">
          {article.content.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        {isExternal && article.sourceUrl ? (
          <div className="mt-9 rounded-[20px] border border-brand-blue/15 bg-white p-5 shadow-card dark:border-white/10 dark:bg-night-card">
            <p className="text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">Este item é uma curadoria editorial. A leitura completa permanece na fonte original.</p>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0F766E] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5">
              Ler na fonte <ExternalLink size={16} />
            </a>
          </div>
        ) : null}
      </article>
    </MainLayout>
  );
}
