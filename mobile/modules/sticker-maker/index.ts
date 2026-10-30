import { requireNativeModule } from 'expo';

type StickerMakerNativeModule = {
  removeBackground(uri: string): Promise<string>;
  composeSticker(uri: string, topText: string, bottomText: string): Promise<string>;
  getAnimationDuration(uri: string): Promise<number>;
  getAnimationFrame(uri: string, timeMs: number): Promise<string>;
  createAnimatedSticker(uri: string, startMs: number, lengthMs: number): Promise<string>;
};

const StickerMaker = requireNativeModule<StickerMakerNativeModule>('StickerMaker');

// Size, in pixels, of the square image returned by composeSticker.
export const COMPOSED_STICKER_SIZE = 512;

// WhatsApp limits animated stickers to 10 s; shorter segments are not worth a sticker.
export const ANIMATION_MAX_MS = 10000;
export const ANIMATION_MIN_MS = 500;

export const removeBackground = (uri: string) => StickerMaker.removeBackground(uri);

export const composeSticker = (uri: string, topText: string, bottomText: string) =>
  StickerMaker.composeSticker(uri, topText, bottomText);

// Duration, in milliseconds, of a video or animated GIF.
export const getAnimationDuration = (mediaUri: string) => StickerMaker.getAnimationDuration(mediaUri);

// The sticker frame (512x512 PNG) at the given time of a video or animated GIF.
export const getAnimationFrame = (mediaUri: string, timeMs: number) =>
  StickerMaker.getAnimationFrame(mediaUri, Math.round(timeMs));

// Turns a segment of a short video or an animated GIF into an animated sticker
// (512x512 animated WebP, at most 10 s and 500 KB).
export const createAnimatedSticker = (mediaUri: string, startMs = 0, lengthMs = ANIMATION_MAX_MS) =>
  StickerMaker.createAnimatedSticker(mediaUri, Math.round(startMs), Math.round(lengthMs));
