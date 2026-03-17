import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ClienteFila } from '../types';

export const AdminPage = (): JSX.Element => {
  const [fila, setFila] = useState<ClienteFila[]>([]);

  const load = async (): Promise<void> => {
    const response = await api.get<ClienteFila[]>('/agendamentos/admin/upcoming');
    setFila(response.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const alterar = async (id: number, payload: Record<string, string>): Promise<void> => {
    await api.patch(`/agendamentos/${id}`, payload);
    void load();
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 text-urban-white">
      <h1 className="font-mural text-4xl text-urban-red">Painel Admin</h1>
      <p className="mb-4 text-zinc-400">Clientes próximos com destaque para o corte favorito.</p>

      <div className="space-y-3">
        {fila.map((item) => (
          <article key={item.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{item.nome}</h2>
                <p className="text-sm text-zinc-300">
                  {item.data} · {item.hora} · Corte favorito: <span className="text-urban-blue">{item.corte_favorito || 'Não informado'}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void alterar(item.id, { status: 'confirmado' })} className="rounded bg-urban-blue px-3 py-2 text-zinc-950">
                  Confirmar
                </button>
                <button onClick={() => void alterar(item.id, { status: 'cancelado' })} className="rounded bg-urban-red px-3 py-2 text-white">
                  Cancelar
                </button>
                <button
                  onClick={() => void alterar(item.id, { novaData: item.data, novaHora: '19:00' })}
                  className="rounded border border-zinc-500 px-3 py-2"
                >
                  Editar horário
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};
