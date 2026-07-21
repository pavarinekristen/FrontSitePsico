import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, FilePlus2, Globe2, Play, Rss, ShieldCheck, X } from 'lucide-react';
import { seedArticleSources, seedPendingExternalArticles, type Article } from '../data/articles';
import { getStoredEditorialArticles, saveEditorialArticle, slugify } from '../services/articleRepository';
import { adminApproveArticle, adminCreateArticle, adminCreateSource, adminFetchArticles, adminRejectArticle, adminRunArticleImport } from '../services/articleApi';
import { cn } from '../../../utils/cn';

const EMPTY_FORM = {
  title: '',
  summary: '',
  content: '',
  category: 'Bem-estar',
  tags: '',
  imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
};

const EMPTY_SOURCE_FORM = {
  name: '',
  url: '',
  type: 'rss' as const,
  topics: 'psicologia, saude mental, terapia, bem-estar, bons habitos, alimentacao, sono, rotina saudavel',
};

interface ArticleAdminPanelProps {
  adminToken: string;
}

export function ArticleAdminPanel({ adminToken }: ArticleAdminPanelProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editorialArticles, setEditorialArticles] = useState(() => getStoredEditorialArticles());
  const [pendingExternal, setPendingExternal] = useState(seedPendingExternalArticles);
  const [sources, setSources] = useState(seedArticleSources);
  const [sourceForm, setSourceForm] = useState(EMPTY_SOURCE_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [articlesBusy, setArticlesBusy] = useState(false);
  const activeSources = useMemo(() => sources.filter((source) => source.active).length, [sources]);

  useEffect(() => {
    let active = true;

    adminFetchArticles(adminToken)
      .then((payload) => {
        if (!active) {
          return;
        }

        setApiConnected(true);
        setEditorialArticles(payload.articles);
        setPendingExternal(payload.pending);
        setSources(payload.sources);
      })
      .catch(() => {
        if (active) {
          setApiConnected(false);
        }
      });

    return () => {
      active = false;
    };
  }, [adminToken]);

  async function submitManualArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const summary = form.summary.trim();
    const content = form.content.trim();

    if (!title || !summary || !content) {
      setMessage('Preencha titulo, resumo e conteudo antes de publicar.');
      return;
    }

    setArticlesBusy(true);

    try {
      const apiArticle = await awaitOrNull(adminCreateArticle(adminToken, {
        title,
        summary,
        content,
        category: form.category.trim() || 'Bem-estar',
        tags: splitTags(form.tags),
        imageUrl: form.imageUrl.trim() || EMPTY_FORM.imageUrl,
      }));

      const saved = apiArticle ?? saveEditorialArticle({
        id: `manual-${Date.now()}`,
        title,
        slug: slugify(title),
        summary,
        content,
        category: form.category.trim() || 'Bem-estar',
        tags: splitTags(form.tags),
        origin: 'manual',
        status: 'published',
        sourceName: null,
        sourceUrl: null,
        imageUrl: form.imageUrl.trim() || EMPTY_FORM.imageUrl,
        publishedAt: new Intl.DateTimeFormat('en-CA').format(new Date()),
        readingMinutes: estimateReadingMinutes(content),
        isIndexable: true,
      });

      setApiConnected(apiArticle !== null);
      setEditorialArticles((current) => [saved, ...current]);
      setForm(EMPTY_FORM);
      setMessage(apiArticle ? 'Artigo autoral publicado na API.' : 'Artigo publicado localmente. Publique a API de artigos para salvar no banco.');
    } finally {
      setArticlesBusy(false);
    }
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = sourceForm.name.trim();
    const url = sourceForm.url.trim();

    if (!name || !url) {
      setMessage('Preencha nome e URL da fonte.');
      return;
    }

    setArticlesBusy(true);

    try {
      const apiSource = await awaitOrNull(adminCreateSource(adminToken, {
        name,
        url,
        type: sourceForm.type,
        topics: splitTags(sourceForm.topics),
        active: true,
      }));

      const source = apiSource ?? {
        id: `source-${Date.now()}`,
        name,
        url,
        type: sourceForm.type,
        active: true,
        topics: splitTags(sourceForm.topics),
        lastCheckedAt: 'Ainda não verificado',
      };

      setApiConnected(apiSource !== null);
      setSources((current) => [source, ...current]);
      setSourceForm(EMPTY_SOURCE_FORM);
      setMessage(apiSource ? 'Fonte cadastrada na API.' : 'Fonte adicionada localmente. O coletor real depende da API de artigos publicada.');
    } finally {
      setArticlesBusy(false);
    }
  }

  async function runImport() {
    setArticlesBusy(true);

    try {
      const result = await adminRunArticleImport(adminToken);

      setApiConnected(true);
      const payload = await adminFetchArticles(adminToken);
      setEditorialArticles(payload.articles);
      setPendingExternal(payload.pending);
      setSources(payload.sources);
      const errors = result.source_errors ?? [];
      const errorPreview = errors.length > 0
        ? ` Erros em fontes: ${errors.slice(0, 3).map((item) => `${item.source || item.url}: ${item.error}`).join(' | ')}${errors.length > 3 ? '...' : ''}`
        : '';
      setMessage(`Busca concluida: ${result.sources_checked} fonte(s), ${result.items_found} item(ns) encontrado(s), ${result.imported} importado(s), ${result.skipped} ignorado(s), ${result.featured} destaque(s).${errorPreview}`);
    } catch (error) {
      setApiConnected(false);
      setMessage(error instanceof Error ? `Falha na busca: ${error.message}` : 'Falha na busca de artigos externos.');
    } finally {
      setArticlesBusy(false);
    }
  }

  async function approveExternalArticle(article: Article) {
    setArticlesBusy(true);

    try {
      const apiArticle = await awaitOrNull(adminApproveArticle(adminToken, article.id));

      const saved = apiArticle ?? saveEditorialArticle({
        ...article,
        id: `curated-${Date.now()}`,
        status: 'published',
        isIndexable: false,
        slug: slugify(article.title),
      });

      setApiConnected(apiArticle !== null);
      setEditorialArticles((current) => [saved, ...current]);
      setPendingExternal((current) => current.filter((item) => item.id !== article.id));
      setMessage(apiArticle ? 'Curadoria aprovada na API.' : 'Curadoria aprovada localmente.');
    } finally {
      setArticlesBusy(false);
    }
  }

  async function rejectExternalArticle(articleId: string) {
    setArticlesBusy(true);

    try {
      const rejected = await awaitOrNull(adminRejectArticle(adminToken, articleId).then(() => true));
      setApiConnected(rejected !== null);
      setPendingExternal((current) => current.filter((item) => item.id !== articleId));
      setMessage(rejected ? 'Curadoria rejeitada na API.' : 'Curadoria rejeitada localmente.');
    } finally {
      setArticlesBusy(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue">Artigos e curadoria</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{editorialArticles.length} publicados pelo painel · {pendingExternal.length} aguardando revisão · {activeSources} fontes ativas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm', apiConnected ? 'border-[#147A3B]/20 bg-[#DDFBE8] text-[#147A3B]' : 'border-brand-blue/15 bg-white text-brand-blue')}>
            <ShieldCheck size={14} /> {apiConnected ? 'API conectada' : 'Modo local'}
          </span>
          <button type="button" disabled={articlesBusy} onClick={() => void runImport()} className="inline-flex items-center gap-2 rounded-full bg-[#0F766E] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
            <Play size={14} /> Buscar agora
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 rounded-xl border border-brand-blue/15 bg-white px-4 py-3 text-sm font-bold text-brand-blue">{message}</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={submitManualArticle} className="rounded-2xl border border-brand-blue/15 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <FilePlus2 size={18} className="text-brand-blue" />
            <h3 className="font-display text-xl font-semibold">Novo artigo autoral</h3>
          </div>
          <div className="mt-4 grid gap-3">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo do artigo" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
            <textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Resumo curto" rows={2} className="w-full resize-none rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
            <textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Conteudo do artigo" rows={6} className="w-full resize-y rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Categoria" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
              <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
            </div>
            <input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="URL da imagem de capa" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
          </div>
          <button type="submit" disabled={articlesBusy} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
            <FilePlus2 size={16} /> {articlesBusy ? 'Salvando...' : 'Publicar artigo'}
          </button>
        </form>

        <div className="rounded-2xl border border-brand-blue/15 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Rss size={18} className="text-[#0F766E]" />
            <h3 className="font-display text-xl font-semibold">Fila de curadoria</h3>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {pendingExternal.length === 0 ? <p className="rounded-xl bg-brand-soft px-4 py-5 text-sm font-bold text-slate-500">Nenhum item aguardando revisão.</p> : null}
            {pendingExternal.map((article) => (
              <article key={article.id} className="rounded-xl border border-brand-blue/10 bg-brand-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0F766E]">{article.category}</span>
                    <h4 className="mt-1 font-display text-lg font-semibold leading-tight">{article.title}</h4>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{article.summary}</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-xs font-extrabold text-slate-500"><Globe2 size={13} /> {article.sourceName}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={articlesBusy} onClick={() => void approveExternalArticle(article)} className="inline-flex items-center gap-1.5 rounded-full bg-[#0F766E] px-4 py-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
                    <Check size={13} /> Aprovar
                  </button>
                  <button type="button" disabled={articlesBusy} onClick={() => void rejectExternalArticle(article.id)} className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
                    <X size={13} /> Rejeitar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={addSource} className="mt-4 rounded-2xl border border-brand-blue/15 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Globe2 size={18} className="text-brand-blue" />
          <h3 className="font-display text-xl font-semibold">Nova fonte externa</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.2fr_160px]">
          <input value={sourceForm.name} onChange={(event) => setSourceForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome da fonte" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
          <input value={sourceForm.url} onChange={(event) => setSourceForm((current) => ({ ...current, url: event.target.value }))} placeholder="URL do RSS, API ou página" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
          <select value={sourceForm.type} onChange={(event) => setSourceForm((current) => ({ ...current, type: event.target.value as typeof sourceForm.type }))} className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white">
            <option value="rss">RSS</option>
            <option value="api">API</option>
            <option value="scraping">Scraping</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={sourceForm.topics} onChange={(event) => setSourceForm((current) => ({ ...current, topics: event.target.value }))} placeholder="Temas/palavras-chave separados por virgula" className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-blue focus:bg-white" />
          <button type="submit" disabled={articlesBusy} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 py-3 text-sm font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
            <Rss size={16} /> Adicionar fonte
          </button>
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-blue/15 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-blue/10 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Fonte</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Temas</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ultima checagem</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-brand-blue/5 last:border-0">
                <td className="px-4 py-3 font-bold">{source.name}</td>
                <td className="px-4 py-3 uppercase text-slate-600">{source.type}</td>
                <td className="px-4 py-3 text-slate-600">{source.topics.join(', ')}</td>
                <td className="px-4 py-3"><SourceStatus active={source.active} /></td>
                <td className="px-4 py-3 text-slate-600">{source.lastCheckedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function splitTags(value: string): string[] {
  return value.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
}

function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

async function awaitOrNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

function SourceStatus({ active }: { active: boolean }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-extrabold', active ? 'bg-[#DDFBE8] text-[#147A3B]' : 'bg-slate-100 text-slate-500')}>
      {active ? 'Ativa' : 'Pausada'}
    </span>
  );
}
