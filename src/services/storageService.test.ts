// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseStoredBooks, parseStoredLibraries, saveToLocalStorage } from './storageService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storageService', () => {
  it('reports whether saving to local storage succeeded', () => {
    expect(saveToLocalStorage('test-key', 'saved value')).toBe(true);
    expect(window.localStorage.getItem('test-key')).toBe('saved value');

    vi.spyOn(window.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError');
    });

    expect(saveToLocalStorage('test-key', 'new value')).toBe(false);
  });

  it('returns an empty collection for malformed or non-array data', () => {
    expect(parseStoredBooks('{invalid')).toEqual([]);
    expect(parseStoredBooks('{"title":"Not an array"}')).toEqual([]);
    expect(parseStoredLibraries('null')).toEqual([]);
  });

  it('keeps valid books, fills missing defaults, and skips invalid entries', () => {
    const books = parseStoredBooks(JSON.stringify([
      { id: 'book-1', title: '  Kniha  ', quantity: 3, readingStatus: 'read' },
      null,
      { id: 'book-2', title: '   ' },
    ]));

    expect(books).toHaveLength(1);
    expect(books[0]).toMatchObject({
      id: 'book-1',
      title: 'Kniha',
      libraryId: 'default',
      quantity: 3,
      readingStatus: 'read',
    });
  });

  it('removes legacy ISBN markers and replaces invalid book defaults', () => {
    const [book] = parseStoredBooks(JSON.stringify([
      { title: 'Bez ISBN', isbn: 'NO_ISBN_123', quantity: 0, readingStatus: 'invalid' },
    ]));

    expect(book.isbn).toBeUndefined();
    expect(book.quantity).toBe(1);
    expect(book.readingStatus).toBe('unread');
  });

  it('skips invalid libraries and normalizes valid ones', () => {
    const libraries = parseStoredLibraries(JSON.stringify([
      { id: 'lib-1', name: '  Oddělení  ' },
      { id: '', name: 'Neplatná' },
      { id: 'lib-2', name: '   ' },
    ]));

    expect(libraries).toEqual([{ id: 'lib-1', name: 'Oddělení', description: undefined, createdAt: 0 }]);
  });
});
