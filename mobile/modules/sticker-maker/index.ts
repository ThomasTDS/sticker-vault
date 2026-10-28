import { requireNativeModule } from 'expo';

type StickerMakerNativeModule = {
  removeBackground(uri: string): Promise<string>;
  composeSticker(uri: string, topText: string, bottomText: string): Promise<string>;
};

const StickerMaker = requireNativeModule<StickerMakerNativeModule>('StickerMaker');

// Size, in pixels, of the square image returned by composeSticker.
export const COMPOSED_STICKER_SIZE = 512;

export const removeBackground = (uri: string) => StickerMaker.removeBackground(uri);

export const composeSticker = (uri: string, topText: string, bottomText: string) =>
  StickerMaker.composeSticker(uri, topText, bottomText);
