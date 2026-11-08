import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PracticeSession from '../src/components/PracticeSession.jsx';

const practiceSet = {
  id: 'fruit',
  name: 'Fruit',
  words: [
    { id: 'apple', english: 'apple', vietnamese: 'táo' },
    { id: 'banana', english: 'banana', vietnamese: 'chuối' },
    { id: 'cherry', english: 'cherry', vietnamese: 'anh đào' },
  ],
};

function renderSession(set = practiceSet, onCardReviewed = vi.fn()) {
  const view = render(
    <MemoryRouter>
      <PracticeSession set={set} language="english" onCardReviewed={onCardReviewed} />
    </MemoryRouter>,
  );

  return { ...view, onCardReviewed };
}

describe('practice session', () => {
  it('flips and advances through cards, counting each reviewed word once', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { onCardReviewed } = renderSession();

    expect(screen.getByRole('group', { name: 'apple flashcard' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show second side' }));
    expect(screen.getByRole('group', { name: 'táo flashcard' })).toBeTruthy();
    expect(screen.getByText('1 reviewed')).toBeTruthy();
    expect(onCardReviewed).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Show first side' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show second side' }));
    expect(screen.getByText('1 reviewed')).toBeTruthy();
    expect(onCardReviewed).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    expect(screen.getByRole('group', { name: 'cherry flashcard' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show second side' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    expect(screen.getByRole('group', { name: 'banana flashcard' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show second side' }));
    expect(screen.getByText('3 reviewed')).toBeTruthy();
    expect(onCardReviewed).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    expect(screen.getByText('3 of 3 words reviewed')).toBeTruthy();
  });

  it('restarts a completed session with a fresh review count', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    renderSession();

    for (let index = 0; index < practiceSet.words.length; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Show second side' }));
      if (index < practiceSet.words.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
      }
    }
    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    fireEvent.click(screen.getByRole('button', { name: 'Practice again' }));

    expect(screen.getByText('Word 1 of 3')).toBeTruthy();
    expect(screen.getByText('0 reviewed')).toBeTruthy();
  });

  it('shows a useful empty state for sets without words', () => {
    renderSession({ ...practiceSet, words: [] });

    expect(screen.getByRole('status').textContent).toContain('This set has no words yet.');
    expect(screen.getByRole('link', { name: 'Return home' })).toBeTruthy();
  });
});
