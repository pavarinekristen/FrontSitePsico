import { ArrowUpRight, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '../data/articles';
import { cn } from '../../../utils/cn';
import { formatArticleDate } from '../utils/formatArticleDate';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  const isExternal = article.origin === 'external_curated';

  return (
    <article className="group overflow-hidden rounded-[20px] border border-brand-blue/15 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hero dark:border-white/10 dark:bg-night-card">
      <Link to={`/artigos/${article.slug}`} className="block">
        <div className={cn('relative overflow-hidden', compact ? 'h-40' : 'h-48')}>
          <img src={article.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className={cn('rounded-full px-3 py-1 text-[11px] font-extrabold uppercase text-white shadow-sm', isExternal ? 'bg-[#0F766E]' : 'bg-brand-blue')}>
              {isExternal ? 'Curadoria' : 'Autoral'}
            </span>
            <span className="rounded-full bg-brand-yellow px-3 py-1 text-[11px] font-extrabold uppercase text-ink shadow-sm">{article.category}</span>
          </div>
        </div>
        <div className={compact ? 'p-4' : 'p-5'}>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Clock size={14} />
            <span>{article.readingMinutes} min</span>
            <span>·</span>
            <span>{formatArticleDate(article.publishedAt)}</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-ink transition group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-yellow">
            {article.title}
          </h3>
          <p className={cn('mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300', compact ? 'line-clamp-5' : 'line-clamp-6')}>{article.summary}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">{article.sourceName ?? 'Instituto Ideia'}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand-blue transition group-hover:bg-brand-blue group-hover:text-white dark:bg-night-soft dark:text-brand-sky">
              {isExternal ? <ExternalLink size={16} /> : <ArrowUpRight size={16} />}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
