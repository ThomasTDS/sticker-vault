import { router, useFocusEffect, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerShelf } from '@/components/sticker-shelf';
import {
  listFavoriteStickers,
  listMostUsedStickers,
  listPacks,
  PACK_MAX_STICKERS,
  searchStickers,
  type Pack,
  type StickerSearchResult,
} from '@/db/packs';
import { palette, TITLE_FONT } from '@/theme/colors';

const RESULT_COLUMNS = 3;

export default function HomeScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StickerSearchResult[]>([]);
  const [favorites, setFavorites] = useState<StickerSearchResult[]>([]);
  const [mostUsed, setMostUsed] = useState<StickerSearchResult[]>([]);
  const searching = query.trim().length > 0;
  const hasShelves = favorites.length > 0 || mostUsed.length > 0;

  useFocusEffect(
    useCallback(() => {
      listPacks(db).then(setPacks);
      listFavoriteStickers(db).then(setFavorites);
      listMostUsedStickers(db).then(setMostUsed);
      searchStickers(db, query).then(setResults);
    }, [db, query]),
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image source={require('../../assets/images/logo-symbol.png')} style={styles.logo} contentFit="contain" />
          <Text testID="home-title" style={[styles.title, { color: colors.text }]}>
            Sticker Vault
          </Text>
        </View>
        <View style={styles.divider} />
        <Text testID="home-subtitle" style={styles.subtitle}>
          Suas figurinhas guardadas e prontas para o WhatsApp.
        </Text>
        {packs.length > 0 && (
          <TextInput
            testID="home-search-input"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por emoji, tag ou gaveta"
            placeholderTextColor={palette.creamMuted}
            autoCapitalize="none"
            style={[
              styles.searchInput,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
            ]}
          />
        )}
      </View>

      {searching ? (
        <FlatList
          key="search-results"
          testID="home-search-results"
          data={results}
          numColumns={RESULT_COLUMNS}
          keyExtractor={(sticker) => String(sticker.id)}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text testID="home-search-empty" style={[styles.emptyHint, { color: colors.text }]}>
                Nada no cofre com isso. Tenta outra busca?
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable
              testID={`home-search-result-${index}`}
              onPress={() => router.push({ pathname: '/figurinhas/[id]', params: { id: item.id } })}
              style={[styles.resultCell, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Image source={{ uri: item.fileUri }} style={styles.resultImage} contentFit="contain" />
              <Text
                testID={`home-search-result-pack-${index}`}
                numberOfLines={1}
                style={[styles.resultPack, { color: colors.text }]}
              >
                {item.packName}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          key="pack-list"
          testID="home-pack-list"
          data={packs}
          keyExtractor={(pack) => String(pack.id)}
          contentContainerStyle={packs.length === 0 ? styles.emptyContainer : styles.listContent}
          ListHeaderComponent={
            hasShelves ? (
              <View style={styles.shelves}>
                <StickerShelf testID="home-favorites" title="★ Favoritas" stickers={favorites} />
                <StickerShelf testID="home-most-used" title="Mais usadas" stickers={mostUsed} showUseCount />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Gavetas</Text>
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View testID="home-empty-state" style={styles.emptyState}>
              <Text testID="home-empty-message" style={[styles.emptyTitle, { color: colors.text }]}>
                Seu cofre tá vazio.
              </Text>
              <Text testID="home-empty-hint" style={[styles.emptyHint, { color: colors.text }]}>
                Crie uma gaveta e guarde suas primeiras figurinhas.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable
              testID={`home-pack-item-${index}`}
              onPress={() => router.push({ pathname: '/gavetas/[id]', params: { id: item.id } })}
              style={[styles.packCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text testID={`home-pack-name-${index}`} style={[styles.packName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text testID={`home-pack-count-${index}`} style={[styles.packCount, { color: colors.text }]}>
                {item.stickerCount}/{PACK_MAX_STICKERS} figurinhas
              </Text>
            </Pressable>
          )}
        />
      )}

      <Pressable
        testID="home-new-pack-button"
        onPress={() => router.push('/gavetas/nova')}
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.primaryButtonText}>Nova gaveta</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    gap: 8,
  },
  logo: {
    width: 56,
    height: 56,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: 26,
  },
  subtitle: {
    color: palette.creamMuted,
    fontSize: 16,
  },
  divider: {
    backgroundColor: palette.goldDeep,
    height: 1,
    marginTop: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  gridRow: {
    gap: 12,
  },
  resultCell: {
    flex: 1 / RESULT_COLUMNS,
    aspectRatio: 0.85,
    borderWidth: 1,
    borderRadius: 12,
    gap: 4,
    padding: 6,
  },
  resultImage: {
    flex: 1,
  },
  resultPack: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  shelves: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
  },
  packCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  packName: {
    fontSize: 17,
    fontWeight: '600',
  },
  packCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 24,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: palette.brown,
    fontSize: 16,
    fontWeight: '700',
  },
});
