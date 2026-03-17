import { Request, Response } from 'express';
import { db } from '../config/db';

export const registerOrLogin = async (req: Request, res: Response): Promise<Response> => {
  const { nome, email, telefone, idade, corte_favorito } = req.body;

  if (!email || !telefone) {
    return res.status(400).json({ message: 'Email e telefone são obrigatórios.' });
  }

  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const existing = (users as Array<{ id: number }>)[0];

  if (existing) {
    return res.json({ message: 'Login realizado com sucesso.', userId: existing.id });
  }

  const [result] = await db.query(
    'INSERT INTO users (nome, email, telefone, idade, corte_favorito) VALUES (?, ?, ?, ?, ?)',
    [nome, email, telefone, idade ?? null, corte_favorito ?? null]
  );

  return res.status(201).json({ message: 'Cadastro realizado com sucesso.', userId: (result as { insertId: number }).insertId });
};
