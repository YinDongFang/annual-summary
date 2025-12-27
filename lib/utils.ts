import { clsx, type ClassValue } from "clsx";
import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function fitTextToWidth(text: string, styleObj: CSSProperties, maxWidth: number) {
  const span = document.createElement("span");
  span.innerText = text;

  // 设置基本样式以确保测量准确
  Object.assign(span.style, {
    ...styleObj,
    fontSize: "100px",
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "nowrap",
    zIndex: "-1",
  });

  document.body.appendChild(span);
  const width = span.getBoundingClientRect().width;
  document.body.removeChild(span);

  const fontSize = maxWidth / width * 100;
  return fontSize;
}
