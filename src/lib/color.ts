// Contraste WCAG entre deux couleurs #RRGGBB.

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `color` en texte sur `background` : même teinte, foncée par pas de 5 % jusqu'au contraste AA (4,5:1). */
export function readableOn(color: string, background: string): string {
  let rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const hex = () => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  for (let i = 0; i < 20 && contrast(hex(), background) < 4.5; i++) {
    rgb = rgb.map((c) => c * 0.95);
  }
  return hex();
}
