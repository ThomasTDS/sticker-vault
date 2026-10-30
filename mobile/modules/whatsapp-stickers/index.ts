import { requireNativeModule } from 'expo';

export type AddStickerPackResult =
  | { status: 'added' }
  | { status: 'cancelled' }
  | { status: 'not_installed' }
  | { status: 'error'; message: string };

export type ReceivedSticker = {
  uri: string;
  modifiedAt: number;
};

type WhatsAppStickersNativeModule = {
  isWhatsAppInstalled(): boolean;
  addStickerPack(identifier: string, name: string): Promise<AddStickerPackResult>;
  getReceivedStickersFolder(): string | null;
  pickReceivedStickersFolder(): Promise<string | null>;
  listReceivedStickers(treeUri: string, limit: number): Promise<ReceivedSticker[]>;
  readStickerEmojis(uri: string): Promise<string[]>;
};

const WhatsAppStickers = requireNativeModule<WhatsAppStickersNativeModule>('WhatsAppStickers');

export const isWhatsAppInstalled = () => WhatsAppStickers.isWhatsAppInstalled();

export const addStickerPack = (identifier: string, name: string) => WhatsAppStickers.addStickerPack(identifier, name);

// Folder where WhatsApp saves received stickers, if the user already granted access to it.
export const getReceivedStickersFolder = () => WhatsAppStickers.getReceivedStickersFolder();

// Opens the system folder picker inside WhatsApp's sticker folder; resolves null if the user cancels.
export const pickReceivedStickersFolder = () => WhatsAppStickers.pickReceivedStickersFolder();

// Received stickers, most recent first.
export const listReceivedStickers = (treeUri: string, limit: number) =>
  WhatsAppStickers.listReceivedStickers(treeUri, limit);

// Emojis the pack creator attached to the sticker (stored in its metadata); empty when there are none.
export const readStickerEmojis = (uri: string) => WhatsAppStickers.readStickerEmojis(uri);
