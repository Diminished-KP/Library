// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LibraryView } from './LibraryView';
import { translations } from '../services/i18n';
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
    const onNavigateToScanner = vi.fn();
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
        onNavigateToScanner={onNavigateToScanner}
        onDeleteBook={onDeleteBook}
        t={translations.cs}
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

  it('filters books by genre and author', () => {
    const booksWithGenre: Book[] = [
      {
        isbn: '111',
        title: 'Duna',
        authors: 'Frank Herbert',
        genre: 'Sci-Fi',
        libraryId: 'lib1',
        quantity: 1,
        addedAt: 1,
      },
      {
        isbn: '222',
        title: 'Sherlock Holmes',
        authors: 'Arthur Conan Doyle',
        genre: 'Detektivka',
        libraryId: 'lib1',
        quantity: 1,
        addedAt: 2,
      },
    ];

    render(
      <LibraryView
        books={booksWithGenre}
        libraries={mockLibraries}
        activeLibraryId="lib1"
        onSelectLibrary={vi.fn()}
        onOpenAddLibraryModal={vi.fn()}
        onDeleteLibrary={vi.fn()}
        onBackToMenu={vi.fn()}
        onNavigateToScanner={vi.fn()}
        onDeleteBook={vi.fn()}
        t={translations.cs}
      />
    );

    expect(screen.getByText('Duna')).toBeDefined();
    expect(screen.getByText('Sherlock Holmes')).toBeDefined();

    // Filter by genre 'Sci-Fi'
    const selects = screen.getAllByRole('combobox');
    const genreSelect = selects.find((s) =>
      Array.from(s.querySelectorAll('option')).some((opt) => opt.value === 'Sci-Fi')
    )!;
    fireEvent.change(genreSelect, { target: { value: 'Sci-Fi' } });

    expect(screen.getByText('Duna')).toBeDefined();
    expect(screen.queryByText('Sherlock Holmes')).toBeNull();
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
        onNavigateToScanner={vi.fn()}
        onDeleteBook={onDeleteBook}
        t={translations.cs}
      />
    );

    // Babička has quantity 2, find delete button for Babička
    const babickaHeadings = screen.getAllByText('Babička');
    const babickaCard = babickaHeadings[0].closest('.group')!;
    const deleteButton = babickaCard.querySelector('button[title="Smazat z knihovny"]')!;
    fireEvent.click(deleteButton);

    // Modal should appear asking whether to decrement or delete all
    expect(screen.getAllByText('Odstranit knihu').length).toBeGreaterThan(0);
    expect(screen.getByText(/Odebrat 1 kus/i)).toBeDefined();
    expect(screen.getByText(/Smazat všechny kusy/i)).toBeDefined();
  });
});
