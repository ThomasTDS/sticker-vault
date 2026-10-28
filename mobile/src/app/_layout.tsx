import { Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { DATABASE_NAME, migrateDatabase } from '@/db/database';
import { palette, VaultTheme } from '@/theme/colors';

export default function RootLayout() {
  return (
    <ThemeProvider value={VaultTheme}>
      <StatusBar style="light" />
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.brown },
            headerTintColor: palette.cream,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: palette.brown },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="gavetas/nova" options={{ title: 'Nova gaveta' }} />
          <Stack.Screen name="gavetas/[id]" options={{ title: '' }} />
          <Stack.Screen name="figurinhas/[id]" options={{ title: 'Figurinha' }} />
        </Stack>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
