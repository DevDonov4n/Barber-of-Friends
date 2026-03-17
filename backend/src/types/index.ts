export interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  idade?: number;
  corte_favorito?: string;
}

export interface Agendamento {
  id: number;
  user_id: number;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'atendido';
  preco: number;
}
