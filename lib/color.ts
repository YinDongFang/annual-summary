export function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function hex(r: number, g: number, b: number) {
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}