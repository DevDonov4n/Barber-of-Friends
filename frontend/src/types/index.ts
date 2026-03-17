export type Slot = {
  hora: string;
  disponivel: boolean;
};

export type ProximoAgendamento = {
  id: number;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'atendido';
};

export type ClienteFila = {
  id: number;
  nome: string;
  data: string;
  hora: string;
  status: string;
  corte_favorito: string;
};
