import { useTheme } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors } = useTheme();
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

      <View testID="home-empty-state" style={styles.emptyState}>
        <Text testID="home-empty-message" style={[styles.emptyText, { color: colors.text }]}>
          Nenhum pacote por aqui ainda.
        </Text>
      </View>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
