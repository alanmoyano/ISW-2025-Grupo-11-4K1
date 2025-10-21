import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const diasFestivos = new Set(["2025-12-25", "2025-01-01"]);

export const isValidFechaVisita = (value: string): boolean => {
  const date = new Date(value);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const esLunes = date.getUTCDay() === 1;
  const esPasada = date < today;
  const esFestivo = diasFestivos.has(value);

  return !(esLunes || esPasada || esFestivo);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}