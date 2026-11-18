// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BatchReviewModal } from './BatchReviewModal';
import { translations } from '../services/i18n';
import type { Book } from '../types/book';

describe('BatchReviewModal', () => {
  beforeEach(() => {
    cleanup();
  });

  const sampleBooks: Book[] = [
    {
      id: 'book_1',
      isbn: '9788000058825',
      title: 'Babička',
      authors: 'Božena Němcová',
      publishedYear: '1855',
      publisher: 'Albatros',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9788000058825-M.jpg',
      addedAt: Date.now(),
      libraryId: 'default',
      quantity: 1,
    },
    {
      id: 'book_2',
      isbn: '9780140328721',
      title: 'Fantastic Mr Fox',
      authors: 'Roald Dahl',
      publishedYear: '1970',
      publisher: 'Puffin',
      addedAt: Date.now(),
      libraryId: 'default',
      quantity: 1,
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
        t={translations.cs}
      />
    );

    expect(screen.getAllByText(/Naskenované knihy/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Babička')).toBeDefined();
    expect(screen.getByText('Fantastic Mr Fox')).toBeDefined();
    expect(screen.getByRole('dialog', { name: translations.cs.scannedBooksCount })).toBeDefined();
    expect(screen.getByRole('button', { name: `${translations.cs.delete}: ${sampleBooks[0].title}` })).toBeDefined();
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
        t={translations.cs}
      />
    );

    const saveButton = screen.getByText(/Uložit vše do knihovny/i);
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('distinguishes unique titles from total copies', () => {
    const booksWithCopies = [
      sampleBooks[0],
      { ...sampleBooks[1], quantity: 3 },
    ];

    render(
      <BatchReviewModal
        isOpen={true}
        books={booksWithCopies}
        onRemoveBook={vi.fn()}
        onSaveAll={vi.fn()}
        onDiscardAll={vi.fn()}
        t={translations.cs}
      />
    );

    expect(
      screen.getByText(`${translations.cs.uniqueTitlesCount}: 2 · ${translations.cs.totalCopiesCount}: 4`)
    ).toBeDefined();
    expect(screen.getByText(`${translations.cs.saveAll} (4 ${translations.cs.pcs})`)).toBeDefined();
  });
});
