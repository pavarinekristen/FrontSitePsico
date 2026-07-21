import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../../../components/SectionHeading';
import type { Article } from '../data/articles';
import { fetchPublishedArticles } from '../services/articleApi';
import { getPublishedArticles } from '../services/articleRepository';
import { ArticleCard } from './ArticleCard';

const ARTICLE_PREVIEW_LIMIT = 6;

export function ArticlesPreview() {
  const [articles, setArticles] = useState<Article[]>(() => previewArticles([]));

  useEffect(() => {
    let active = true;

    fetchPublishedArticles({ featured: true, limit: ARTICLE_PREVIEW_LIMIT })
      .then((items) => {
        if (active) {
          setArticles(previewArticles(items));
        }
      })
      .catch(() => {
        if (active) {
          setArticles(previewArticles([]));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="artigos" className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:px-8 md:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Artigos"
          title={<>Bem-estar, rotina e saude emocional com contexto.</>}
          description="Conteudos autorais e curadoria selecionada sobre saude mental, bons habitos, alimentacao, descanso e escolhas de rotina."
        />
        <Link to="/artigos" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5 dark:bg-brand-yellow dark:text-ink">
          Ver artigos <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {articles.map((article) => <ArticleCard key={article.id} article={article} compact />)}
      </div>
    </section>
  );
}

function previewArticles(apiArticles: Article[]): Article[] {
  const unique = new Map<string, Article>();

  [...apiArticles, ...getPublishedArticles()].forEach((article) => {
    unique.set(article.id, article);
  });

  return Array.from(unique.values()).slice(0, ARTICLE_PREVIEW_LIMIT);
}
