import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import HomePage from './components/homePage.jsx';
import PracticeSession from './components/PracticeSession.jsx';
import SetDialog from './components/SetDialog.jsx';
import SiteSidebar from './components/SiteSidebar.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import masterWords from '../data/master_words_list.json';
import setDefinitions from '../data/metadata/sets.json';
import { createPracticeSets } from './data/practiceSets.js';

const practiceSets = createPracticeSets(setDefinitions, masterWords);

const difficultyLevels = ['easy', 'medium', 'hard'];
const reviewCountStorageKey = 'cue-card-site-stats';
const themeStorageKey = 'cue-card-site-theme';

function readReviewedCardCount() {
  try {
    const savedStats = JSON.parse(localStorage.getItem(reviewCountStorageKey) || '{}');
    return Number.isSafeInteger(savedStats.cardsReviewed) && savedStats.cardsReviewed >= 0
      ? savedStats.cardsReviewed
      : 0;
  } catch (error) {
    console.warn('Unable to load the saved review count.', error);
    return 0;
  }
}

function readSavedTheme() {
  try {
    return localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.warn('Unable to load the saved theme.', error);
    return 'light';
  }
}

function PracticeRoute({ onCardReviewed }) {
  const { setId } = useParams();
  const [searchParams] = useSearchParams();
  const set = practiceSets.find((practiceSet) => practiceSet.id === setId);
  const language = searchParams.get('language');

  if (!set || !['english', 'vietnamese'].includes(language)) {
    return <NotFoundPage />;
  }

  return (
    <PracticeSession
      key={`${set.id}-${language}`}
      set={set}
      language={language}
      onCardReviewed={onCardReviewed}
    />
  );
}

function NotFoundPage() {
  return (
    <section className="practice-page" aria-labelledby="not-found-heading">
      <h2 className="practice-page__heading" id="not-found-heading">Page not found</h2>
      <p>That page doesn’t exist or the practice set is unavailable.</p>
      <Link to="/">Return home</Link>
    </section>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState(() => new Set());
  const [setSearchQuery, setSetSearchQuery] = useState('');
  const [cardsReviewed, setCardsReviewed] = useState(readReviewedCardCount);
  const [theme, setTheme] = useState(readSavedTheme);
  const normalizedSearchQuery = setSearchQuery.trim().toLowerCase();
  const filteredPracticeSets = practiceSets.filter((set) => {
    const matchesDifficulty = selectedDifficulties.size === 0 || selectedDifficulties.has(set.difficulty);
    const matchesSearch = set.name.toLowerCase().includes(normalizedSearchQuery);
    return matchesDifficulty && matchesSearch;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      console.warn('Unable to save the theme preference.', error);
    }
  }, [theme]);

  function startPractice(language) {
    navigate(`/practice/${encodeURIComponent(selectedSet.id)}?language=${language}`);
    setSelectedSet(null);
  }

  function recordCardReview() {
    const nextCount = cardsReviewed + 1;
    setCardsReviewed(nextCount);

    try {
      localStorage.setItem(reviewCountStorageKey, JSON.stringify({ cardsReviewed: nextCount }));
    } catch (error) {
      console.warn('Unable to save the review count.', error);
    }
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
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                difficultyLevels={difficultyLevels}
                filteredPracticeSets={filteredPracticeSets}
                onSearchQueryChange={setSetSearchQuery}
                onSelectSet={setSelectedSet}
                onToggleDifficulty={toggleDifficulty}
                searchQuery={setSearchQuery}
                selectedDifficulties={selectedDifficulties}
              />
            }
          />
          <Route path="/practice/:setId" element={<PracticeRoute onCardReviewed={recordCardReview} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SetDialog
        set={selectedSet}
        onStartPractice={startPractice}
        onClose={() => setSelectedSet(null)}
      />
    </>
  );
}