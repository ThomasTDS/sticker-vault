import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useFocusEffect, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  addSticker,
  deletePack,
  deleteSticker,
  getPack,
  listStickers,
  PACK_MAX_STICKERS,
  PACK_MIN_STICKERS,
  type Pack,
  type Sticker,
} from '@/db/packs';
import { createStickerFile, deletePackFiles, deleteStickerFile } from '@/stickers/sticker-files';
import { sendPackToWhatsApp } from '@/stickers/whatsapp-export';
import { palette } from '@/theme/colors';

const GRID_COLUMNS = 3;

export default function PackScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ id: string }>();
  const packId = Number(params.id);
  const [pack, setPack] = useState<Pack | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [loadedPack, loadedStickers] = await Promise.all([getPack(db, packId), listStickers(db, packId)]);
    setPack(loadedPack);
    setStickers(loadedStickers);
  }, [db, packId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const remaining = PACK_MAX_STICKERS - stickers.length;
  const missingForWhatsApp = Math.max(PACK_MIN_STICKERS - stickers.length, 0);

  async function handleAddFromGallery() {
    if (remaining <= 0) {
      Alert.alert('Gaveta cheia', `Cada gaveta guarda até ${PACK_MAX_STICKERS} figurinhas.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
    });
    if (result.canceled) {
      return;
    }

    setProcessing(true);
    try {
      for (const asset of result.assets.slice(0, remaining)) {
        const fileUri = await createStickerFile(packId, asset);
        await addSticker(db, packId, fileUri);
      }
    } catch {
      Alert.alert('Ops!', 'Não deu pra guardar uma das imagens. Tenta de novo?');
    } finally {
      setProcessing(false);
      await load();
    }
  }

  async function handleSendToWhatsApp() {
    if (!pack) {
      return;
    }
    setSending(true);
    try {
      const result = await sendPackToWhatsApp(db, pack.id, pack.name);
      if (result.status === 'added') {
        Alert.alert('Prontinho!', `A gaveta "${pack.name}" já está no seu WhatsApp.`);
      } else if (result.status === 'not_installed') {
        Alert.alert('Cadê o WhatsApp?', 'Instale o WhatsApp neste celular para mandar suas figurinhas.');
      } else if (result.status === 'error') {
        Alert.alert('O WhatsApp recusou a gaveta', result.message);
      }
    } catch {
      Alert.alert('Ops!', 'Não deu pra preparar a gaveta pro WhatsApp. Tenta de novo?');
    } finally {
      setSending(false);
    }
  }

  function handleRemoveSticker(sticker: Sticker) {
    Alert.alert('Remover figurinha?', 'Ela sai do cofre de vez.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await deleteSticker(db, sticker.id);
          deleteStickerFile(sticker.fileUri);
          await load();
        },
      },
    ]);
  }

  function handleDeletePack() {
    Alert.alert('Excluir gaveta?', 'A gaveta e todas as figurinhas dela serão apagadas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deletePack(db, packId);
          deletePackFiles(packId);
          router.back();
        },
      },
    ]);
  }

  if (!pack) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: pack.name }} />

      <View style={styles.header}>
        <Text testID="pack-name" style={[styles.name, { color: colors.text }]}>
          {pack.name}
        </Text>
        <Text testID="pack-publisher" style={[styles.meta, { color: colors.text }]}>
          por {pack.publisher}
        </Text>
        <Text testID="pack-sticker-count" style={[styles.meta, { color: colors.text }]}>
          {stickers.length}/{PACK_MAX_STICKERS} figurinhas
        </Text>
        {missingForWhatsApp > 0 && (
          <Text testID="pack-min-hint" style={[styles.hint, { color: colors.primary }]}>
            {missingForWhatsApp === 1
              ? 'Falta 1 figurinha para mandar a gaveta pro WhatsApp.'
              : `Faltam ${missingForWhatsApp} figurinhas para mandar a gaveta pro WhatsApp.`}
          </Text>
        )}
        {stickers.length > 0 && (
          <Text testID="pack-sticker-tip" style={[styles.meta, { color: colors.text }]}>
            Toque numa figurinha para escolher emojis e tags; segure para remover.
          </Text>
        )}
      </View>

      <FlatList
        testID="pack-sticker-grid"
        data={stickers}
        numColumns={GRID_COLUMNS}
        keyExtractor={(sticker) => String(sticker.id)}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={stickers.length === 0 ? styles.emptyContainer : styles.gridContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text testID="pack-empty-message" style={[styles.emptyText, { color: colors.text }]}>
              Gaveta vazia. Bora enchê-la de figurinhas?
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            testID={`pack-sticker-${index}`}
            onPress={() => router.push({ pathname: '/figurinhas/[id]', params: { id: item.id } })}
            onLongPress={() => handleRemoveSticker(item)}
            style={[styles.stickerCell, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Image source={{ uri: item.fileUri }} style={styles.stickerImage} contentFit="contain" />
            {item.favorite && (
              <Text testID={`pack-sticker-favorite-${index}`} style={[styles.favoriteBadge, { color: colors.primary }]}>
                ★
              </Text>
            )}
          </Pressable>
        )}
      />

      {processing ? (
        <View testID="pack-processing" style={styles.processing}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.text }}>Guardando no cofre...</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            testID="pack-send-whatsapp-button"
            onPress={handleSendToWhatsApp}
            disabled={missingForWhatsApp > 0 || sending}
            accessibilityState={{ disabled: missingForWhatsApp > 0 || sending }}
            style={[
              styles.primaryButton,
              { backgroundColor: palette.whatsapp, opacity: missingForWhatsApp > 0 || sending ? 0.4 : 1 },
            ]}
          >
            <Text style={styles.primaryButtonText}>{sending ? 'Preparando...' : 'Mandar pro WhatsApp'}</Text>
          </Pressable>
          <View style={styles.actionRow}>
            <Pressable
              testID="pack-add-stickers-button"
              onPress={handleAddFromGallery}
              style={[styles.primaryButton, styles.actionRowButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.primaryButtonText}>Da galeria</Text>
            </Pressable>
            <Pressable
              testID="pack-create-sticker-button"
              onPress={() =>
                remaining > 0
                  ? router.push({ pathname: '/criar/[packId]', params: { packId } })
                  : Alert.alert('Gaveta cheia', `Cada gaveta guarda até ${PACK_MAX_STICKERS} figurinhas.`)
              }
              style={[
                styles.primaryButton,
                styles.actionRowButton,
                styles.outlineButton,
                { borderColor: palette.gold },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: palette.goldLight }]}>Criar figurinha</Text>
            </Pressable>
          </View>
          <Pressable testID="pack-delete-button" onPress={handleDeletePack} style={styles.secondaryButton}>
            <Text style={[styles.secondaryButtonText, { color: colors.notification }]}>Excluir gaveta</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    gap: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  meta: {
    fontSize: 15,
    opacity: 0.7,
  },
  hint: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
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
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  stickerCell: {
    flex: 1 / GRID_COLUMNS,
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  stickerImage: {
    flex: 1,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 16,
  },
  processing: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  actions: {
    gap: 10,
    paddingBottom: 24,
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRowButton: {
    flex: 1,
  },
  outlineButton: {
    borderWidth: 2,
    paddingVertical: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
