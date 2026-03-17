import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

export const enviarAlertaDezMinutos = async (email: string, horario: string): Promise<void> => {
  if (!env.smtpHost) {
    console.log(`[simulado] lembrete de 10 minutos para ${email} às ${horario}`);
    return;
  }

  await transporter.sendMail({
    from: 'no-reply@barberfriends.local',
    to: email,
    subject: 'Seu corte começa em 10 minutos! ✂️',
    text: `Fala! Seu horário está marcado para ${horario}. Estamos te esperando.`
  });
};
