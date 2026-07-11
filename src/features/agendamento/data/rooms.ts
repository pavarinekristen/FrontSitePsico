import type { Sala } from '../../../types';

export const salas: Sala[] = [
  {
    id: 'sala1',
    numero: 'Sala 01',
    categoria: 'Individual',
    nome: 'Acolhimento',
    titulo: 'Sala Acolhimento',
    descricao: 'Silêncio, meia-luz e conforto. O cenário ideal para a escuta individual e as primeiras sessões.',
    capacidade: 'Atendimento individual',
    recursos: ['Wi-Fi', 'Ar-condicionado', 'Isolamento acústico'],
    imagens: [
      { src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', alt: 'Poltrona em sala de atendimento aconchegante' },
      { src: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80', alt: 'Sala clara com sofá e mesa lateral' },
      { src: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=80', alt: 'Ambiente de atendimento com mobiliário confortável' },
    ],
  },
  {
    id: 'sala2',
    numero: 'Sala 02',
    categoria: 'Casal e grupos',
    nome: 'Diálogo',
    titulo: 'Sala Diálogo',
    descricao: 'Ampla e banhada de luz natural. Espaço de sobra para casais, famílias e grupos pequenos.',
    capacidade: 'Casais e grupos pequenos',
    recursos: ['Wi-Fi', 'Luz natural', 'Sofá + poltronas'],
    imagens: [
      { src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', alt: 'Sala de conversa com sofá amplo' },
      { src: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80', alt: 'Consultório com luz natural e plantas' },
      { src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', alt: 'Ambiente interno com poltronas e mesa' },
    ],
  },
];

export const horariosDisponiveis = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
export const planosDisponiveis = [
  'Light - Hora avulsa',
  'Standard - 2 a 4 horas',
  'Full - 5 a 8 horas',
  'Premium - acima de 9 horas',
] as const;

export const regrasPlanos = {
  'Light - Hora avulsa': { min: 1, max: 1, padrao: 1, bloqueioOnline: true },
  'Standard - 2 a 4 horas': { min: 2, max: 4, padrao: 2, bloqueioOnline: true },
  'Full - 5 a 8 horas': { min: 5, max: 8, padrao: 5, bloqueioOnline: true },
  'Premium - acima de 9 horas': { min: 9, max: 12, padrao: 9, bloqueioOnline: true },
} as const;

export function getRegraPlano(plano: (typeof planosDisponiveis)[number]) {
  return regrasPlanos[plano];
}

export function getDuracoesPlano(plano: (typeof planosDisponiveis)[number]): number[] {
  const regra = getRegraPlano(plano);
  return Array.from({ length: regra.max - regra.min + 1 }, (_, index) => regra.min + index);
}
