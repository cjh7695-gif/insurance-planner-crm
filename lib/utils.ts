import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function today() {
  return toDateInputValue(new Date());
}

export function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${value}T00:00:00`));
}

export function formatLongDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${value}T00:00:00`));
}

export function isBeforeToday(value?: string | null) {
  return Boolean(value && value < today());
}

export function isToday(value?: string | null) {
  return value === today();
}

export function isWithinDays(value: string | undefined | null, days: number) {
  if (!value) return false;
  const start = today();
  const end = addDays(days);
  return value >= start && value <= end;
}

export function truncate(value: string | undefined | null, length = 48) {
  if (!value) return "";
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

export function percent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
