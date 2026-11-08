import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import masterWords from '../data/master_words_list.json';
import setDefinitions from '../data/metadata/sets.json';

describe('project data integrity', () => {
  it('uses unique word IDs and valid word fields', () => {
    const wordIds = masterWords.map((word) => word.id);

    expect(new Set(wordIds).size).toBe(wordIds.length);
    expect(masterWords.length).toBeGreaterThan(0);

    for (const word of masterWords) {
      expect(word.id).toEqual(expect.any(String));
      expect(word.id.length).toBeGreaterThan(0);
      expect(word.vietnamese).toEqual(expect.any(String));
      expect(word.english).toEqual(expect.any(String));
      expect(Array.isArray(word.tags)).toBe(true);
      expect(word.tags.every((tag) => typeof tag === 'string' && tag.length > 0)).toBe(true);
      expect(word.audio).toEqual(expect.any(Object));

      for (const language of ['vietnamese', 'english']) {
        const audioPath = word.audio[language];
        expect(audioPath === null || typeof audioPath === 'string').toBe(true);

        if (typeof audioPath === 'string') {
          expect(audioPath.startsWith('/audio/')).toBe(true);
          expect(existsSync(resolve(process.cwd(), 'public', audioPath.slice(1)))).toBe(true);
        }
      }
    }
  });

  it('uses unique, URL-safe practice-set tags and supported difficulties', () => {
    const tagIds = setDefinitions.map((definition) => definition.tagId);

    expect(new Set(tagIds).size).toBe(tagIds.length);
    expect(setDefinitions.length).toBeGreaterThan(0);

    for (const definition of setDefinitions) {
      expect(definition.name).toEqual(expect.any(String));
      expect(definition.name.length).toBeGreaterThan(0);
      expect(definition.tagId).toMatch(/^[a-z0-9_]+$/);
      expect(definition.description).toEqual(expect.any(String));
      expect(['easy', 'medium', 'hard']).toContain(definition.difficulty.toLowerCase());
    }
  });
});
