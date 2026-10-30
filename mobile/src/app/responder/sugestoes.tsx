import { Image } from 'expo-image';
import { router, useFocusEffect, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { readStickerEmojis } from '../../../modules/whatsapp-stickers';
import { ReplySendSheet } from '@/components/reply-send-sheet';
import { listAllStickers, type StickerSearchResult } from '@/db/packs';
import { EMOJI_OPTIONS } from '@/stickers/emojis';
import { bestReplyEmoji, replyEmojisFor, suggestReplies } from '@/stickers/reply-map';
import { getReplyTarget } from '@/stickers/reply-target';
import { palette } from '@/theme/colors';

// Shows what the received sticker says (its emojis) and the user's stickers that answer it best.
export default function ReplySuggestionsScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const [targetUri] = useState(getReplyTarget);
  // null while the metadata is read; empty when the sticker has no emojis and the user has to pick one.
  const [detected, setDetected] = useState<string[] | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [choosing, setChoosing] = useState(false);
  const [stickers, setStickers] = useState<StickerSearchResult[]>([]);
  const [sending, setSending] = useState<StickerSearchResult | null>(null);

  useEffect(() => {
    if (!targetUri) {
      router.back();
      return;
    }
    readStickerEmojis(targetUri)
      .catch(() => [])
      .then((emojis) => {
        setDetected(emojis);
        setChosen(emojis);
        setChoosing(emojis.length === 0);
      });
  }, [targetUri]);

  // Reloaded on focus, so a sticker classified in the meantime shows up.
  useFocusEffect(
    useCallback(() => {
      listAllStickers(db).then(setStickers);
    }, [db]),
  );

  if (!targetUri || detected === null) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const suggestions = suggestReplies(chosen, stickers);
  const replyEmojis = replyEmojisFor(chosen);

  function handleChooseEmoji(emoji: string) {
    setChosen([emoji]);
    setChoosing(false);
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, styles.content]}
    >
      <View style={styles.targetRow}>
        <View style={[styles.targetCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image testID="reply-target-image" source={{ uri: targetUri }} style={styles.cellImage} contentFit="contain" />
        </View>
        <View style={styles.targetText}>
          {chosen.length > 0 ? (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                {chosen === detected ? 'Ela diz' : 'Ela quer dizer'}
              </Text>
              <Text testID="reply-target-emojis" style={styles.targetEmojis}>
                {chosen.join(' ')}
              </Text>
            </>
          ) : (
            <Text testID="reply-no-emojis" style={[styles.text, { color: colors.text }]}>
              Essa figurinha não diz o que sente. O que ela quer dizer?
            </Text>
          )}
          {!choosing && (
            <Pressable testID="reply-change-emoji" onPress={() => setChoosing(true)}>
              <Text style={[styles.link, { color: palette.goldLight }]}>Não é isso? Escolher outro emoji</Text>
            </Pressable>
          )}
        </View>
      </View>

      {choosing && (
        <View testID="reply-emoji-options" style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map((emoji, index) => (
            <Pressable
              key={emoji}
              testID={`reply-emoji-option-${index}`}
              onPress={() => handleChooseEmoji(emoji)}
              style={[styles.emojiOption, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {chosen.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pra responder</Text>
          <Text testID="reply-reply-emojis" style={styles.hint}>
            Combina com {replyEmojis.join(' ')}
          </Text>
          {suggestions.length === 0 ? (
            <Text testID="reply-suggestions-empty" style={[styles.text, styles.empty, { color: colors.text }]}>
              Nenhuma figurinha sua combina. Marque suas figurinhas com esses emojis pra elas aparecerem aqui.
            </Text>
          ) : (
            <View testID="reply-suggestions" style={styles.grid}>
              {suggestions.map((sticker, index) => (
                <Pressable
                  key={sticker.id}
                  testID={`reply-suggestion-${index}`}
                  accessibilityLabel={`Figurinha ${sticker.emojis.join(' ')}`}
                  onPress={() => setSending(sticker)}
                  style={[styles.cell, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Image source={{ uri: sticker.fileUri }} style={styles.cellImage} contentFit="contain" />
                  {sticker.favorite && <Text style={[styles.favoriteBadge, { color: colors.primary }]}>★</Text>}
                </Pressable>
              ))}
            </View>
          )}
          {suggestions.length > 0 && (
            <Text style={styles.hint}>Toque numa figurinha pra mandar.</Text>
          )}
        </>
      )}

      {sending && (
        <ReplySendSheet
          sticker={sending}
          searchEmoji={bestReplyEmoji(chosen, sending)}
          onClose={() => setSending(null)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 12,
    paddingBottom: 64,
    paddingTop: 16,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 16,
  },
  targetCell: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
  },
  targetText: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  targetEmojis: {
    fontSize: 32,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emojiText: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  hint: {
    color: palette.creamMuted,
    fontSize: 14,
  },
  empty: {
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
  },
  cellImage: {
    flex: 1,
  },
  favoriteBadge: {
    position: 'absolute',
    right: 8,
    top: 4,
    fontSize: 16,
  },
});
