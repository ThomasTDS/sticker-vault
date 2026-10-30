import { strFromU8 } from 'fflate';

// Rules of the .stickervault file that do not touch the device: manifest validation and file checks.
// Kept apart from pack-transfer.ts, which reads and writes files, so they can be unit tested.

export const PACK_FILE_FORMAT = 'sticker-vault-pack';
export const PACK_FILE_VERSION = 1;
export const MANIFEST_NAME = 'manifest.json';

export type PackManifest = {
  format: typeof PACK_FILE_FORMAT;
  version: number;
  name: string;
  publisher: string;
  // Absent in files from before animated drawers existed, which are all static.
  animated?: boolean;
  stickers: { file: string; emojis: string[]; tags: string[] }[];
};

export class PackFileError extends Error {
  constructor(public readonly reason: 'invalid-file' | 'no-stickers') {
    super(reason);
  }
}

export function fileSafeName(name: string) {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'gaveta'
  );
}

const STICKER_SIZE = 512;

// Checks the WebP header: an extended (VP8X) 512x512 file with the animation flag, within the size limit.
export function isAnimatedSticker(bytes: Uint8Array, maxBytes: number) {
  const text = (start: number, length: number) => String.fromCharCode(...bytes.subarray(start, start + length));
  const uint24 = (start: number) => bytes[start] | (bytes[start + 1] << 8) | (bytes[start + 2] << 16);
  const ANIMATION_FLAG = 0x02;
  return (
    bytes.length >= 30 &&
    bytes.length <= maxBytes &&
    text(0, 4) === 'RIFF' &&
    text(8, 4) === 'WEBP' &&
    text(12, 4) === 'VP8X' &&
    (bytes[20] & ANIMATION_FLAG) !== 0 &&
    uint24(24) + 1 === STICKER_SIZE &&
    uint24(27) + 1 === STICKER_SIZE
  );
}

export const asStrings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function readManifest(entries: Record<string, Uint8Array>): PackManifest {
  const raw = entries[MANIFEST_NAME];
  if (!raw) {
    throw new PackFileError('invalid-file');
  }
  const manifest = JSON.parse(strFromU8(raw));
  if (
    manifest?.format !== PACK_FILE_FORMAT ||
    typeof manifest.version !== 'number' ||
    manifest.version > PACK_FILE_VERSION ||
    typeof manifest.name !== 'string' ||
    manifest.name.trim().length === 0 ||
    !Array.isArray(manifest.stickers)
  ) {
    throw new PackFileError('invalid-file');
  }
  return manifest;
}
