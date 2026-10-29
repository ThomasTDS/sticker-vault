import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// WhatsApp requires static stickers to be 512x512 WebP files of at most 100 KB.
const STICKER_SIZE = 512;
const STICKER_MAX_BYTES = 100 * 1024;
const COMPRESS_STEPS = [0.9, 0.75, 0.6, 0.45, 0.3];

export type SourceImage = {
  uri: string;
  width: number;
  height: number;
};

function packDirectory(packId: number) {
  return new Directory(Paths.document, 'stickers', String(packId));
}

// Same as createStickerFile, for images whose dimensions are not known in advance.
export async function createStickerFileFromUri(packId: number, uri: string): Promise<string> {
  const { width, height } = await ImageManipulator.manipulate(uri).renderAsync();
  return createStickerFile(packId, { uri, width, height });
}

// Center-crops the image to a square and saves it as a WhatsApp-compatible sticker.
export async function createStickerFile(packId: number, image: SourceImage): Promise<string> {
  const side = Math.min(image.width, image.height);
  const rendered = await ImageManipulator.manipulate(image.uri)
    .crop({
      originX: Math.floor((image.width - side) / 2),
      originY: Math.floor((image.height - side) / 2),
      width: side,
      height: side,
    })
    .resize({ width: STICKER_SIZE, height: STICKER_SIZE })
    .renderAsync();

  const directory = packDirectory(packId);
  directory.create({ intermediates: true, idempotent: true });

  for (const compress of COMPRESS_STEPS) {
    const result = await rendered.saveAsync({ format: SaveFormat.WEBP, compress });
    const output = new File(result.uri);
    if (output.size <= STICKER_MAX_BYTES || compress === COMPRESS_STEPS[COMPRESS_STEPS.length - 1]) {
      const destination = new File(directory, `${Date.now()}-${Math.round(Math.random() * 1e6)}.webp`);
      output.move(destination);
      return destination.uri;
    }
    output.delete();
  }

  throw new Error('Unreachable');
}

export function deleteStickerFile(uri: string) {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

export function deletePackFiles(packId: number) {
  const directory = packDirectory(packId);
  if (directory.exists) {
    directory.delete();
  }
}
