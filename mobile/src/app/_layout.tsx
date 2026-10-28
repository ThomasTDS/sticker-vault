import { Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { DATABASE_NAME, migrateDatabase } from '@/db/database';
import { VaultDarkTheme, VaultLightTheme } from '@/theme/colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? VaultDarkTheme : VaultLightTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="gavetas/nova" options={{ title: 'Nova gaveta' }} />
          <Stack.Screen name="gavetas/[id]" options={{ title: '' }} />
          <Stack.Screen name="figurinhas/[id]" options={{ title: 'Figurinha' }} />
        </Stack>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
