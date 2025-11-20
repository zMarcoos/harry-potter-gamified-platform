import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasWindow = () => typeof window !== 'undefined';
export const now = () => new Date();

const relativeTimeFormatter = new Intl.RelativeTimeFormat('pt-BR', {
  style: 'short',
  numeric: 'always',
});

export function formatRelativeTime(dateAsString: string): string {
  try {
    const date = new Date(dateAsString);
    const now = new Date();

    const differenceInMiliseconds = now.getTime() - date.getTime();
    if (differenceInMiliseconds < 0) return 'agora';

    const differenceInSeconds = Math.floor(differenceInMiliseconds / 1000);
    if (differenceInSeconds < 60) return 'agora';

    const differenceInMinutes = Math.floor(differenceInSeconds / 60);
    if (differenceInMinutes < 60) return relativeTimeFormatter.format(-differenceInMinutes, 'minute');

    const differenceInHours = Math.floor(differenceInMinutes / 60);
    if (differenceInHours < 24) return relativeTimeFormatter.format(-differenceInHours, 'hour');

    const differenceInDays = Math.floor(differenceInHours / 24);
    if (differenceInDays < 7) return relativeTimeFormatter.format(-differenceInDays, 'day');

    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'agora';
  }
}
