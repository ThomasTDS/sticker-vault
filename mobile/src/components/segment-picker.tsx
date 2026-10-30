import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ANIMATION_MAX_MS, ANIMATION_MIN_MS, getAnimationFrame } from '../../modules/sticker-maker';
import { palette } from '@/theme/colors';

export type Segment = {
  startMs: number;
  lengthMs: number;
};

type Props = {
  mediaUri: string;
  durationMs: number;
  onConfirm: (segment: Segment) => void;
  onSkip: () => void;
};

const SLIDER_STEP_MS = 100;
// Rendering a frame takes a moment, so previews wait for the slider to settle.
const PREVIEW_DELAY_MS = 250;

const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

// Lets the user choose which part of a video or GIF longer than WhatsApp's 10 s becomes the sticker,
// showing the first and last frames of the segment.
export function SegmentPicker({ mediaUri, durationMs, onConfirm, onSkip }: Props) {
  const [startMs, setStartMs] = useState(0);
  const [lengthMs, setLengthMs] = useState(Math.min(ANIMATION_MAX_MS, durationMs));
  const [frames, setFrames] = useState<{ first: string; last: string } | null>(null);

  // lengthMs keeps the length the user chose; near the end of the media the segment is cut short,
  // and it grows back when the start moves earlier again.
  const maxStartMs = Math.max(durationMs - ANIMATION_MIN_MS, 0);
  const maxLengthMs = Math.min(ANIMATION_MAX_MS, durationMs - startMs);
  const endMs = startMs + Math.min(lengthMs, maxLengthMs);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const [first, last] = await Promise.all([
          getAnimationFrame(mediaUri, startMs),
          getAnimationFrame(mediaUri, endMs - SLIDER_STEP_MS),
        ]);
        if (current) {
          setFrames({ first, last });
        }
      } catch {
        // Previews are a convenience; the segment can still be confirmed without them.
      }
    }, PREVIEW_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [mediaUri, startMs, endMs]);

  return (
    <Modal transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View testID="segment-picker" style={styles.sheet}>
          <Text style={styles.title}>Escolha o trecho</Text>
          <Text style={styles.subtitle}>
            Esse arquivo tem {formatSeconds(durationMs)}. O WhatsApp aceita até {formatSeconds(ANIMATION_MAX_MS)} por
            figurinha.
          </Text>

          <View style={styles.previews}>
            {[frames?.first, frames?.last].map((uri, index) => (
              <View key={index} style={styles.preview}>
                {uri ? (
                  <Image source={{ uri }} style={styles.previewImage} contentFit="contain" />
                ) : (
                  <ActivityIndicator color={palette.gold} />
                )}
                <Text style={styles.previewLabel}>{index === 0 ? 'Começa' : 'Termina'}</Text>
              </View>
            ))}
          </View>

          <Text testID="segment-range" style={styles.range}>
            {formatSeconds(startMs)} até {formatSeconds(endMs)}
          </Text>

          <Text style={styles.label}>
            Início: <Text testID="segment-start-value">{formatSeconds(startMs)}</Text>
          </Text>
          <Slider
            testID="segment-start-slider"
            minimumValue={0}
            maximumValue={maxStartMs}
            step={SLIDER_STEP_MS}
            value={startMs}
            onValueChange={setStartMs}
            minimumTrackTintColor={palette.gold}
            maximumTrackTintColor={palette.brownBorder}
            thumbTintColor={palette.goldLight}
          />

          <Text style={styles.label}>
            Duração: <Text testID="segment-length-value">{formatSeconds(endMs - startMs)}</Text>
          </Text>
          <Slider
            testID="segment-length-slider"
            minimumValue={ANIMATION_MIN_MS}
            maximumValue={Math.max(maxLengthMs, ANIMATION_MIN_MS)}
            step={SLIDER_STEP_MS}
            value={Math.min(lengthMs, maxLengthMs)}
            onValueChange={setLengthMs}
            minimumTrackTintColor={palette.gold}
            maximumTrackTintColor={palette.brownBorder}
            thumbTintColor={palette.goldLight}
          />

          <Pressable
            testID="segment-confirm-button"
            onPress={() => onConfirm({ startMs, lengthMs: endMs - startMs })}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmText}>Animar esse trecho</Text>
          </Pressable>
          <Pressable testID="segment-skip-button" onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular esse arquivo</Text>
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
  title: {
    color: palette.cream,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.creamMuted,
    fontSize: 14,
  },
  previews: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  preview: {
    flex: 1,
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: palette.brown,
    borderColor: palette.brownBorder,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 6,
  },
  previewImage: {
    width: '100%',
    flex: 1,
  },
  previewLabel: {
    color: palette.creamMuted,
    fontSize: 12,
    marginTop: 4,
  },
  range: {
    color: palette.goldLight,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    color: palette.cream,
    fontSize: 15,
    marginTop: 4,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: palette.gold,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 14,
  },
  confirmText: {
    color: palette.brown,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: palette.creamMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
