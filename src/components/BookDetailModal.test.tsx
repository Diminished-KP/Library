// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
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
  afterEach(() => {
    cleanup();
  });

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

  it('allows duplicating a book and editing book details', () => {
    const onDuplicateBook = vi.fn();
    const onUpdateBook = vi.fn();
    const onClose = vi.fn();

    render(
      <BookDetailModal
        book={mockBook}
        isOpen={true}
        onClose={onClose}
        onUpdateReadingStatus={vi.fn()}
        onUpdateBook={onUpdateBook}
        onDuplicateBook={onDuplicateBook}
        t={translations.cs}
      />
    );

    // Click duplicate button
    const dupBtn = screen.getByTitle('Duplikovat knihu');
    fireEvent.click(dupBtn);
    expect(onDuplicateBook).toHaveBeenCalledWith(mockBook);
    expect(onClose).toHaveBeenCalled();
  });

  it('allows opening edit modal and saving updated details', () => {
    const onUpdateBook = vi.fn();
    const onClose = vi.fn();

    render(
      <BookDetailModal
        book={mockBook}
        isOpen={true}
        onClose={onClose}
        onUpdateReadingStatus={vi.fn()}
        onUpdateBook={onUpdateBook}
        t={translations.cs}
      />
    );

    // In footer or header there is an edit button
    const editBtns = screen.getAllByRole('button', { name: /Upravit knihu/i });
    fireEvent.click(editBtns[0]);

    // Edit modal should be open
    expect(screen.getByRole('heading', { level: 3, name: 'Upravit knihu' })).toBeDefined();

    const titleInput = screen.getByDisplayValue('Babička');
    fireEvent.change(titleInput, { target: { value: 'Babička (Ilustrované vydání)' } });

    const saveBtn = screen.getByText('Uložit');
    fireEvent.click(saveBtn);

    expect(onUpdateBook).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Babička (Ilustrované vydání)',
      })
    );
  });
});
