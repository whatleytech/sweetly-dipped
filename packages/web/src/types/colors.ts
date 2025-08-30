export const BrandColors = {
  sdBrownDark: '#4b2e2b',
  sdBrownLight: '#6b433f',
  sdPinkBase: '#ff66a0',
  sdPinkLight: '#ffe6f1',
  sdCream: '#fffaf6',
  sdWhite: '#ffffff',
  sdGoldAccent: '#bfa276',
} as const;

export type BrandColor = keyof typeof BrandColors; 