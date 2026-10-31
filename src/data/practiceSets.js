export function createPracticeSets(setDefinitions, masterWords) {
  const wordsByTag = new Map();

  for (const word of masterWords) {
    for (const tagId of word.tags ?? []) {
      const taggedWords = wordsByTag.get(tagId);

      if (taggedWords) {
        taggedWords.push(word);
      } else {
        wordsByTag.set(tagId, [word]);
      }
    }
  }

  return setDefinitions.map((definition) => ({
    id: definition.tagId,
    name: definition.name,
    tagId: definition.tagId,
    difficulty: definition.difficulty,
    description: definition.description,
    words: wordsByTag.get(definition.tagId) ?? [],
  }));
}
