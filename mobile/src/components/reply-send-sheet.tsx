import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { isStickerPackAdded, isWhatsAppInstalled, openWhatsApp } from '../../modules/whatsapp-stickers';
import { getPack, PACK_MIN_STICKERS, registerStickerUse, type StickerSearchResult } from '@/db/packs';
import { shareSticker } from '@/stickers/share-sticker';
import { exportPacksForWhatsApp, sendPackToWhatsApp } from '@/stickers/whatsapp-export';
import { palette } from '@/theme/colors';

type SendStatus = 'loading' | 'no-whatsapp' | 'small-pack' | 'not-added' | 'added';

type ReplySendSheetProps = {
  sticker: StickerSearchResult;
  // Emoji to search for in WhatsApp's sticker tab; null when no emoji of the sticker matched.
  searchEmoji: string | null;
  onClose: () => void;
};

// WhatsApp sends a sticker shared by another app as a plain image; it only sends as a sticker what comes from
// a pack added to it. So the reply points to the sticker's drawer in WhatsApp, and sharing stays as an option.
export function ReplySendSheet({ sticker, searchEmoji, onClose }: ReplySendSheetProps) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<SendStatus>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load(): Promise<SendStatus> {
      if (!isWhatsAppInstalled()) {
        return 'no-whatsapp';
      }
      const pack = await getPack(db, sticker.packId);
      if (!pack || pack.stickerCount < PACK_MIN_STICKERS) {
        return 'small-pack';
      }
      return (await isStickerPackAdded(String(sticker.packId))) ? 'added' : 'not-added';
    }
    load()
      .catch((): SendStatus => 'not-added')
      .then((next) => {
        if (active) {
          setStatus(next);
        }
      });
    return () => {
      active = false;
    };
  }, [db, sticker.packId]);

  async function handleAddPack() {
    setBusy(true);
    try {
      const result = await sendPackToWhatsApp(db, sticker.packId, sticker.packName);
      if (result.status === 'added') {
        setStatus('added');
      } else if (result.status === 'not_installed') {
        setStatus('no-whatsapp');
      } else if (result.status === 'error') {
        Alert.alert('O WhatsApp recusou a gaveta', result.message);
      }
    } catch {
      Alert.alert('Ops!', 'Não deu pra preparar a gaveta pro WhatsApp. Tenta de novo?');
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenWhatsApp() {
    setBusy(true);
    try {
      // Stickers added to the drawer after it went to WhatsApp only show up once the export is rewritten.
      await exportPacksForWhatsApp(db);
      await registerStickerUse(db, sticker.id);
    } catch {
      // Opening WhatsApp still helps: the sticker may already be there.
    } finally {
      setBusy(false);
    }
    if (openWhatsApp()) {
      onClose();
    } else {
      setStatus('no-whatsapp');
    }
  }

  function handleOpenPack() {
    onClose();
    router.push({ pathname: '/gavetas/[id]', params: { id: sticker.packId } });
  }

  async function handleSendAsImage() {
    await shareSticker(db, sticker);
    onClose();
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View testID="reply-send-sheet" style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.preview}>
              <Image source={{ uri: sticker.fileUri }} style={styles.previewImage} contentFit="contain" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.subtitle}>Ela está na gaveta</Text>
              <Text testID="reply-send-pack-name" style={styles.title}>
                {sticker.packName}
              </Text>
            </View>
          </View>

          {status === 'loading' && <ActivityIndicator color={palette.gold} style={styles.loading} />}

          {status === 'no-whatsapp' && (
            <Text testID="reply-send-no-whatsapp" style={styles.text}>
              Instale o WhatsApp neste celular pra mandar como figurinha.
            </Text>
          )}

          {status === 'small-pack' && (
            <>
              <Text testID="reply-send-small-pack" style={styles.text}>
                Pra ir pro WhatsApp, a gaveta precisa de pelo menos {PACK_MIN_STICKERS} figurinhas.
              </Text>
              <Pressable testID="reply-send-open-pack" onPress={handleOpenPack} style={styles.primaryButton}>
                <Text style={styles.primaryText}>Abrir a gaveta</Text>
              </Pressable>
            </>
          )}

          {status === 'not-added' && (
            <>
              <Text testID="reply-send-not-added" style={styles.text}>
                O WhatsApp só manda como figurinha o que está numa gaveta adicionada a ele.
              </Text>
              <Pressable
                testID="reply-send-add-pack"
                onPress={handleAddPack}
                disabled={busy}
                style={[styles.primaryButton, styles.whatsappButton, busy && styles.disabled]}
              >
                <Text style={styles.primaryText}>{busy ? 'Preparando...' : 'Pôr a gaveta no WhatsApp'}</Text>
              </Pressable>
            </>
          )}

          {status === 'added' && (
            <>
              <Text testID="reply-send-search-hint" style={styles.text}>
                {searchEmoji
                  ? `No WhatsApp, toque no ícone de figurinhas e busque por ${searchEmoji}.`
                  : 'No WhatsApp, toque no ícone de figurinhas e abra a gaveta.'}
              </Text>
              <Pressable
                testID="reply-send-open-whatsapp"
                onPress={handleOpenWhatsApp}
                disabled={busy}
                style={[styles.primaryButton, styles.whatsappButton, busy && styles.disabled]}
              >
                <Text style={styles.primaryText}>Abrir o WhatsApp</Text>
              </Pressable>
            </>
          )}

          <Pressable testID="reply-send-as-image" onPress={handleSendAsImage} style={styles.secondaryButton}>
            <Text style={styles.linkText}>Mandar como imagem</Text>
          </Pressable>
          <Pressable testID="reply-send-close" onPress={onClose} style={styles.secondaryButton}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: palette.brownSurface,
    borderColor: palette.brownBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  preview: {
    backgroundColor: palette.brown,
    borderColor: palette.brownBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 96,
    padding: 6,
    width: 96,
  },
  previewImage: {
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: palette.cream,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.creamMuted,
    fontSize: 14,
  },
  text: {
    color: palette.cream,
    fontSize: 15,
    lineHeight: 21,
  },
  loading: {
    marginVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.gold,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 14,
  },
  whatsappButton: {
    backgroundColor: palette.whatsapp,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: palette.brown,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: palette.goldLight,
    fontSize: 15,
    fontWeight: '600',
  },
  closeText: {
    color: palette.creamMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
