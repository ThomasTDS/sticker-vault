import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { COMPOSED_STICKER_SIZE, composeSticker, removeBackground } from '../../../modules/sticker-maker';
import { addSticker, listStickers, PACK_MAX_STICKERS } from '@/db/packs';
import { createStickerFile } from '@/stickers/sticker-files';
import { palette } from '@/theme/colors';

const CAPTION_MAX_LENGTH = 40;

export default function CreateStickerScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ packId: string }>();
  const packId = Number(params.packId);
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [busy, setBusy] = useState<'removing' | 'saving' | null>(null);

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled) {
      return;
    }
    setOriginalUri(result.assets[0].uri);
    setImageUri(result.assets[0].uri);
    setBackgroundRemoved(false);
  }

  async function handleToggleBackground() {
    if (!originalUri) {
      return;
    }
    if (backgroundRemoved) {
      setImageUri(originalUri);
      setBackgroundRemoved(false);
      return;
    }
    setBusy('removing');
    try {
      setImageUri(await removeBackground(originalUri));
      setBackgroundRemoved(true);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'ERR_MODEL_DOWNLOADING') {
        Alert.alert(
          'Preparando o recorte',
          'Estamos baixando o recorte automático. Tenta de novo em alguns instantes.',
        );
      } else if (code === 'ERR_MODEL_UNAVAILABLE') {
        Alert.alert('Recorte indisponível', 'O recorte automático precisa do Google Play Services atualizado.');
      } else {
        Alert.alert('Não achei o destaque da foto', 'Tenta uma foto com uma pessoa, bicho ou objeto bem visível.');
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleSave() {
    if (!imageUri) {
      return;
    }
    const stickers = await listStickers(db, packId);
    if (stickers.length >= PACK_MAX_STICKERS) {
      Alert.alert('Gaveta cheia', `Cada gaveta guarda até ${PACK_MAX_STICKERS} figurinhas.`);
      return;
    }
    setBusy('saving');
    try {
      const composedUri = await composeSticker(imageUri, topText, bottomText);
      const fileUri = await createStickerFile(packId, {
        uri: composedUri,
        width: COMPOSED_STICKER_SIZE,
        height: COMPOSED_STICKER_SIZE,
      });
      await addSticker(db, packId, fileUri);
      router.back();
    } catch {
      Alert.alert('Ops!', 'Não deu pra salvar a figurinha. Tenta de novo?');
      setBusy(null);
    }
  }

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View testID="maker-preview" style={[styles.preview, { borderColor: colors.border }]}>
        {imageUri ? (
          <>
            <Image
              testID="maker-preview-image"
              source={{ uri: imageUri }}
              style={styles.previewImage}
              contentFit="contain"
            />
            {topText.trim().length > 0 && (
              <Text testID="maker-preview-top" style={[styles.caption, styles.captionTop]}>
                {topText.trim().toUpperCase()}
              </Text>
            )}
            {bottomText.trim().length > 0 && (
              <Text testID="maker-preview-bottom" style={[styles.caption, styles.captionBottom]}>
                {bottomText.trim().toUpperCase()}
              </Text>
            )}
          </>
        ) : (
          <Text testID="maker-empty-message" style={[styles.emptyText, { color: colors.text }]}>
            Escolha uma foto para começar.
          </Text>
        )}
        {busy === 'removing' && (
          <View style={styles.overlay}>
            <ActivityIndicator color={palette.gold} />
            <Text style={styles.overlayText}>Recortando...</Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <Pressable
          testID="maker-pick-button"
          onPress={handlePickPhoto}
          disabled={busy !== null}
          style={[styles.outlineButton, { borderColor: palette.gold }]}
        >
          <Text style={[styles.outlineButtonText, { color: palette.goldLight }]}>
            {imageUri ? 'Trocar foto' : 'Escolher foto'}
          </Text>
        </Pressable>
        <Pressable
          testID="maker-background-button"
          onPress={handleToggleBackground}
          disabled={!imageUri || busy !== null}
          accessibilityState={{ disabled: !imageUri || busy !== null, selected: backgroundRemoved }}
          style={[styles.outlineButton, { borderColor: palette.gold, opacity: imageUri ? 1 : 0.4 }]}
        >
          <Text style={[styles.outlineButtonText, { color: palette.goldLight }]}>
            {backgroundRemoved ? 'Restaurar fundo' : 'Remover fundo'}
          </Text>
        </Pressable>
      </View>
      {backgroundRemoved && (
        <Text testID="maker-background-status" style={[styles.status, { color: palette.goldLight }]}>
          Fundo removido.
        </Text>
      )}

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Texto de cima</Text>
        <TextInput
          testID="maker-top-text-input"
          value={topText}
          onChangeText={setTopText}
          maxLength={CAPTION_MAX_LENGTH}
          placeholder="Ex.: quando o chefe diz"
          placeholderTextColor={palette.creamMuted}
          style={inputStyle}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Texto de baixo</Text>
        <TextInput
          testID="maker-bottom-text-input"
          value={bottomText}
          onChangeText={setBottomText}
          maxLength={CAPTION_MAX_LENGTH}
          placeholder="Ex.: reunião rapidinha"
          placeholderTextColor={palette.creamMuted}
          style={inputStyle}
        />
      </View>

      <Pressable
        testID="maker-save-button"
        onPress={handleSave}
        disabled={!imageUri || busy !== null}
        accessibilityState={{ disabled: !imageUri || busy !== null }}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: imageUri && !busy ? 1 : 0.4 }]}
      >
        <Text style={styles.primaryButtonText}>{busy === 'saving' ? 'Guardando...' : 'Salvar na gaveta'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
  },
  preview: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  previewImage: {
    position: 'absolute',
    top: 9,
    right: 9,
    bottom: 9,
    left: 9,
  },
  caption: {
    position: 'absolute',
    left: 12,
    right: 12,
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  captionTop: {
    top: 10,
  },
  captionBottom: {
    bottom: 10,
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 11, 8, 0.7)',
  },
  overlayText: {
    color: palette.cream,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  status: {
    fontSize: 13,
    marginTop: -8,
    textAlign: 'center',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: palette.brown,
    fontSize: 16,
    fontWeight: '700',
  },
});
