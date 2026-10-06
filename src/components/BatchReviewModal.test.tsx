// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BatchReviewModal } from './BatchReviewModal';
import type { Book } from '../types/book';

describe('BatchReviewModal', () => {
  beforeEach(() => {
    cleanup();
  });

  const sampleBooks: Book[] = [
    {
      isbn: '9788000058825',
      title: 'Babička',
      authors: 'Božena Němcová',
      publishedYear: '1855',
      publisher: 'Albatros',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9788000058825-M.jpg',
      addedAt: Date.now(),
    },
    {
      isbn: '9780140328721',
      title: 'Fantastic Mr Fox',
      authors: 'Roald Dahl',
      publishedYear: '1970',
      publisher: 'Puffin',
      addedAt: Date.now(),
    },
  ];

  it('renders correctly with scanned books', () => {
    const handleRemove = vi.fn();
    const handleSave = vi.fn();
    const handleDiscard = vi.fn();

    render(
      <BatchReviewModal
        isOpen={true}
        books={sampleBooks}
        onRemoveBook={handleRemove}
        onSaveAll={handleSave}
        onDiscardAll={handleDiscard}
      />
    );

    expect(screen.getAllByText(/Naskenované knihy/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Babička')).toBeDefined();
    expect(screen.getByText('Fantastic Mr Fox')).toBeDefined();
  });

  it('calls onSaveAll when save button is clicked', () => {
    const handleSave = vi.fn();

    render(
      <BatchReviewModal
        isOpen={true}
        books={sampleBooks}
        onRemoveBook={vi.fn()}
        onSaveAll={handleSave}
        onDiscardAll={vi.fn()}
      />
    );

    const saveButtons = screen.getAllByRole('button', { name: /Uložit do knihovny/i });
    fireEvent.click(saveButtons[0]);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });
});
