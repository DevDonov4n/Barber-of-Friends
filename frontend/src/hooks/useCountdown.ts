import { useEffect, useState } from 'react';

const toDate = (data: string, hora: string): Date => new Date(`${data}T${hora}:00`);

export const useCountdown = (data?: string, hora?: string): string => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!data || !hora) return;

    const timer = setInterval(() => {
      const target = toDate(data, hora).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Seu horário chegou!');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [data, hora]);

  return timeLeft;
};
