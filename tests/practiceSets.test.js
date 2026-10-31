import assert from 'node:assert/strict';
import test from 'node:test';
import { createPracticeSets } from '../src/data/practiceSets.js';

test('creates sets from shared word tags in vocabulary order', () => {
  const words = [
    { id: '1', tags: ['greetings', 'top_words'] },
    { id: '2', tags: ['top_words'] },
  ];
  const definitions = [
    { tagId: 'top_words', name: 'Top words', difficulty: 'easy', description: 'Common words.' },
    { tagId: 'greetings', name: 'Greetings', difficulty: 'easy', description: 'Greeting words.' },
  ];

  const sets = createPracticeSets(definitions, words);

  assert.deepEqual(sets.map((set) => set.words.map((word) => word.id)), [['1', '2'], ['1']]);
  assert.equal(sets[0].id, 'top_words');
  assert.equal(sets[0].image, '/images/placeholder.svg');
});

test('returns an empty word list for definitions without matching words', () => {
  const [set] = createPracticeSets(
    [{ tagId: 'missing', name: 'Missing', difficulty: 'easy', description: 'No words.' }],
    [{ id: '1', tags: ['present'] }],
  );

  assert.deepEqual(set.words, []);
});
