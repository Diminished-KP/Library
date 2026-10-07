import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeIsbn,
  convertIsbn13To10,
  convertIsbn10To13,
  cleanCatalogText,
  cleanAuthorName,
  parseAuthors,
  fetchBookByIsbn,
} from './bookService';

const SAMPLE_KNIHOVNY_RESPONSE = {
  resultCount: 1,
  records: [
    {
      id: 'mkp.3521868',
      title: 'Životy slavných a starých provensálských básníků, kteří žili v dobách hrabat z kraje Provença',
      authors: {
        primary: { 'Jean de Nostredame, asi 1507-1577': [] },
        secondary: { 'Josef Prokop, 1971-': [], 'Vojtěch Domlátil, 1979-': [] },
        corporate: [],
      },
      publishers: ['Argo,'],
      placesOfPublication: ['Praha :'],
      publicationDates: ['2011'],
      physicalDescriptions: ['218 s. : il. ; 22 cm'],
      isbns: ['978-80-257-0367-0'],
      issns: [],
      cnb: 'cnb002163342',
      formats: ['0/BOOKS/'],
    },
  ],
  status: 'OK',
};

describe('bookService helpers', () => {
  it('should normalize ISBN correctly', () => {
    expect(normalizeIsbn('978-80-00-05882-5')).toBe('9788000058825');
    expect(normalizeIsbn(' 978 0 14 032872 1 ')).toBe('9780140328721');
  });

  it('should convert ISBN-13 to ISBN-10 correctly', () => {
    expect(convertIsbn13To10('9780140328721')).toBe('0140328726');
  });

  it('should convert ISBN-10 to ISBN-13 correctly', () => {
    expect(convertIsbn10To13('0140328726')).toBe('9780140328721');
  });

  it('should clean catalog text punctuation', () => {
    expect(cleanCatalogText('Argo,')).toBe('Argo');
    expect(cleanCatalogText('Praha :')).toBe('Praha');
    expect(cleanCatalogText('[Praha] :')).toBe('[Praha]');
    expect(cleanCatalogText(undefined)).toBeUndefined();
  });

  it('should clean author names by stripping years/dates', () => {
    expect(cleanAuthorName('Jean de Nostredame, asi 1507-1577')).toBe('Jean de Nostredame');
    expect(cleanAuthorName('Josef Prokop, 1971-')).toBe('Josef Prokop');
    expect(cleanAuthorName('Vojtěch Domlátil, 1979-')).toBe('Vojtěch Domlátil');
    expect(cleanAuthorName('Karel Čapek')).toBe('Karel Čapek');
  });

  it('should parse authors from Knihovny.cz structure', () => {
    const authors = {
      primary: { 'Jean de Nostredame, asi 1507-1577': [] },
      secondary: { 'Josef Prokop, 1971-': [], 'Vojtěch Domlátil, 1979-': [] },
      corporate: [],
    };
    expect(parseAuthors(authors)).toBe('Jean de Nostredame');
  });
});

describe('Knihovny.cz API integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch book from Knihovny.cz using sample response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('knihovny.cz')) {
        return {
          ok: true,
          json: async () => SAMPLE_KNIHOVNY_RESPONSE,
        } as Response;
      }
      return { ok: false } as Response;
    });

    const book = await fetchBookByIsbn('9788025703670');

    expect(fetchSpy).toHaveBeenCalled();
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://www.knihovny.cz/api/v1/search');
    expect(calledUrl).toContain('lookfor=9788025703670');
    expect(calledUrl).toContain('type=ISN');
    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('field%5B%5D=id');

    expect(book).not.toBeNull();
    if (book) {
      expect(book.title).toBe(
        'Životy slavných a starých provensálských básníků, kteří žili v dobách hrabat z kraje Provença'
      );
      expect(book.authors).toBe('Jean de Nostredame');
      expect(book.publisher).toBe('Argo');
      expect(book.publishedYear).toBe('2011');
      expect(book.source).toBe('Knihovny.cz');
    }
  });

  it('should handle ISBN-10 input by converting to ISBN-13 for Knihovny.cz search', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('knihovny.cz')) {
        return {
          ok: true,
          json: async () => SAMPLE_KNIHOVNY_RESPONSE,
        } as Response;
      }
      return { ok: false } as Response;
    });

    // 80-257-0367-1 is ISBN-10 for 978-80-257-0367-0
    const book = await fetchBookByIsbn('8025703671');

    expect(fetchSpy).toHaveBeenCalled();
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('lookfor=9788025703670');

    expect(book).not.toBeNull();
    if (book) {
      expect(book.source).toBe('Knihovny.cz');
    }
  });

  it('should handle empty records (HTTP 200 with resultCount 0) correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('knihovny.cz')) {
        return {
          ok: true,
          json: async () => ({ resultCount: 0, status: 'OK' }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    const book = await fetchBookByIsbn('9788025703670');
    expect(book).toBeNull();
  });

  it('should return null when records do not match search ISBN', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('knihovny.cz')) {
        return {
          ok: true,
          json: async () => ({
            resultCount: 1,
            records: [
              {
                id: 'other.123',
                title: 'Jiná kniha',
                isbns: ['978-80-999-9999-9'],
              },
            ],
            status: 'OK',
          }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    const book = await fetchBookByIsbn('9788025703670');
    expect(book).toBeNull();
  });
});
