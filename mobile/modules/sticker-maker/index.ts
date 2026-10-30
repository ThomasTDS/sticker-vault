import { requireNativeModule } from 'expo';

type StickerMakerNativeModule = {
  removeBackground(uri: string): Promise<string>;
  composeSticker(uri: string, topText: string, bottomText: string): Promise<string>;
  createAnimatedSticker(uri: string): Promise<string>;
};

const StickerMaker = requireNativeModule<StickerMakerNativeModule>('StickerMaker');

// Size, in pixels, of the square image returned by composeSticker.
export const COMPOSED_STICKER_SIZE = 512;

export const removeBackground = (uri: string) => StickerMaker.removeBackground(uri);

export const composeSticker = (uri: string, topText: string, bottomText: string) =>
  StickerMaker.composeSticker(uri, topText, bottomText);

// Turns a short video or an animated GIF into an animated sticker (512x512 animated WebP, at most 10 s and 500 KB).
export const createAnimatedSticker = (mediaUri: string) => StickerMaker.createAnimatedSticker(mediaUri);
