const START_HOUR = 9;
const END_HOUR = 20;
const INTERVAL_MINUTES = 60;

export const horarioPadrao = {
  inicio: '09:00',
  fim: '20:00',
  intervaloMinutos: INTERVAL_MINUTES,
  precoFixo: 35
};

export const buildSlots = (): string[] => {
  const slots: string[] = [];

  for (let hour = START_HOUR; hour <= END_HOUR; hour += INTERVAL_MINUTES / 60) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return slots;
};
