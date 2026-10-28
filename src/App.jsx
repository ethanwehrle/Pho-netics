import { useEffect, useState, useSyncExternalStore } from 'react';
import PracticeSession from './components/PracticeSession.jsx';
import PracticeSetCard from './components/PracticeSetCard.jsx';
import SetDialog from './components/SetDialog.jsx';
import SiteSidebar from './components/SiteSidebar.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import masterWords from '../data/master_words_list.json';
import setDefinitions from '../data/metadata/sets.json';

const practiceSets = setDefinitions.map((definition) => ({
  id: definition.tagId,
  name: definition.name,
  tagId: definition.tagId,
  difficulty: definition.difficulty,
  description: definition.description,
  image: definition.image || '/images/placeholder.svg',
  words: masterWords.filter((word) => word.tags?.includes(definition.tagId)),
}));

const difficultyLevels = ['easy', 'medium', 'hard'];
const reviewCountStorageKey = 'cue-card-site-stats';
const themeStorageKey = 'cue-card-site-theme';

function readReviewedCardCount() {
  try {
    const savedStats = JSON.parse(localStorage.getItem(reviewCountStorageKey) || '{}');
    return Number.isSafeInteger(savedStats.cardsReviewed) && savedStats.cardsReviewed >= 0
      ? savedStats.cardsReviewed
      : 0;
  } catch {
    return 0;
  }
}

function readSavedTheme() {
  try {
    return localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function subscribeToLocation(onChange) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function getLocation() {
  return window.location.hash;
}

export default function App() {
  const [selectedSet, setSelectedSet] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState(() => new Set());
  const [setSearchQuery, setSetSearchQuery] = useState('');
  const [cardsReviewed, setCardsReviewed] = useState(readReviewedCardCount);
  const [theme, setTheme] = useState(readSavedTheme);
  const location = useSyncExternalStore(subscribeToLocation, getLocation);
  const route = new URL(location.slice(1) || '/', window.location.origin);
  const activeSet = practiceSets.find((set) => route.pathname === `/practice/${set.id}`);
  const normalizedSearchQuery = setSearchQuery.trim().toLowerCase();
  const filteredPracticeSets = practiceSets.filter((set) => {
    const matchesDifficulty = selectedDifficulties.size === 0 || selectedDifficulties.has(set.difficulty);
    const matchesSearch = set.name.toLowerCase().includes(normalizedSearchQuery);
    return matchesDifficulty && matchesSearch;
  });
  const language = route.searchParams.get('language');
  const isPracticePage = activeSet && ['english', 'vietnamese'].includes(language);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {}
  }, [theme]);

  function startPractice(language) {
    window.location.hash = `/practice/${selectedSet.id}?language=${language}`;
    setSelectedSet(null);
  }

  function recordCardReview() {
    const nextCount = cardsReviewed + 1;
    setCardsReviewed(nextCount);

    try {
      localStorage.setItem(reviewCountStorageKey, JSON.stringify({ cardsReviewed: nextCount }));
    } catch {}
  }

  function toggleDifficulty(difficulty) {
    setSelectedDifficulties((currentDifficulties) => {
      const nextDifficulties = new Set(currentDifficulties);

      if (nextDifficulties.has(difficulty)) {
        nextDifficulties.delete(difficulty);
      } else {
        nextDifficulties.add(difficulty);
      }

      return nextDifficulties;
    });
  }

  return (
    <>
      <SiteHeader
        cardsReviewed={cardsReviewed}
        isSidebarOpen={isSidebarOpen}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
      <SiteSidebar
        isOpen={isSidebarOpen}
        theme={theme}
        onThemeChange={setTheme}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="app">
        {isPracticePage ? (
          <PracticeSession
            key={`${activeSet.id}-${language}`}
            set={activeSet}
            language={language}
            onCardReviewed={recordCardReview}
          />
        ) : (
          <section className="practice-page" aria-label="Practice sets">
            <div className="practice-set-search">
              <input
                className="practice-set-search__input"
                type="search"
                value={setSearchQuery}
                onChange={(event) => setSetSearchQuery(event.target.value)}
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
                  onClick={() => toggleDifficulty(difficulty)}
                >
                  {difficulty}
                </button>
              ))}
            </div>
            {filteredPracticeSets.length > 0 ? (
              <div className="practice-set-grid">
                {filteredPracticeSets.map((set) => (
                  <PracticeSetCard key={set.id} set={set} onSelect={setSelectedSet} />
                ))}
              </div>
            ) : (
              <p className="practice-set-empty" role="status">
                No practice sets match your search and difficulty filters.
              </p>
            )}
          </section>
        )}
      </main>
      <SetDialog
        set={selectedSet}
        onStartPractice={startPractice}
        onClose={() => setSelectedSet(null)}
      />
    </>
  );
}