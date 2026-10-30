import { describe, expect, it } from '@jest/globals';
import { strToU8 } from 'fflate';

import {
  asStrings,
  fileSafeName,
  isAnimatedSticker,
  MANIFEST_NAME,
  PACK_FILE_FORMAT,
  PACK_FILE_VERSION,
  PackFileError,
  readManifest,
} from '@/stickers/pack-manifest';

const MAX_BYTES = 500 * 1024;

const validManifest = {
  format: PACK_FILE_FORMAT,
  version: PACK_FILE_VERSION,
  name: 'Reações',
  publisher: 'Thomas',
  stickers: [{ file: 'stickers/1.webp', emojis: ['😂'], tags: ['risada'] }],
};

const entriesWith = (manifest: unknown) => ({ [MANIFEST_NAME]: strToU8(JSON.stringify(manifest)) });

// Minimal header of an extended WebP: RIFF, WEBP, VP8X chunk with flags and the canvas size minus one.
function webpHeader({ animated = true, width = 512, height = 512, size = 30 } = {}) {
  const bytes = new Uint8Array(size);
  const write = (offset: number, text: string) => bytes.set(strToU8(text), offset);
  const uint24 = (offset: number, value: number) => {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >> 8) & 0xff;
    bytes[offset + 2] = (value >> 16) & 0xff;
  };
  write(0, 'RIFF');
  write(8, 'WEBP');
  write(12, 'VP8X');
  bytes[20] = animated ? 0x02 : 0x00;
  uint24(24, width - 1);
  uint24(27, height - 1);
  return bytes;
}

function expectInvalidFile(action: () => unknown) {
  expect(action).toThrow(PackFileError);
  expect(action).toThrow('invalid-file');
}

describe('readManifest', () => {
  it('aceita um manifesto válido', () => {
    expect(readManifest(entriesWith(validManifest))).toMatchObject({ name: 'Reações', publisher: 'Thomas' });
  });

  it('aceita versões anteriores do formato', () => {
    expect(() => readManifest(entriesWith({ ...validManifest, version: 0 }))).not.toThrow();
  });

  it('recusa arquivo sem manifest.json', () => {
    expectInvalidFile(() => readManifest({ 'stickers/1.webp': new Uint8Array(1) }));
  });

  it('recusa outro formato de arquivo', () => {
    expectInvalidFile(() => readManifest(entriesWith({ ...validManifest, format: 'outro-app' })));
  });

  it('recusa versão mais nova que a do app', () => {
    expectInvalidFile(() => readManifest(entriesWith({ ...validManifest, version: PACK_FILE_VERSION + 1 })));
  });

  it('recusa gaveta sem nome ou com nome em branco', () => {
    expectInvalidFile(() => readManifest(entriesWith({ ...validManifest, name: undefined })));
    expectInvalidFile(() => readManifest(entriesWith({ ...validManifest, name: '   ' })));
  });

  it('recusa manifesto sem lista de figurinhas', () => {
    expectInvalidFile(() => readManifest(entriesWith({ ...validManifest, stickers: {} })));
  });

  it('falha com JSON quebrado', () => {
    expect(() => readManifest({ [MANIFEST_NAME]: strToU8('{ quebrado') })).toThrow(SyntaxError);
  });
});

describe('isAnimatedSticker', () => {
  it('aceita WebP animado de 512x512 dentro do limite', () => {
    expect(isAnimatedSticker(webpHeader(), MAX_BYTES)).toBe(true);
  });

  it('recusa WebP sem a marca de animação', () => {
    expect(isAnimatedSticker(webpHeader({ animated: false }), MAX_BYTES)).toBe(false);
  });

  it('recusa tamanho diferente de 512x512', () => {
    expect(isAnimatedSticker(webpHeader({ width: 256 }), MAX_BYTES)).toBe(false);
    expect(isAnimatedSticker(webpHeader({ height: 513 }), MAX_BYTES)).toBe(false);
  });

  it('recusa arquivo acima do limite de tamanho', () => {
    expect(isAnimatedSticker(webpHeader({ size: MAX_BYTES + 1 }), MAX_BYTES)).toBe(false);
  });

  it('recusa arquivo que não é WebP', () => {
    const gif = webpHeader();
    gif.set(strToU8('GIF8'), 0);
    expect(isAnimatedSticker(gif, MAX_BYTES)).toBe(false);
  });

  it('recusa arquivo curto demais para ter o cabeçalho', () => {
    expect(isAnimatedSticker(webpHeader().subarray(0, 20), MAX_BYTES)).toBe(false);
  });
});

describe('fileSafeName', () => {
  it('tira acentos e troca símbolos e espaços por hífen', () => {
    expect(fileSafeName('Reações & Memes!')).toBe('Reacoes-Memes');
  });

  it('usa "gaveta" quando não sobra nenhum caractere', () => {
    expect(fileSafeName('😂😂')).toBe('gaveta');
  });
});

describe('asStrings', () => {
  it('mantém só os textos de uma lista', () => {
    expect(asStrings(['😂', 1, null, 'meme'])).toEqual(['😂', 'meme']);
  });

  it('devolve lista vazia para o que não é lista', () => {
    expect(asStrings('😂')).toEqual([]);
    expect(asStrings(undefined)).toEqual([]);
  });
});
