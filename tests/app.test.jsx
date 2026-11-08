import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../src/App.jsx';

function LocationOutput() {
  const location = useLocation();
  return <output aria-label="Current URL">{location.pathname}{location.search}</output>;
}

function renderApp(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
      <LocationOutput />
    </MemoryRouter>,
  );
}

describe('application flows', () => {
  it('filters sets by search and difficulty', () => {
    renderApp('/sets');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search practice sets by name' }), {
      target: { value: 'food' },
    });

    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Food II')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'medium' }));
    expect(screen.getByText('Food II')).toBeTruthy();
    expect(screen.queryByText('Food')).toBeNull();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search practice sets by name' }), {
      target: { value: 'no matching set' },
    });
    expect(screen.getByText('No practice sets match your search and difficulty filters.')).toBeTruthy();
  });

  it('starts a selected set in the chosen language', () => {
    renderApp('/sets');
    fireEvent.click(screen.getByRole('button', { name: 'Pronouns & Family Terms' }));
    expect(screen.getByRole('dialog').open).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByLabelText('Current URL').textContent).toBe('/practice/pronouns?language=english');
    expect(screen.getByText(/Word 1 of/)).toBeTruthy();
  });

  it.each([
    ['/practice/not-a-set?language=english', 'unknown set'],
    ['/practice/pronouns?language=french', 'unsupported language'],
  ])('shows not-found content for %s (%s)', (route) => {
    renderApp(route);

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy();
  });

  it('persists reviewed cards and the chosen theme', () => {
    const app = renderApp('/practice/pronouns?language=english');

    fireEvent.click(screen.getByRole('button', { name: 'Show second side' }));
    expect(screen.getByText('1')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('cue-card-site-stats'))).toEqual({ cardsReviewed: 1 });

    fireEvent.click(screen.getByRole('button', { name: 'Open appearance settings' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('cue-card-site-theme')).toBe('dark');

    app.unmount();
    renderApp('/');
    expect(screen.getByText('1')).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('closes dialogs with their cancel controls and Escape key', () => {
    renderApp('/sets');
    fireEvent.click(screen.getByRole('button', { name: 'Pronouns & Family Terms' }));
    const setDialog = screen.getByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(setDialog.open).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Pronouns & Family Terms' }));
    fireEvent(setDialog, new Event('cancel', { cancelable: true }));
    expect(setDialog.open).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Open appearance settings' }));
    const settingsDialog = screen.getByRole('dialog', { name: 'Site Settings' });
    fireEvent.keyDown(settingsDialog, { key: 'Escape' });
    expect(settingsDialog.open).toBe(false);
  });
});
