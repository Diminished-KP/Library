// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BookPreviewModal } from './BookPreviewModal';
import { translations } from '../services/i18n';
import type { Book } from '../types/book';

const baseBook: Book = {
  id: 'book_preview',
  isbn: '9788020418005',
  title: 'Test book',
  addedAt: 1,
  libraryId: 'default',
  quantity: 1,
};

describe('BookPreviewModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the resulting quantity when the scanned title is already in the library', () => {
    render(
      <BookPreviewModal
        book={{ ...baseBook, quantity: 3 }}
        onAdd={vi.fn()}
        onDiscard={vi.fn()}
        t={translations.cs}
      />
    );

    expect(screen.getByRole('dialog', { name: baseBook.title })).toBeDefined();
    expect(screen.getByText(translations.cs.bookAlreadyInLibrary)).toBeDefined();
    expect(
      screen.getByText(`${translations.cs.quantityAfterAdding} 3 ${translations.cs.pcs}`)
    ).toBeDefined();
  });

  it('does not show an existing-title notice for a new title', () => {
    render(
      <BookPreviewModal
        book={baseBook}
        onAdd={vi.fn()}
        onDiscard={vi.fn()}
        t={translations.cs}
      />
    );

    expect(screen.queryByText(translations.cs.bookAlreadyInLibrary)).toBeNull();
  });
});
