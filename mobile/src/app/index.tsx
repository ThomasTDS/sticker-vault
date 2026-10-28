import { router, useFocusEffect, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listPacks, PACK_MAX_STICKERS, type Pack } from '@/db/packs';

export default function HomeScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const [packs, setPacks] = useState<Pack[]>([]);

  useFocusEffect(
    useCallback(() => {
      listPacks(db).then(setPacks);
    }, [db]),
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text testID="home-title" style={[styles.title, { color: colors.text }]}>
          Sticker Vault
        </Text>
        <Text testID="home-subtitle" style={[styles.subtitle, { color: colors.text }]}>
          Suas figurinhas guardadas e prontas para o WhatsApp.
        </Text>
      </View>

      <FlatList
        testID="home-pack-list"
        data={packs}
        keyExtractor={(pack) => String(pack.id)}
        contentContainerStyle={packs.length === 0 ? styles.emptyContainer : styles.listContent}
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
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
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
    color: '#1E2430',
    fontSize: 16,
    fontWeight: '700',
  },
});
