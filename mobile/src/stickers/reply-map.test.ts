import { describe, expect, it } from '@jest/globals';

import type { StickerSearchResult } from '@/db/packs';
import { bestReplyEmoji, replyEmojisFor, suggestReplies } from '@/stickers/reply-map';

let nextId = 1;

function sticker(emojis: string[], overrides: Partial<StickerSearchResult> = {}): StickerSearchResult {
  const id = nextId++;
  return {
    id,
    packId: 1,
    packName: 'Reações',
    fileUri: `file:///stickers/1/${id}.webp`,
    createdAt: id,
    emojis,
    tags: [],
    favorite: false,
    useCount: 0,
    ...overrides,
  };
}

describe('replyEmojisFor', () => {
  it('devolve os emojis de resposta na ordem do mapa', () => {
    expect(replyEmojisFor(['😂'])).toEqual(['😂', '🤣', '💀']);
  });

  it('responde choro com consolo antes de choro', () => {
    expect(replyEmojisFor(['😭'])[0]).toBe('🙏');
  });

  it('responde com o próprio emoji quando ele não está no mapa', () => {
    expect(replyEmojisFor(['🦖'])).toEqual(['🦖']);
  });

  it('junta as respostas de vários emojis sem repetir', () => {
    expect(replyEmojisFor(['😂', '🤣'])).toEqual(['😂', '🤣', '💀']);
  });

  it('ignora o seletor de variação do emoji (❤ e ❤️)', () => {
    expect(replyEmojisFor(['❤'])).toEqual(replyEmojisFor(['❤️']));
  });

  it('devolve lista vazia sem emojis recebidos', () => {
    expect(replyEmojisFor([])).toEqual([]);
  });
});

describe('suggestReplies', () => {
  it('ordena pela posição do melhor emoji de resposta', () => {
    const skull = sticker(['💀']);
    const laughing = sticker(['😂']);
    const rofl = sticker(['🤣']);

    expect(suggestReplies(['😂'], [skull, rofl, laughing])).toEqual([laughing, rofl, skull]);
  });

  it('usa o melhor emoji de uma figurinha com vários', () => {
    const rofl = sticker(['🤣']);
    const mixed = sticker(['💀', '😂']);

    expect(suggestReplies(['😂'], [rofl, mixed])).toEqual([mixed, rofl]);
  });

  it('deixa de fora figurinhas sem emoji de resposta', () => {
    const coffee = sticker(['☕']);
    const untagged = sticker([]);

    expect(suggestReplies(['😂'], [coffee, untagged])).toEqual([]);
  });

  it('desempata pelas favoritas e depois pelas mais usadas', () => {
    const plain = sticker(['😂']);
    const used = sticker(['😂'], { useCount: 5 });
    const favorite = sticker(['😂'], { favorite: true });

    expect(suggestReplies(['😂'], [plain, used, favorite])).toEqual([favorite, used, plain]);
  });

  it('respeita o limite de sugestões', () => {
    const stickers = Array.from({ length: 20 }, () => sticker(['😂']));

    expect(suggestReplies(['😂'], stickers)).toHaveLength(12);
    expect(suggestReplies(['😂'], stickers, 3)).toHaveLength(3);
  });

  it('encontra figurinhas marcadas com ou sem o seletor de variação', () => {
    const heart = sticker(['❤']);

    expect(suggestReplies(['😍'], [heart])).toEqual([]);
    expect(suggestReplies(['🥰'], [heart])).toEqual([heart]);
  });
});

describe('bestReplyEmoji', () => {
  it('escolhe o emoji da figurinha que melhor responde', () => {
    expect(bestReplyEmoji(['😂'], sticker(['💀', '🤣']))).toBe('🤣');
  });

  it('mantém o emoji como a figurinha foi marcada', () => {
    expect(bestReplyEmoji(['🥰'], sticker(['❤️']))).toBe('❤️');
  });

  it('devolve null quando nenhum emoji da figurinha responde', () => {
    expect(bestReplyEmoji(['😂'], sticker(['☕']))).toBeNull();
  });
});
