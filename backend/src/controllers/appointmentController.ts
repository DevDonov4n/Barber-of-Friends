import { Request, Response } from 'express';
import { db } from '../config/db';
import { buildSlots } from '../services/agendaService';

export const getAvailableSlots = async (req: Request, res: Response): Promise<Response> => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Informe a data.' });
  }

  const [rows] = await db.query(
    "SELECT DATE_FORMAT(hora, '%H:%i') AS hora FROM agendamentos WHERE data = ? AND status IN ('pendente', 'confirmado')",
    [date]
  );

  const ocupados = new Set((rows as Array<{ hora: string }>).map((r) => r.hora));
  const livres = buildSlots().filter((slot) => !ocupados.has(slot));

  return res.json({ date, slots: livres, preco: 35 });
};

export const createAppointment = async (req: Request, res: Response): Promise<Response> => {
  const { user_id, data, hora } = req.body;

  const [exists] = await db.query(
    "SELECT id FROM agendamentos WHERE data = ? AND hora = ? AND status IN ('pendente', 'confirmado')",
    [data, `${hora}:00`]
  );

  if ((exists as Array<{ id: number }>).length > 0) {
    return res.status(409).json({ message: 'Horário já reservado.' });
  }

  const [result] = await db.query(
    'INSERT INTO agendamentos (user_id, data, hora, status, preco) VALUES (?, ?, ?, ?, ?)',
    [user_id, data, `${hora}:00`, 'pendente', 35.0]
  );

  return res.status(201).json({ message: 'Agendamento criado.', id: (result as { insertId: number }).insertId });
};

export const updateStatus = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { status, novaData, novaHora } = req.body;

  if (status === 'cancelado') {
    await db.query('UPDATE agendamentos SET status = ? WHERE id = ?', ['cancelado', id]);
    return res.json({ message: 'Agendamento cancelado e vaga liberada.' });
  }

  if (novaData && novaHora) {
    await db.query('UPDATE agendamentos SET data = ?, hora = ? WHERE id = ?', [novaData, `${novaHora}:00`, id]);
  }

  if (status) {
    await db.query('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id]);
  }

  return res.json({ message: 'Agendamento atualizado.' });
};

export const adminUpcoming = async (_req: Request, res: Response): Promise<Response> => {
  const [rows] = await db.query(
    `SELECT a.id, a.data, DATE_FORMAT(a.hora, '%H:%i') AS hora, a.status, u.nome, u.corte_favorito
      FROM agendamentos a
      INNER JOIN users u ON u.id = a.user_id
      WHERE a.status IN ('pendente', 'confirmado')
      ORDER BY a.data, a.hora`
  );

  return res.json(rows);
};
