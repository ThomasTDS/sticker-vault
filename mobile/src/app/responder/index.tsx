import { Image } from 'expo-image';
import { router, useFocusEffect, useTheme } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getReceivedStickersFolder,
  listReceivedStickers,
  pickReceivedStickersFolder,
  type ReceivedSticker,
} from '../../../modules/whatsapp-stickers';
import { setReplyTarget } from '@/stickers/reply-target';
import { palette } from '@/theme/colors';

const GRID_COLUMNS = 3;
const RECEIVED_LIMIT = 30;

// Lists the stickers that arrived on WhatsApp, most recent first, so the user picks the one to answer.
export default function ReceivedStickersScreen() {
  const { colors } = useTheme();
  const [folder, setFolder] = useState<string | null>(() => getReceivedStickersFolder());
  const [received, setReceived] = useState<ReceivedSticker[] | null>(null);

  const load = useCallback(async (treeUri: string | null) => {
    if (!treeUri) {
      setReceived(null);
      return;
    }
    try {
      setReceived(await listReceivedStickers(treeUri, RECEIVED_LIMIT));
    } catch {
      // The folder was removed or the permission revoked: ask for it again.
      setFolder(null);
      setReceived(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(folder);
    }, [folder, load]),
  );

  async function handlePickFolder() {
    const treeUri = await pickReceivedStickersFolder();
    if (treeUri) {
      setFolder(treeUri);
    }
  }

  function handleChoose(sticker: ReceivedSticker) {
    setReplyTarget(sticker.uri);
    router.push('/responder/sugestoes');
  }

  if (!folder) {
    return (
      <View testID="reply-access" style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Mostra o que chegou</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          Pra sugerir uma resposta, o cofre precisa ver as figurinhas que chegam no seu WhatsApp. Elas são lidas só aqui
          no celular, nada sai dele.
        </Text>
        <Text style={styles.hint}>Na tela seguinte, toque em &quot;Usar esta pasta&quot; e depois em &quot;Permitir&quot;.</Text>
        <Pressable
          testID="reply-grant-button"
          onPress={handlePickFolder}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.primaryButtonText}>Dar acesso às figurinhas recebidas</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text testID="reply-hint" style={[styles.text, styles.listHint, { color: colors.text }]}>
        Toque na figurinha que você recebeu.
      </Text>
      {received === null ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : (
        <FlatList
          testID="reply-received-grid"
          data={received}
          numColumns={GRID_COLUMNS}
          keyExtractor={(sticker) => sticker.uri}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={received.length === 0 ? styles.emptyContainer : styles.gridContent}
          ListEmptyComponent={
            <Text testID="reply-empty" style={[styles.text, styles.empty, { color: colors.text }]}>
              Nenhuma figurinha recebida por aqui ainda.
            </Text>
          }
          renderItem={({ item, index }) => (
            <Pressable
              testID={`reply-received-${index}`}
              onPress={() => handleChoose(item)}
              style={[styles.cell, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Image source={{ uri: item.uri }} style={styles.cellImage} contentFit="contain" />
            </Pressable>
          )}
        />
      )}
      <Pressable testID="reply-change-folder" onPress={handlePickFolder} style={styles.secondaryButton}>
        <Text style={[styles.secondaryButtonText, { color: palette.goldLight }]}>Trocar a pasta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    gap: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  hint: {
    color: palette.creamMuted,
    fontSize: 14,
  },
  listHint: {
    paddingVertical: 16,
  },
  loading: {
    flex: 1,
  },
  gridContent: {
    gap: 12,
    paddingBottom: 16,
  },
  gridRow: {
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    opacity: 0.6,
    textAlign: 'center',
  },
  cell: {
    flex: 1 / GRID_COLUMNS,
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  cellImage: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: palette.brown,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
