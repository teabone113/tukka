export const brandColors = {
  primary: '#00A600',
  primaryDark: '#24B224',
  accent1: '#48BE48',
  accent2: '#6CCA6C',
  backgroundLight: '#FCFCFC',
  backgroundDark: '#121212',
} as const;

export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode) {
  return {
    '--color-bg': mode === 'light' ? brandColors.backgroundLight : brandColors.backgroundDark,
    '--color-fg': mode === 'light' ? '#0b0b0b' : '#f5f5f5',
    '--color-primary': brandColors.primary,
    '--color-primary-dark': brandColors.primaryDark,
    '--color-accent-1': brandColors.accent1,
    '--color-accent-2': brandColors.accent2,
    '--radius': '12px',
  } as Record<string, string>;
}


