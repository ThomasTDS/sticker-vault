import { requireNativeModule } from 'expo';

export type AddStickerPackResult =
  | { status: 'added' }
  | { status: 'cancelled' }
  | { status: 'not_installed' }
  | { status: 'error'; message: string };

type WhatsAppStickersNativeModule = {
  isWhatsAppInstalled(): boolean;
  addStickerPack(identifier: string, name: string): Promise<AddStickerPackResult>;
};

const WhatsAppStickers = requireNativeModule<WhatsAppStickersNativeModule>('WhatsAppStickers');

export const isWhatsAppInstalled = () => WhatsAppStickers.isWhatsAppInstalled();

export const addStickerPack = (identifier: string, name: string) => WhatsAppStickers.addStickerPack(identifier, name);
