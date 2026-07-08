export type RoomId = 'sala1' | 'sala2';

export interface SalaImagem {
  src: string;
  alt: string;
  credit?: string;
}

export interface Sala {
  id: RoomId;
  numero: string;
  categoria: string;
  nome: string;
  titulo: string;
  descricao: string;
  capacidade: string;
  recursos: string[];
  imagens: SalaImagem[];
}
