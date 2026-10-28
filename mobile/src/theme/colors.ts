import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

export const VaultLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#C8961E',
    background: '#F6F3EC',
    card: '#FFFFFF',
    text: '#1E2430',
    border: '#E2DCCD',
    notification: '#C0392B',
  },
};

export const VaultDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#E0B040',
    background: '#14171E',
    card: '#1F2430',
    text: '#EDEAE2',
    border: '#2E3442',
    notification: '#E5655A',
  },
};
