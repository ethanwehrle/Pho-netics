import { describe, expect, it } from 'vitest';
import { createPracticeSets, normalizeDifficulty } from '../src/data/practiceSets.js';

describe('practice set data', () => {
  it('normalizes set difficulties for filtering', () => {
    expect(normalizeDifficulty('Easy')).toBe('easy');
    expect(normalizeDifficulty('Medium')).toBe('medium');
    expect(normalizeDifficulty('Moderate')).toBe('medium');
    expect(normalizeDifficulty('Hard')).toBe('hard');
  });

  it('creates sets from shared word tags in vocabulary order', () => {
    const words = [
      { id: '1', tags: ['greetings', 'top_words'] },
      { id: '2', tags: ['top_words'] },
    ];
    const definitions = [
      { tagId: 'top_words', name: 'Top words', difficulty: 'easy', description: 'Common words.' },
      { tagId: 'greetings', name: 'Greetings', difficulty: 'easy', description: 'Greeting words.' },
    ];

    const sets = createPracticeSets(definitions, words);

    expect(sets.map((set) => set.words.map((word) => word.id))).toEqual([['1', '2'], ['1']]);
    expect(sets[0].id).toBe('top_words');
    expect(Object.hasOwn(sets[0], 'image')).toBe(false);
  });

  it('returns an empty word list for definitions without matching words', () => {
    const [set] = createPracticeSets(
      [{ tagId: 'missing', name: 'Missing', difficulty: 'easy', description: 'No words.' }],
      [{ id: '1', tags: ['present'] }],
    );

    expect(set.words).toEqual([]);
  });
});
