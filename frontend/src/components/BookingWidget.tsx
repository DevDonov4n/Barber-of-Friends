import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Slot } from '../types';

type Props = {
  userId: number;
  onBookingCreated: (date: string, hour: string) => void;
};

const PRICE = 'R$ 35,00';

export const BookingWidget = ({ userId, onBookingCreated }: Props): JSX.Element => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const weekday = useMemo(() => new Date(date).toLocaleDateString('pt-BR', { weekday: 'long' }), [date]);

  useEffect(() => {
    const fetchSlots = async (): Promise<void> => {
      const response = await api.get<{ slots: string[] }>('/agendamentos/slots', { params: { date } });
      const available = new Set(response.data.slots);
      const baseSlots = Array.from({ length: 12 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);
      setSlots(baseSlots.map((hora) => ({ hora, disponivel: available.has(hora) })));
    };

    void fetchSlots();
  }, [date]);

  const submit = async (): Promise<void> => {
    if (!selectedHour) return;
    setLoading(true);
    await api.post('/agendamentos', { user_id: userId, data: date, hora: selectedHour });
    onBookingCreated(date, selectedHour);
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-urban-blue/30 bg-zinc-900 p-5 shadow-neon">
      <h2 className="font-mural text-3xl text-urban-red">Agenda Urban SP</h2>
      <p className="mt-2 text-sm text-zinc-300">Funcionamento: segunda a domingo · 09h às 20h · Corte fixo {PRICE}</p>
      <p className="text-xs uppercase tracking-widest text-urban-blue">{weekday}</p>

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-urban-white"
      />

      <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.hora}
            disabled={!slot.disponivel}
            onClick={() => setSelectedHour(slot.hora)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              slot.disponivel
                ? selectedHour === slot.hora
                  ? 'bg-urban-red text-white'
                  : 'bg-zinc-800 text-zinc-100 hover:bg-urban-blue hover:text-zinc-950'
                : 'cursor-not-allowed bg-zinc-950 text-zinc-600 line-through'
            }`}
          >
            {slot.hora}
          </button>
        ))}
      </div>

      <button
        onClick={() => void submit()}
        disabled={!selectedHour || loading}
        className="mt-5 w-full rounded-xl bg-urban-red px-4 py-3 font-bold text-white disabled:opacity-60"
      >
        {loading ? 'Salvando...' : `Confirmar agendamento · ${PRICE}`}
      </button>
    </section>
  );
};
