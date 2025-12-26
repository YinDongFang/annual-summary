import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function picker<T>(items: T[]) {
  let pool = items.slice().sort(() => Math.random() - 0.5);
  return function () {
    const item = pool.shift();
    if (pool.length === 0) {
      pool = items.slice().sort(() => Math.random() - 0.5);
    }
    return item!;
  };
}