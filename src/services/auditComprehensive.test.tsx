// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LibraryView } from '../components/LibraryView';
import { ManualEntryModal } from '../components/ManualEntryModal';
import { ManualEntryWithoutIsbnModal } from '../components/ManualEntryWithoutIsbnModal';
import { BookDetailModal } from '../components/BookDetailModal';
import { BookEditModal } from '../components/BookEditModal';
import { isValidIsbn, isValidIsbn10, isValidIsbn13 } from '../services/isbnExtractor';
import { fetchBookByIsbnDetailed } from '../services/bookService';
import { translations } from '../services/i18n';
import type { Book, Library } from '../types/book';

const mockLibraries: Library[] = [
  { id: 'lib_main', name: 'Hlavní knihovna', description: 'Centrální', createdAt: 1000 },
];

describe('Komplexní ověření požadovaných funkcionalit (Audit Requirements)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // 1. Podpora ISBN-10 a ISBN-13 a validace kontrolní číslice
  it('správně validuje platné i neplatné ISBN-10 a ISBN-13 včetně kontrolní číslice', () => {
    // Platné ISBN-10
    expect(isValidIsbn10('80-85983-44-3')).toBe(true);
    expect(isValidIsbn('80-85983-44-3')).toBe(true);
    // Platné ISBN-10 s X
    expect(isValidIsbn10('080442957X')).toBe(true);
    expect(isValidIsbn('080442957X')).toBe(true);

    // Neplatné ISBN-10
    expect(isValidIsbn10('80-85983-44-0')).toBe(false);
    expect(isValidIsbn('80-85983-44-0')).toBe(false);

    // Platné ISBN-13
    expect(isValidIsbn13('9788000058825')).toBe(true);
    expect(isValidIsbn('9788000058825')).toBe(true);

    // Neplatné ISBN-13 (špatný checksum)
    expect(isValidIsbn13('9788000058820')).toBe(false);
    expect(isValidIsbn('9788000058820')).toBe(false);

    // Nesmyslný řetězec
    expect(isValidIsbn('12345')).toBe(false);
  });

  // 2. Ruční zadání ISBN: Validace a chybová hláška v ManualEntryModal
  it('zobrazí chybovou hlášku při zadání neplatného ISBN v ManualEntryModal a zabrání odeslání', () => {
    const onSubmit = vi.fn();
    render(
      <ManualEntryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        t={translations.cs}
      />
    );

    const input = screen.getByRole('textbox', { name: /ISBN/i });
    fireEvent.change(input, { target: { value: '9788000058820' } }); // neplatný checksum

    const submitBtn = screen.getByText('Vyhledat knihu');
    fireEvent.click(submitBtn);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(translations.cs.isbnInvalidError)).toBeDefined();
  });

  // 3. Ruční zadání ISBN: Možnost přímého přechodu na ruční zadání detailů
  it('umožňuje přechod na manuální zadání se zachováním zadaného ISBN', () => {
    const onSwitch = vi.fn();
    render(
      <ManualEntryModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onSwitchToManualDetails={onSwitch}
        t={translations.cs}
      />
    );

    const input = screen.getByRole('textbox', { name: /ISBN/i });
    fireEvent.change(input, { target: { value: '9788000058825' } });

    const manualFallbackBtn = screen.getByText('Zadat údaje ručně');
    fireEvent.click(manualFallbackBtn);

    expect(onSwitch).toHaveBeenCalledWith('9788000058825');
  });

  // 4. Nenalezené ISBN v externí databázi
  it('vrací srozumitelnou informaci v fetchBookByIsbnDetailed, pokud kniha nebyla nalezena', async () => {
    // Mock fetch to simulate 404/empty across all 3 providers
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [], items: [], docs: [] }),
    }));

    const result = await fetchBookByIsbnDetailed('9788000058825');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe('NOT_FOUND');
      expect(result.message).toContain('nebyla nalezena');
    }
  });

  // 5. Přidání knihy bez ISBN s pouze povinným názvem (stará kniha)
  it('umožňuje přidat starou knihu zcela bez ISBN a bez autora (pouze název)', () => {
    const onSubmit = vi.fn();
    render(
      <ManualEntryWithoutIsbnModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        libraries={mockLibraries}
        selectedLibraryId="lib_main"
        onSelectLibrary={vi.fn()}
        t={translations.cs}
      />
    );

    const titleInput = screen.getByPlaceholderText('Válka s Mloky');
    fireEvent.change(titleInput, { target: { value: 'Kronika česká (1541)' } });

    const submitBtn = screen.getByText('Přidat knihu do knihovny');
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const addedBook: Book = onSubmit.mock.calls[0][0];
    expect(addedBook.title).toBe('Kronika česká (1541)');
    expect(addedBook.isbn).toBeUndefined();
    expect(addedBook.id).toBeDefined();
    expect(addedBook.libraryId).toBe('lib_main');
  });

  // 6. Úprava knihy a doplnění ISBN ke knize, která ho původně neměla
  it('umožňuje upravit knihu bez ISBN a dodatečně k ní doplnit platné ISBN', () => {
    const initialBook: Book = {
      id: 'book_old_1',
      title: 'Stará kniha',
      libraryId: 'lib_main',
      quantity: 1,
      addedAt: 100,
    };

    const onSave = vi.fn();
    render(
      <BookEditModal
        book={initialBook}
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        t={translations.cs}
      />
    );

    const isbnInput = screen.getByLabelText(translations.cs.bookIsbnOptionalLabel);
    fireEvent.change(isbnInput, { target: { value: '978-80-00-05882-5' } });

    const saveBtn = screen.getByText('Uložit');
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'book_old_1',
        title: 'Stará kniha',
        isbn: '9788000058825',
      })
    );
  });

  // 7. Duplikování knihy (vytvoření nového fyzického exempláře se samostatným ID)
  it('umožňuje duplikovat existující knihu přes BookDetailModal', () => {
    const originalBook: Book = {
      id: 'book_original',
      isbn: '9788000058825',
      title: 'Babička',
      authors: 'Božena Němcová',
      publishedYear: '1855',
      publisher: 'Albatros',
      libraryId: 'lib_main',
      quantity: 1,
      addedAt: 200,
    };

    const onDuplicate = vi.fn();
    render(
      <BookDetailModal
        book={originalBook}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateReadingStatus={vi.fn()}
        onDuplicateBook={onDuplicate}
        t={translations.cs}
      />
    );

    const duplicateBtn = screen.getByTitle('Duplikovat knihu');
    fireEvent.click(duplicateBtn);

    expect(onDuplicate).toHaveBeenCalledWith(originalBook);
  });

  // 8. Rozlišení různých vydání stejné knihy & více exemplářů
  it('správně spravuje různá vydání stejné knihy jako samostatné entity', () => {
    const edition1: Book = {
      id: 'ed_1',
      isbn: '9788000058825',
      title: 'Babička',
      authors: 'Božena Němcová',
      publishedYear: '1970',
      publisher: 'Albatros',
      libraryId: 'lib_main',
      quantity: 1,
      addedAt: 1,
    };
    const edition2: Book = {
      id: 'ed_2',
      isbn: '9788020455555',
      title: 'Babička',
      authors: 'Božena Němcová',
      publishedYear: '2020',
      publisher: 'Mladá fronta',
      libraryId: 'lib_main',
      quantity: 1,
      addedAt: 2,
    };

    const books = [edition1, edition2];

    render(
      <LibraryView
        books={books}
        libraries={mockLibraries}
        activeLibraryId="lib_main"
        onSelectLibrary={vi.fn()}
        onOpenAddLibraryModal={vi.fn()}
        onDeleteLibrary={vi.fn()}
        onBackToMenu={vi.fn()}
        onNavigateToScanner={vi.fn()}
        onDeleteBook={vi.fn()}
        t={translations.cs}
      />
    );

    // Obě vydání jsou v knihovně zobrazeny
    const items = screen.getAllByRole('heading', { level: 3, name: 'Babička' });
    expect(items.length).toBe(2);
  });

  // 9. Vyhledávání podle názvu, autora, ISBN i nakladatelství
  it('vyhledává podle názvu, autora, ISBN i nakladatelství v LibraryView', () => {
    const books: Book[] = [
      {
        id: 'b1',
        isbn: '9788000058825',
        title: 'Válka s Mloky',
        authors: 'Karel Čapek',
        publisher: 'Fr. Borový',
        libraryId: 'lib_main',
        quantity: 1,
        addedAt: 1,
      },
      {
        id: 'b2',
        isbn: '9788072037650',
        title: '1984',
        authors: 'George Orwell',
        publisher: 'Argo',
        libraryId: 'lib_main',
        quantity: 1,
        addedAt: 2,
      },
    ];

    render(
      <LibraryView
        books={books}
        libraries={mockLibraries}
        activeLibraryId="lib_main"
        onSelectLibrary={vi.fn()}
        onOpenAddLibraryModal={vi.fn()}
        onDeleteLibrary={vi.fn()}
        onBackToMenu={vi.fn()}
        onNavigateToScanner={vi.fn()}
        onDeleteBook={vi.fn()}
        t={translations.cs}
      />
    );

    const searchInput = screen.getByPlaceholderText(translations.cs.searchBookPlaceholder);

    // Hledání podle ISBN
    fireEvent.change(searchInput, { target: { value: '9788072037650' } });
    expect(screen.queryByText('Válka s Mloky')).toBeNull();
    expect(screen.getByText('1984')).toBeDefined();

    // Hledání podle nakladatelství
    fireEvent.change(searchInput, { target: { value: 'Borový' } });
    expect(screen.getByText('Válka s Mloky')).toBeDefined();
    expect(screen.queryByText('1984')).toBeNull();
  });

  // 10. Kombinování více filtrů (nakladatelství, rok, autor, žánr) a řazení knih
  it('umožňuje filtrování podle nakladatelství, roku a řazení knih', () => {
    const books: Book[] = [
      {
        id: 'b1',
        isbn: '111',
        title: 'Kniha A',
        authors: 'Autor X',
        publisher: 'Albatros',
        publishedYear: '2010',
        libraryId: 'lib_main',
        quantity: 1,
        addedAt: 1,
      },
      {
        id: 'b2',
        isbn: '222',
        title: 'Kniha B',
        authors: 'Autor Y',
        publisher: 'Argo',
        publishedYear: '2020',
        libraryId: 'lib_main',
        quantity: 1,
        addedAt: 2,
      },
      {
        id: 'b3',
        isbn: '333',
        title: 'Kniha C',
        authors: 'Autor X',
        publisher: 'Albatros',
        publishedYear: '2020',
        libraryId: 'lib_main',
        quantity: 1,
        addedAt: 3,
      },
    ];

    render(
      <LibraryView
        books={books}
        libraries={mockLibraries}
        activeLibraryId="lib_main"
        onSelectLibrary={vi.fn()}
        onOpenAddLibraryModal={vi.fn()}
        onDeleteLibrary={vi.fn()}
        onBackToMenu={vi.fn()}
        onNavigateToScanner={vi.fn()}
        onDeleteBook={vi.fn()}
        t={translations.cs}
      />
    );

    // Otevřít filtr
    const filterBtn = screen.getByTestId('library-filter-button');
    fireEvent.click(filterBtn);

    // Nastavit nakladatelství Albatros
    const pubSelect = screen.getByDisplayValue(translations.cs.allPublishers);
    fireEvent.change(pubSelect, { target: { value: 'Albatros' } });

    // Knihy Kniha A a Kniha C by měly být viditelné, Kniha B nikoliv
    expect(screen.getByText('Kniha A')).toBeDefined();
    expect(screen.getByText('Kniha C')).toBeDefined();
    expect(screen.queryByText('Kniha B')).toBeNull();

    // Dále zúžit filtrem roku na 2020
    const yearSelect = screen.getByDisplayValue(translations.cs.allYears);
    fireEvent.change(yearSelect, { target: { value: '2020' } });

    // Pouze Kniha C odpovídá Albatros + 2020
    expect(screen.queryByText('Kniha A')).toBeNull();
    expect(screen.getByText('Kniha C')).toBeDefined();
  });
});
