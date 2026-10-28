import { DarkTheme, type Theme } from 'expo-router';

// Brand palette: dark brown background, cream text and logo, gold accents.
export const palette = {
  brown: '#100B08',
  brownSurface: '#1D1510',
  brownBorder: '#3A2D22',
  cream: '#FFFAE5',
  creamMuted: '#B8B09C',
  gold: '#D4A64A',
  goldLight: '#EBCB82',
  goldDeep: '#8F6A27',
  danger: '#E5655A',
  whatsapp: '#25D366',
};

export const VaultTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: palette.gold,
    background: palette.brown,
    card: palette.brownSurface,
    text: palette.cream,
    border: palette.brownBorder,
    notification: palette.danger,
  },
};

export const TITLE_FONT = 'MajorMonoDisplay_400Regular';
