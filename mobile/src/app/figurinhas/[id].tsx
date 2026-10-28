import { Image } from 'expo-image';
import { router, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getSticker, parseTags, STICKER_MAX_EMOJIS, updateStickerDetails, type Sticker } from '@/db/packs';
import { EMOJI_OPTIONS } from '@/stickers/emojis';

export default function StickerScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ id: string }>();
  const stickerId = Number(params.id);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSticker(db, stickerId).then((loaded) => {
      setSticker(loaded);
      setEmojis(loaded?.emojis ?? []);
      setTagsText(loaded?.tags.join(', ') ?? '');
    });
  }, [db, stickerId]);

  const limitReached = emojis.length >= STICKER_MAX_EMOJIS;

  function toggleEmoji(emoji: string) {
    if (emojis.includes(emoji)) {
      setEmojis(emojis.filter((selected) => selected !== emoji));
    } else if (!limitReached) {
      setEmojis([...emojis, emoji]);
    }
  }

  async function handleSave() {
    setSaving(true);
    await updateStickerDetails(db, stickerId, emojis, parseTags(tagsText));
    router.back();
  }

  if (!sticker) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.preview, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image testID="sticker-image" source={{ uri: sticker.fileUri }} style={styles.previewImage} contentFit="contain" />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Emojis</Text>
        <Text
          testID="sticker-emoji-selected"
          style={[emojis.length > 0 ? styles.selected : styles.placeholder, { color: colors.text }]}
        >
          {emojis.length > 0 ? emojis.join(' ') : 'Nenhum emoji escolhido'}
        </Text>
        <Text
          testID="sticker-emoji-hint"
          style={[styles.hint, { color: limitReached ? colors.primary : colors.text }]}
        >
          {limitReached
            ? `Máximo de ${STICKER_MAX_EMOJIS} emojis por figurinha.`
            : 'Escolha até 3 emojis. O WhatsApp usa eles para sugerir a figurinha enquanto você digita.'}
        </Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map((emoji) => {
            const selected = emojis.includes(emoji);
            return (
              <Pressable
                key={emoji}
                onPress={() => toggleEmoji(emoji)}
                accessibilityState={{ selected }}
                style={[
                  styles.emojiOption,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.card : 'transparent',
                  },
                ]}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
        <TextInput
          testID="sticker-tags-input"
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="Ex.: bom dia, trabalho, risada"
          placeholderTextColor={colors.border}
          autoCapitalize="none"
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
        <Text style={[styles.hint, { color: colors.text }]}>Separe as tags por vírgula.</Text>
      </View>

      <Pressable
        testID="sticker-save-button"
        onPress={handleSave}
        disabled={saving}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
      >
        <Text style={styles.primaryButtonText}>Salvar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 24,
  },
  preview: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
  },
  previewImage: {
    flex: 1,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  selected: {
    fontSize: 22,
  },
  placeholder: {
    fontSize: 15,
    opacity: 0.6,
  },
  hint: {
    fontSize: 13,
    opacity: 0.7,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: 10,
  },
  emojiText: {
    fontSize: 22,
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
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#1E2430',
    fontSize: 16,
    fontWeight: '700',
  },
});
