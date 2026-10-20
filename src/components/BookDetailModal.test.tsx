// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BookDetailModal } from './BookDetailModal';
import { translations } from '../services/i18n';
import type { Book } from '../types/book';

const mockBook: Book = {
  id: 'b1',
  isbn: '9788000058825',
  title: 'Babička',
  authors: 'Božena Němcová',
  genre: 'Klasika',
  readingStatus: 'unread',
  libraryId: 'lib1',
  quantity: 1,
  addedAt: 1,
};

describe('BookDetailModal', () => {
  it('renders book details and switches reading status', () => {
    const onUpdateReadingStatus = vi.fn();
    const onUpdateBook = vi.fn();
    const onClose = vi.fn();

    render(
      <BookDetailModal
        book={mockBook}
        isOpen={true}
        onClose={onClose}
        onUpdateReadingStatus={onUpdateReadingStatus}
        onUpdateBook={onUpdateBook}
        t={translations.cs}
      />
    );

    expect(screen.getByText('Detail knihy')).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Babička' })).toBeDefined();
    expect(screen.getByText(/Božena Němcová/)).toBeDefined();
    expect(screen.getByText('Klasika')).toBeDefined();

    // Click "Právě čtu"
    const readingButton = screen.getByText('Právě čtu');
    fireEvent.click(readingButton);

    expect(onUpdateReadingStatus).toHaveBeenCalledWith(mockBook, 'reading');
  });
});
