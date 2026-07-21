import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ArticleCard } from '../features/artigos/components/ArticleCard';
import type { Article } from '../features/artigos/data/articles';
import { fetchPublishedArticles } from '../features/artigos/services/articleApi';
import { getPublishedArticles } from '../features/artigos/services/articleRepository';
import { MainLayout } from '../layouts/MainLayout';
import { cn } from '../utils/cn';

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(() => getPublishedArticles());
  const categories = ['Todos', ...Array.from(new Set(articles.map((article) => article.category)))];
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;

    fetchPublishedArticles()
      .then((items) => {
        if (active && items.length > 0) {
          setArticles(items);
        }
      })
      .catch(() => {
        if (active) {
          setArticles(getPublishedArticles());
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory = category === 'Todos' || article.category === category;
      const matchesQuery = !normalizedQuery || [article.title, article.summary, article.category, ...article.tags].join(' ').toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [articles, category, query]);

  return (
    <MainLayout>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 md:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue dark:text-brand-sky">Artigos</span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink dark:text-white md:text-6xl md:leading-none">
              Bem-estar com contexto humano.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 dark:text-slate-300">
              Conteudos autorais e curadoria sobre saude mental, bons habitos, alimentacao, descanso, rotina e psicologia aplicada ao dia a dia.
            </p>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-[24px] shadow-hero">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,38,87,0.82),rgba(15,38,87,0.16))]" />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn('rounded-full border px-4 py-2 text-sm font-extrabold transition hover:-translate-y-0.5', category === item ? 'border-brand-blue bg-brand-blue text-white shadow-brand dark:border-brand-yellow dark:bg-brand-yellow dark:text-ink' : 'border-brand-blue/15 bg-white text-brand-blue dark:border-white/10 dark:bg-night-card dark:text-brand-sky')}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar artigo"
              className="w-full rounded-full border border-brand-blue/15 bg-white py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none transition focus:border-brand-blue dark:border-white/10 dark:bg-night-card dark:text-white"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
        {filtered.length === 0 ? <p className="mt-8 rounded-2xl border border-brand-blue/15 bg-white px-5 py-8 text-center font-bold text-slate-500 dark:border-white/10 dark:bg-night-card dark:text-slate-300">Nenhum artigo encontrado.</p> : null}
      </section>
    </MainLayout>
  );
}
