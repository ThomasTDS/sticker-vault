import { Image } from 'expo-image';
import { router, useTheme } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { StickerSearchResult } from '@/db/packs';

type Props = {
  testID: string;
  title: string;
  stickers: StickerSearchResult[];
  showUseCount?: boolean;
};

// Horizontal row of stickers shown on the home screen (favorites, most used).
export function StickerShelf({ testID, title, stickers, showUseCount = false }: Props) {
  const { colors } = useTheme();

  if (stickers.length === 0) {
    return null;
  }

  return (
    <View testID={testID} style={styles.container}>
      <Text testID={`${testID}-title`} style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <FlatList
        horizontal
        data={stickers}
        keyExtractor={(sticker) => String(sticker.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        renderItem={({ item, index }) => (
          <Pressable
            testID={`${testID}-item-${index}`}
            onPress={() => router.push({ pathname: '/figurinhas/[id]', params: { id: item.id } })}
            style={[styles.cell, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Image source={{ uri: item.fileUri }} style={styles.image} contentFit="contain" />
            {showUseCount && (
              <Text testID={`${testID}-count-${index}`} style={[styles.count, { color: colors.text }]}>
                {item.useCount}×
              </Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    gap: 10,
  },
  cell: {
    width: 84,
    height: 84,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  image: {
    flex: 1,
  },
  count: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    fontSize: 12,
    fontWeight: '700',
  },
});
