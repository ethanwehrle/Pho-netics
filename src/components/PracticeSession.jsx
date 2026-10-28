import { useState } from 'react';

function shuffleWords(words) {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export default function PracticeSession({ set, language, onCardReviewed }) {
  const [deck, setDeck] = useState(() => shuffleWords(set.words));
  const [position, setPosition] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedWordIds, setReviewedWordIds] = useState(() => new Set());
  const translationLanguage = language === 'english' ? 'vietnamese' : 'english';
  const word = deck[position];
  const reviewedCount = reviewedWordIds.size;
  const visibleLanguage = isFlipped ? translationLanguage : language;

  function markWordReviewed(reviewedWord) {
    if (!reviewedWordIds.has(reviewedWord.id)) {
      setReviewedWordIds((reviewedIds) => new Set(reviewedIds).add(reviewedWord.id));
      onCardReviewed();
    }
  }

  function goBack() {
    if (position === deck.length) {
      const previousWord = deck[position - 1];
      setPosition(position - 1);
      setIsFlipped(true);
      markWordReviewed(previousWord);
    } else if (isFlipped) {
      setIsFlipped(false);
    } else if (position > 0) {
      const previousWord = deck[position - 1];
      setPosition(position - 1);
      setIsFlipped(true);
      markWordReviewed(previousWord);
    }
  }

  function goForward() {
    if (position >= deck.length) {
      return;
    }

    if (isFlipped) {
      setPosition(position + 1);
      setIsFlipped(false);
    } else {
      setIsFlipped(true);
      markWordReviewed(word);
    }
  }

  function restartPractice() {
    setDeck(shuffleWords(set.words));
    setPosition(0);
    setIsFlipped(false);
    setReviewedWordIds(new Set());
  }

  return (
    <section className="practice-page" aria-label={`${set.name} practice session`}>
      {deck.length === 0 ? (
        <p>This set has no words yet.</p>
      ) : word ? (
        <div className="flashcard-session">
          <div className="flashcard-progress" id="flashcard-progress" aria-live="polite" aria-atomic="true">
            <span>Word {(position + 1).toLocaleString()} of {deck.length.toLocaleString()}</span>
            <span>{reviewedCount.toLocaleString()} reviewed</span>
          </div>
          <progress className="flashcard-progress__bar" value={reviewedCount} max={deck.length} aria-label="Words reviewed" />
          <div className="flashcard" role="group" aria-label={`${word[visibleLanguage]} flashcard`}>
            <span className={`flashcard__inner${isFlipped ? ' flashcard__inner--flipped' : ''}`} key={word.id}>
              <span className="flashcard__face" aria-hidden={isFlipped}>
                <span className="flashcard__language">{language === 'english' ? 'English' : 'Vietnamese'}</span>
                <span className="flashcard__word" lang={language === 'english' ? 'en' : 'vi'}>{word[language]}</span>
              </span>
              <span className="flashcard__face flashcard__face--back" aria-hidden={!isFlipped}>
                <span className="flashcard__language">{translationLanguage === 'english' ? 'English' : 'Vietnamese'}</span>
                <span className="flashcard__word" lang={translationLanguage === 'english' ? 'en' : 'vi'}>{word[translationLanguage]}</span>
              </span>
            </span>
            <button
              className="flashcard__side-button flashcard__side-button--back"
              type="button"
              aria-label={isFlipped ? 'Show first side' : 'Previous card'}
              aria-describedby="flashcard-progress"
              onClick={goBack}
              disabled={position === 0 && !isFlipped}
            />
            <button
              className="flashcard__side-button flashcard__side-button--forward"
              type="button"
              aria-label={isFlipped ? 'Next card' : 'Show second side'}
              aria-describedby="flashcard-progress"
              onClick={goForward}
            />
          </div>
        </div>
      ) : (
        <div className="practice-complete" role="status" aria-labelledby="practice-heading">
          <h2 className="practice-complete__title" id="practice-heading">{set.name}</h2>
          <p className="practice-complete__count">
            {reviewedCount.toLocaleString()} of {deck.length.toLocaleString()} words reviewed
          </p>
          <div className="practice-complete__actions">
            <a className="practice-complete__button practice-complete__button--home" href="#/">
              Home
            </a>
            <button
              className="practice-complete__button practice-complete__button--again"
              type="button"
              onClick={restartPractice}
            >
              Practice again
            </button>
          </div>
        </div>
      )}
      {word && (
        <div className="flashcard-controls">
          <a className="flashcard-controls__home" href="#/" aria-label="Return home">Home</a>
          <div className="flashcard-controls__navigation">
            <button
              className="flashcard-controls__button"
              type="button"
              aria-label="Go back"
              onClick={goBack}
              disabled={position === 0 && !isFlipped}
            >
              ←
            </button>
            <button
              className="flashcard-controls__button"
              type="button"
              aria-label="Go forward"
              onClick={goForward}
              disabled={position === deck.length}
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}