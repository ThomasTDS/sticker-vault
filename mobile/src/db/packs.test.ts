import { describe, expect, it } from '@jest/globals';

import { normalizeSearchText, parseTags } from '@/db/packs';

describe('normalizeSearchText', () => {
  it('ignora maiúsculas, acentos e espaços nas pontas', () => {
    expect(normalizeSearchText('  Reação ')).toBe('reacao');
  });

  it('faz "Bom Dia" e "bom dia" virarem o mesmo texto', () => {
    expect(normalizeSearchText('Bom Dia')).toBe(normalizeSearchText('bom dia'));
  });

  it('mantém o cedilha e o til como letras simples', () => {
    expect(normalizeSearchText('Ação São')).toBe('acao sao');
  });

  it('não altera emojis', () => {
    expect(normalizeSearchText('😂')).toBe('😂');
  });
});

describe('parseTags', () => {
  it('separa as tags por vírgula e tira os espaços', () => {
    expect(parseTags('bom dia, café ,trabalho')).toEqual(['bom dia', 'café', 'trabalho']);
  });

  it('descarta tags vazias', () => {
    expect(parseTags(',, risada, ,')).toEqual(['risada']);
  });

  it('remove tags repetidas mantendo a primeira', () => {
    expect(parseTags('meme, gato, meme')).toEqual(['meme', 'gato']);
  });

  it('devolve lista vazia para texto em branco', () => {
    expect(parseTags('   ')).toEqual([]);
  });
});
