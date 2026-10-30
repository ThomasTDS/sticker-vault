import type { StickerSearchResult } from '@/db/packs';

// For each emoji a received sticker can carry, the emojis of good replies, best first.
// Replies are not always the same emoji: a crying sticker gets a hug, anger gets a peace offering.
const REPLY_MAP: Record<string, string[]> = {
  '😀': ['😀', '😂', '😎'],
  '😂': ['😂', '🤣', '💀'],
  '🤣': ['🤣', '😂', '💀'],
  '😅': ['😅', '😂', '🙏'],
  '😍': ['🥰', '😍', '😘'],
  '🥰': ['🥰', '😍', '❤️'],
  '😘': ['😘', '🥰', '❤️'],
  '😎': ['😎', '🔥', '👏'],
  '🤔': ['🤔', '👀', '🤯'],
  '🙄': ['🙄', '😏', '🤡'],
  '😴': ['😴', '☕', '🙄'],
  '😭': ['🙏', '😭', '💔'],
  '😡': ['🙏', '😅', '🙄'],
  '😱': ['😱', '🤯', '👀'],
  '🤡': ['🤡', '💀', '😂'],
  '💀': ['💀', '😂', '🤣'],
  '👍': ['👍', '👏', '😎'],
  '👎': ['👎', '💔', '🙄'],
  '👏': ['👏', '🎉', '🥳'],
  '🙏': ['🙏', '❤️', '🥰'],
  '👀': ['👀', '🤔', '😏'],
  '🔥': ['🔥', '😎', '🤩'],
  '❤️': ['❤️', '🥰', '😘'],
  '💔': ['🙏', '😭', '💔'],
  '🎉': ['🥳', '🎉', '🍻'],
  '🥳': ['🎉', '🥳', '🍻'],
  '😏': ['😏', '👀', '😎'],
  '🤯': ['🤯', '😱', '🤔'],
  '🤩': ['🤩', '🔥', '🥳'],
  '☕': ['☕', '😴', '👍'],
  '🍻': ['🍻', '🥳', '🎉'],
  '💩': ['💩', '🤡', '💀'],
};

export const REPLY_SUGGESTIONS_LIMIT = 12;

// The same emoji may come with or without the emoji presentation selector (❤ and ❤️).
const normalizeEmoji = (emoji: string) => emoji.replace(/️/g, '');

const NORMALIZED_REPLY_MAP = new Map(
  Object.entries(REPLY_MAP).map(([emoji, replies]) => [normalizeEmoji(emoji), replies.map(normalizeEmoji)]),
);

// Reply emojis for the received ones, in order of preference and without repetition.
// An emoji outside the map is answered with itself.
export function replyEmojisFor(receivedEmojis: string[]): string[] {
  const replies = receivedEmojis.flatMap((emoji) => {
    const normalized = normalizeEmoji(emoji);
    return NORMALIZED_REPLY_MAP.get(normalized) ?? [normalized];
  });
  return [...new Set(replies)];
}

// The user's stickers that answer the received emojis: best reply emoji first, then favorites,
// then the most used.
export function suggestReplies(
  receivedEmojis: string[],
  stickers: StickerSearchResult[],
  limit = REPLY_SUGGESTIONS_LIMIT,
): StickerSearchResult[] {
  const replies = replyEmojisFor(receivedEmojis);
  const ranked = stickers
    .map((sticker) => {
      const positions = sticker.emojis
        .map((emoji) => replies.indexOf(normalizeEmoji(emoji)))
        .filter((position) => position >= 0);
      return { sticker, rank: positions.length > 0 ? Math.min(...positions) : -1 };
    })
    .filter(({ rank }) => rank >= 0);

  ranked.sort(
    (a, b) =>
      a.rank - b.rank ||
      Number(b.sticker.favorite) - Number(a.sticker.favorite) ||
      b.sticker.useCount - a.sticker.useCount,
  );
  return ranked.slice(0, limit).map(({ sticker }) => sticker);
}
