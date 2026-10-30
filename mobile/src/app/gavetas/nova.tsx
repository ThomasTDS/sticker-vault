import { router, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { createPack, PACK_NAME_MAX_LENGTH, PACK_PUBLISHER_MAX_LENGTH } from '@/db/packs';
import { palette } from '@/theme/colors';

export default function NewPackScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [animated, setAnimated] = useState(false);

  const nameMissing = name.trim().length === 0;
  const publisherMissing = publisher.trim().length === 0;

  async function handleSubmit() {
    if (nameMissing || publisherMissing) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    const id = await createPack(db, name, publisher, animated);
    router.replace({ pathname: '/gavetas/[id]', params: { id } });
  }

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Nome da gaveta</Text>
        <TextInput
          testID="new-pack-name-input"
          value={name}
          onChangeText={setName}
          maxLength={PACK_NAME_MAX_LENGTH}
          placeholder="Ex.: Reações do grupo"
          placeholderTextColor={palette.creamMuted}
          style={inputStyle}
        />
        {showErrors && nameMissing && (
          <Text testID="new-pack-name-error" style={[styles.error, { color: colors.notification }]}>
            Toda gaveta precisa de um nome.
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Autor</Text>
        <TextInput
          testID="new-pack-publisher-input"
          value={publisher}
          onChangeText={setPublisher}
          maxLength={PACK_PUBLISHER_MAX_LENGTH}
          placeholder="Ex.: Seu nome"
          placeholderTextColor={palette.creamMuted}
          style={inputStyle}
        />
        {showErrors && publisherMissing && (
          <Text testID="new-pack-publisher-error" style={[styles.error, { color: colors.notification }]}>
            Conta pra gente quem é o dono dessas figurinhas.
          </Text>
        )}
      </View>

      <View style={[styles.animatedRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.animatedText}>
          <Text style={[styles.label, { color: colors.text }]}>Gaveta animada</Text>
          <Text style={styles.animatedHint}>
            Guarda figurinhas animadas feitas a partir de vídeos curtos e GIFs. O WhatsApp não mistura figurinhas animadas e
            estáticas no mesmo pacote.
          </Text>
        </View>
        <Switch
          testID="new-pack-animated-switch"
          value={animated}
          onValueChange={setAnimated}
          trackColor={{ false: palette.brownBorder, true: palette.goldDeep }}
          thumbColor={animated ? palette.gold : palette.creamMuted}
        />
      </View>

      <Pressable
        testID="new-pack-submit-button"
        onPress={handleSubmit}
        disabled={saving}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
      >
        <Text style={styles.primaryButtonText}>Criar gaveta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
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
  error: {
    fontSize: 14,
  },
  animatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  animatedText: {
    flex: 1,
    gap: 4,
  },
  animatedHint: {
    color: palette.creamMuted,
    fontSize: 13,
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
