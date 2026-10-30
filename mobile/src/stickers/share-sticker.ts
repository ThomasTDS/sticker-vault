import type { SQLiteDatabase } from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import { registerStickerUse, type Sticker } from '@/db/packs';

// Opens the Android share sheet with the sticker. It counts as a use when the sheet opens, since Android
// does not report which app received it. Returns false when sharing is not available.
export async function shareSticker(db: SQLiteDatabase, sticker: Sticker) {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert('Ops!', 'Este celular não permite compartilhar arquivos.');
    return false;
  }
  await registerStickerUse(db, sticker.id);
  await Sharing.shareAsync(sticker.fileUri, { mimeType: 'image/webp', dialogTitle: 'Mandar figurinha' });
  return true;
}
