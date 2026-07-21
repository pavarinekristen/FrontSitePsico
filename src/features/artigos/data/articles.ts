export type ArticleOrigin = 'manual' | 'external_curated';
export type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'rejected';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  origin: ArticleOrigin;
  status: ArticleStatus;
  sourceName: string | null;
  sourceUrl: string | null;
  imageUrl: string;
  publishedAt: string;
  readingMinutes: number;
  isIndexable: boolean;
}

export interface ArticleSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'scraping';
  active: boolean;
  topics: string[];
  lastCheckedAt: string;
}

export const seedArticles: Article[] = [
  {
    id: 'manual-ia-saude-mental',
    title: 'Rotina saudavel e saude mental: pequenos ajustes que sustentam o cuidado',
    slug: 'ia-saude-mental-cuidado-humano',
    summary: 'Uma leitura sobre como sono regular, pausas reais, alimentacao equilibrada e organizacao simples do dia podem proteger a saude emocional. O foco esta em mudancas pequenas, possiveis e sustentaveis, sem transformar autocuidado em cobranca ou produtividade excessiva.',
    content:
      'Uma rotina saudavel nao precisa nascer de grandes viradas. Muitas vezes, o cuidado comeca em ajustes pequenos: dormir em horarios mais previsiveis, fazer pausas sem culpa, beber agua, organizar refeicoes possiveis e reduzir compromissos que deixam o dia sempre no limite.\n\nEsses habitos ajudam o corpo a ter mais estabilidade e tambem favorecem a saude emocional. Quando a rotina fica menos caotica, a pessoa tende a perceber melhor seus sinais de cansaco, fome, irritacao, ansiedade e necessidade de descanso.\n\nO ponto central e criar consistencia com gentileza. Bons habitos devem apoiar a vida real, nao virar mais uma fonte de cobranca.',
    category: 'Bem-estar',
    tags: ['Saude mental', 'Bons habitos', 'Rotina'],
    origin: 'manual',
    status: 'published',
    sourceName: null,
    sourceUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-18',
    readingMinutes: 4,
    isIndexable: true,
  },
  {
    id: 'external-privacidade-apps',
    title: 'Alimentacao, humor e energia: pontos para observar na rotina',
    slug: 'privacidade-aplicativos-saude-pontos-acompanhar',
    summary: 'Curadoria sobre a relacao entre escolhas alimentares, energia ao longo do dia, qualidade do sono e regulacao emocional. A proposta e observar padroes com gentileza, priorizando regularidade, hidratacao, refeicoes possiveis e sinais do corpo.',
    content:
      'Alimentacao e bem-estar emocional se conectam de forma pratica no cotidiano. Longos periodos sem comer, baixa hidratacao, excesso de estimulantes e escolhas feitas sempre com pressa podem afetar energia, humor, sono e concentracao.\n\nA ideia nao e defender regras rigidas, mas observar padroes. Refeicoes mais regulares, alimentos variados e pequenas preparacoes antecipadas podem reduzir decisoes de ultima hora e dar mais estabilidade ao dia.\n\nA leitura completa permanece na fonte original.',
    category: 'Habitos alimentares',
    tags: ['Alimentacao', 'Bem-estar', 'Rotina'],
    origin: 'external_curated',
    status: 'published',
    sourceName: 'Curadoria Tech',
    sourceUrl: 'https://example.com/privacidade-apps-saude',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-16',
    readingMinutes: 3,
    isIndexable: false,
  },
  {
    id: 'manual-automacao-clinicas',
    title: 'Bons habitos sem rigidez: como criar uma rotina que cabe na vida real',
    slug: 'automacao-simples-reduzir-atrito-atendimento',
    summary: 'Como pequenas escolhas repetidas, como preparar o ambiente para dormir, organizar horarios, reduzir excesso de compromissos e manter pausas curtas, ajudam a construir consistencia sem culpa. O objetivo e favorecer cuidado diario, nao perfeicao.',
    content:
      'Bons habitos funcionam melhor quando sao simples o suficiente para caber na rotina. Preparar a roupa do dia seguinte, deixar uma garrafa de agua por perto, estabelecer um horario limite para dormir ou reservar dez minutos para caminhar pode parecer pequeno, mas reduz atrito.\n\nO erro comum e tentar mudar tudo de uma vez. Uma rotina sustentavel nasce de escolhas repetidas, ajustadas ao contexto de cada pessoa.\n\nQuando o habito serve ao bem-estar, ele melhora a vida. Quando vira rigidez, precisa ser revisto.',
    category: 'Bons habitos',
    tags: ['Rotina', 'Autocuidado', 'Saude emocional'],
    origin: 'manual',
    status: 'published',
    sourceName: null,
    sourceUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-12',
    readingMinutes: 5,
    isIndexable: true,
  },
  {
    id: 'manual-terapia-online',
    title: 'Terapia, autocuidado e rotina: quando pedir ajuda faz diferenca',
    slug: 'terapia-online-tecnologia-acesso',
    summary: 'Reflexao sobre como reconhecer sinais de sobrecarga, organizar prioridades e buscar apoio profissional quando a rotina deixa de ser apenas cansativa e passa a afetar sono, alimentacao, relacoes e capacidade de descanso.',
    content:
      'Pedir ajuda profissional pode fazer diferenca quando o cansaco deixa de ser pontual e passa a afetar sono, alimentacao, concentracao, relacoes e prazer nas atividades do dia. A terapia oferece um espaco de escuta, elaboracao e organizacao emocional.\n\nAutocuidado nao substitui acompanhamento quando ha sofrimento persistente, mas pode caminhar junto: manter uma rotina minima, observar gatilhos, descansar e respeitar limites sao partes importantes do processo.\n\nBuscar ajuda e uma forma concreta de cuidado.',
    category: 'Psicologia',
    tags: ['Terapia', 'Saude mental', 'Autocuidado'],
    origin: 'manual',
    status: 'published',
    sourceName: null,
    sourceUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-10',
    readingMinutes: 4,
    isIndexable: true,
  },
  {
    id: 'external-bem-estar-digital',
    title: 'Limites saudaveis: descanso, telas e presenca no dia a dia',
    slug: 'bem-estar-digital-limites-rotina-conectada',
    summary: 'Curadoria sobre como excesso de tela, notificacoes e disponibilidade constante podem atravessar descanso, atencao e relacoes. O foco esta em limites praticos: pausas, horarios de desconexao, sono mais protegido e escolhas que devolvem presenca a rotina.',
    content:
      'Limites saudaveis ajudam a proteger energia e descanso. Isso pode incluir reduzir estimulos antes de dormir, pausar notificacoes em alguns periodos, separar horarios de trabalho e lazer e reservar momentos sem tela durante refeicoes ou conversas.\n\nMais do que cortar recursos digitais, o cuidado esta em perceber quando eles passam a ocupar espaco demais na atencao e no corpo. Pequenos limites devolvem presenca a rotina.\n\nA leitura completa permanece na fonte original.',
    category: 'Bem-estar',
    tags: ['Descanso', 'Limites', 'Saude mental'],
    origin: 'external_curated',
    status: 'published',
    sourceName: 'Curadoria Saude Tech',
    sourceUrl: 'https://example.com/bem-estar-digital',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-08',
    readingMinutes: 3,
    isIndexable: false,
  },
  {
    id: 'manual-seguranca-dados-clinicos',
    title: 'Sono, ansiedade e organizacao: cuidados simples que evitam sobrecarga',
    slug: 'seguranca-dados-clinicas-cuidados-simples',
    summary: 'Boas praticas para reduzir sobrecarga mental no cotidiano: preparar uma rotina de sono, separar momentos de pausa, cuidar da alimentacao possivel e diminuir decisoes repetitivas. Sao ajustes simples, mas com impacto real na energia e no bem-estar.',
    content:
      'Sono e ansiedade se influenciam de forma direta. Noites ruins podem aumentar irritabilidade, preocupacao e dificuldade de concentracao; dias muito acelerados tambem podem dificultar o descanso.\n\nAlguns cuidados simples ajudam: reduzir luz e estimulos perto do horario de dormir, criar uma rotina de desaceleracao, evitar resolver tudo na cama e observar consumo de cafeina no fim do dia.\n\nSe a ansiedade ou a insonia persistirem, a avaliacao profissional e o caminho mais adequado.',
    category: 'Sono e ansiedade',
    tags: ['Sono', 'Ansiedade', 'Bons habitos'],
    origin: 'manual',
    status: 'published',
    sourceName: null,
    sourceUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-05',
    readingMinutes: 4,
    isIndexable: true,
  },
];

export const seedPendingExternalArticles: Article[] = [
  {
    id: 'pending-rss-ia-regulacao',
    title: 'Novas discussoes sobre sono, ansiedade e rotina de cuidado',
    slug: 'novas-discussoes-sono-ansiedade-rotina-cuidado',
    summary: 'Item capturado por fonte externa para revisao editorial, com foco em saude mental, descanso, bons habitos e impacto da rotina no bem-estar.',
    content:
      'Resumo preliminar gerado a partir do título e dos metadados da fonte. A publicação deve validar relevância, direitos de imagem, link original e posicionamento editorial.',
    category: 'Sono e ansiedade',
    tags: ['Sono', 'Ansiedade', 'Saude mental'],
    origin: 'external_curated',
    status: 'pending_review',
    sourceName: 'Fonte RSS Bem-estar',
    sourceUrl: 'https://example.com/ia-regulacao-saude',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-20',
    readingMinutes: 2,
    isIndexable: false,
  },
  {
    id: 'pending-api-bem-estar-digital',
    title: 'Bem-estar e bons habitos ganham espaco na rotina de trabalho',
    slug: 'bem-estar-digital-produtos-corporativos',
    summary: 'Curadoria candidata sobre comportamento, pausas, alimentacao possivel, descanso e saude mental no trabalho.',
    content:
      'Resumo preliminar para aprovação manual. O editor deve conferir a fonte original e ajustar o contexto para o público do portal.',
    category: 'Bem-estar',
    tags: ['Bem-estar', 'Trabalho', 'Psicologia'],
    origin: 'external_curated',
    status: 'pending_review',
    sourceName: 'API News Tech',
    sourceUrl: 'https://example.com/bem-estar-digital-produtos',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2026-07-19',
    readingMinutes: 2,
    isIndexable: false,
  },
];

export const seedArticleSources: ArticleSource[] = [
  {
    id: 'rss-bem-estar-saude',
    name: 'Fonte RSS Bem-estar',
    url: 'https://example.com/rss/bem-estar-saude',
    type: 'rss',
    active: true,
    topics: ['Saude mental', 'Bem-estar', 'Bons habitos', 'Alimentacao'],
    lastCheckedAt: '2026-07-20 08:30',
  },
  {
    id: 'api-news-saude',
    name: 'API News Saude',
    url: 'https://example.com/api/news',
    type: 'api',
    active: true,
    topics: ['Psicologia', 'Sono', 'Ansiedade', 'Rotina saudavel'],
    lastCheckedAt: '2026-07-20 08:20',
  },
  {
    id: 'scraping-lab',
    name: 'Site de saude monitorado',
    url: 'https://example.com/bem-estar',
    type: 'scraping',
    active: false,
    topics: ['Saude mental', 'Habitos alimentares'],
    lastCheckedAt: 'Pausado',
  },
];
