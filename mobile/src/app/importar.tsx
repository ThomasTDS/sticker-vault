import { File } from 'expo-file-system';
import { router, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { takeIncomingFileUri } from '@/stickers/incoming-file';
import { importPackFromFile, PackFileError } from '@/stickers/pack-transfer';
import { palette } from '@/theme/colors';

// Opened when the user picks Sticker Vault in Android's "Open with" for a .stickervault file.
export default function ImportScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const uri = takeIncomingFileUri();
    if (!uri) {
      router.replace('/');
      return;
    }

    importPackFromFile(db, new File(uri))
      .then((result) => {
        // The vault goes underneath, so "back" from the new drawer returns to it instead of closing the app.
        router.replace('/');
        router.push({ pathname: '/gavetas/[id]', params: { id: result.packId } });
        if (result.skipped > 0) {
          Alert.alert(
            'Gaveta importada',
            `${result.imported} figurinha(s) importada(s); ${result.skipped} não puderam ser lidas.`,
          );
        }
      })
      .catch((reason) => {
        setError(
          reason instanceof PackFileError && reason.reason === 'no-stickers'
            ? 'Nenhuma figurinha desse arquivo pôde ser lida.'
            : 'Esse arquivo não é uma gaveta do Sticker Vault.',
        );
      });
  }, [db]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <>
          <Text testID="import-error-message" style={[styles.message, { color: colors.text }]}>
            {error}
          </Text>
          <Pressable
            testID="import-back-button"
            onPress={() => router.replace('/')}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.primaryButtonText}>Voltar para o cofre</Text>
          </Pressable>
        </>
      ) : (
        <View testID="import-progress" style={styles.progress}>
          <ActivityIndicator color={palette.gold} size="large" />
          <Text style={[styles.message, { color: colors.text }]}>Abrindo a gaveta...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
  },
  progress: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: palette.brown,
    fontSize: 16,
    fontWeight: '700',
  },
});
