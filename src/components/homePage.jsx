import PracticeSetCard from './PracticeSetCard.jsx';

export default function HomePage({
  difficultyLevels,
  filteredPracticeSets,
  onSearchQueryChange,
  onSelectSet,
  onToggleDifficulty,
  searchQuery,
  selectedDifficulties,
}) {
  return (
    <section className="practice-page" aria-label="Practice sets">
      <h2 className="practice-page__heading">Choose a practice set</h2>
      <div className="practice-set-search">
        <input
          className="practice-set-search__input"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          aria-label="Search practice sets by name"
          placeholder="Search practice sets"
        />
      </div>
      <div className="difficulty-filter" role="group" aria-label="Filter practice sets by difficulty">
        {difficultyLevels.map((difficulty) => (
          <button
            className="difficulty-filter__pill"
            type="button"
            key={difficulty}
            aria-pressed={selectedDifficulties.has(difficulty)}
            onClick={() => onToggleDifficulty(difficulty)}
          >
            {difficulty}
          </button>
        ))}
      </div>
      {filteredPracticeSets.length > 0 ? (
        <div className="practice-set-grid">
          {filteredPracticeSets.map((set) => (
            <PracticeSetCard key={set.id} set={set} onSelect={onSelectSet} />
          ))}
        </div>
      ) : (
        <p className="practice-set-empty" role="status">
          No practice sets match your search and difficulty filters.
        </p>
      )}
    </section>
  );
}
