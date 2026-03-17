import { useState } from 'react';
import { BookingWidget } from '../components/BookingWidget';
import { useCountdown } from '../hooks/useCountdown';
import { api } from '../services/api';

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  idade: string;
  corte_favorito: string;
};

export const ClientPage = (): JSX.Element => {
  const [form, setForm] = useState<FormState>({ nome: '', email: '', telefone: '', idade: '', corte_favorito: '' });
  const [userId, setUserId] = useState<number | null>(null);
  const [proximo, setProximo] = useState<{ data: string; hora: string } | null>(null);
  const countdown = useCountdown(proximo?.data, proximo?.hora);

  const login = async (): Promise<void> => {
    const response = await api.post<{ userId: number }>('/auth/login', {
      ...form,
      idade: form.idade ? Number(form.idade) : undefined
    });
    setUserId(response.data.userId);
  };

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 p-6 text-urban-white md:grid-cols-2">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="font-mural text-4xl text-urban-blue">Barber of Friends</h1>
        <p className="mt-2 text-zinc-300">Cadastre-se para reservar seu horário no corre do dia.</p>

        <div className="mt-6 grid gap-3">
          {Object.entries(form).map(([field, value]) => (
            <input
              key={field}
              placeholder={field.replace('_', ' ')}
              value={value}
              onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
          ))}
          <button onClick={() => void login()} className="rounded-lg bg-urban-blue px-4 py-2 font-semibold text-zinc-900">
            Entrar / Cadastrar
          </button>
        </div>

        {proximo && (
          <div className="mt-6 rounded-xl border border-urban-red/60 bg-zinc-950 p-4">
            <h3 className="font-mural text-2xl text-urban-red">Próximo atendimento</h3>
            <p className="text-zinc-300">
              {proximo.data} às {proximo.hora}
            </p>
            <p className="mt-2 text-lg font-bold text-urban-blue">Cronômetro: {countdown}</p>
            <p className="mt-1 text-xs text-zinc-400">Disparo de e-mail 10 min antes via API/Nodemailer.</p>
          </div>
        )}
      </section>

      {userId ? (
        <BookingWidget userId={userId} onBookingCreated={(data, hora) => setProximo({ data, hora })} />
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-700 p-6 text-zinc-400">Faça login para liberar os horários.</section>
      )}
    </main>
  );
};
