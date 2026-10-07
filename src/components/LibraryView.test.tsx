// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LibraryView } from './LibraryView';
import type { Book, Library } from '../types/book';

const mockLibraries: Library[] = [
  { id: 'lib1', name: 'Domácí knihovna', description: 'Hlavní', createdAt: 1 },
  { id: 'lib2', name: 'Pracovna', description: 'Knihy v práci', createdAt: 2 },
];

const mockBooks: Book[] = [
  {
    isbn: '9788000058825',
    title: 'Babička',
    authors: 'Božena Němcová',
    libraryId: 'lib1',
    quantity: 2,
    addedAt: 1,
  },
  {
    isbn: '9788020452304',
    title: 'Čapek a jeho svět',
    authors: 'Josef Čapek',
    libraryId: 'lib1',
    quantity: 1,
    addedAt: 2,
  },
  {
    isbn: '9788072037650',
    title: '1984',
    authors: 'George Orwell',
    libraryId: 'lib1',
    quantity: 1,
    addedAt: 3,
  },
];

describe('LibraryView', () => {
  it('renders library tabs, book items with quantity badge, and side alphabet sidebar', () => {
    const onSelectLibrary = vi.fn();
    const onOpenAddLibraryModal = vi.fn();
    const onDeleteLibrary = vi.fn();
    const onBackToMenu = vi.fn();
    const onDeleteBook = vi.fn();

    render(
      <LibraryView
        books={mockBooks}
        libraries={mockLibraries}
        activeLibraryId="lib1"
        onSelectLibrary={onSelectLibrary}
        onOpenAddLibraryModal={onOpenAddLibraryModal}
        onDeleteLibrary={onDeleteLibrary}
        onBackToMenu={onBackToMenu}
        onDeleteBook={onDeleteBook}
      />
    );

    // Checks title and quantity badge
    expect(screen.getByText('Babička')).toBeDefined();
    expect(screen.getByText('2 ks')).toBeDefined();
    expect(screen.getByText('Čapek a jeho svět')).toBeDefined();

    // Check alphabet side index headers (# for 1984, B for Babička, Č for Čapek)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Č').length).toBeGreaterThan(0);
    expect(screen.getAllByText('#').length).toBeGreaterThan(0);
  });

  it('opens DeleteBookModal when deleting a book with quantity > 1', () => {
    const onDeleteBook = vi.fn();

    render(
      <LibraryView
        books={mockBooks}
        libraries={mockLibraries}
        activeLibraryId="lib1"
        onSelectLibrary={vi.fn()}
        onOpenAddLibraryModal={vi.fn()}
        onDeleteLibrary={vi.fn()}
        onBackToMenu={vi.fn()}
        onDeleteBook={onDeleteBook}
      />
    );

    // Click delete on Babička (quantity: 2)
    const deleteButtons = screen.getAllByTitle('Smazat z knihovny');
    fireEvent.click(deleteButtons[0]);

    // Modal should appear asking whether to decrement or delete all
    expect(screen.getByText('Odebrat knihu')).toBeDefined();
    expect(screen.getByText(/Snížit počet o 1/i)).toBeDefined();
    expect(screen.getByText(/Smazat všechny/i)).toBeDefined();
  });
});
