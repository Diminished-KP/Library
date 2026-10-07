import type { Book } from '../types/book';

/**
 * Normalizes ISBN by stripping hyphens, spaces, and non-alphanumeric characters.
 */
export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[-_\s]/g, '').trim();
}

/**
 * Converts ISBN-13 (starting with 978) to ISBN-10.
 */
export function convertIsbn13To10(isbn13: string): string | null {
  if (isbn13.length !== 13 || !isbn13.startsWith('978')) return null;
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(core[i], 10) * (10 - i);
  }
  const remainder = (11 - (sum % 11)) % 11;
  const checkDigit = remainder === 10 ? 'X' : String(remainder);
  return core + checkDigit;
}

/**
 * Converts ISBN-10 to ISBN-13.
 */
export function convertIsbn10To13(isbn10: string): string | null {
  if (isbn10.length !== 10) return null;
  const core = '978' + isbn10.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(core[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const remainder = (10 - (sum % 10)) % 10;
  return core + String(remainder);
}

/**
 * Trims cataloguing punctuation from the end of strings (e.g., "Argo,", "Praha :").
 */
export function cleanCatalogText(str: string | undefined | null): string | undefined {
  if (!str) return undefined;
  const cleaned = str.trim().replace(/[\s,:\/\.\;]+$/, '').trim();
  return cleaned || undefined;
}

/**
 * Strips birth/death years or date ranges from author names (e.g. "Jean de Nostredame, asi 1507-1577" -> "Jean de Nostredame").
 */
export function cleanAuthorName(name: string): string {
  return name.replace(/,\s*(?:asi\s*)?\d{3,4}(?:\s*-\s*\d{0,4})?\??\s*$/, '').trim();
}

/**
 * Parses author names from Knihovny.cz authors object structure.
 */
export function parseAuthors(authorsObj: any): string | undefined {
  if (!authorsObj || typeof authorsObj !== 'object') return undefined;

  const names: string[] = [];

  const processGroup = (group: any) => {
    if (!group) return;
    if (Array.isArray(group)) {
      for (const item of group) {
        if (typeof item === 'string') {
          names.push(cleanAuthorName(item));
        }
      }
    } else if (typeof group === 'object') {
      for (const nameKey of Object.keys(group)) {
        if (nameKey) {
          names.push(cleanAuthorName(nameKey));
        }
      }
    }
  };

  processGroup(authorsObj.primary);

  if (names.length === 0) {
    processGroup(authorsObj.secondary);
    processGroup(authorsObj.corporate);
  }

  return names.length > 0 ? names.join(', ') : undefined;
}

const KNIHOVNY_CZ_FIELDS = [
  'id',
  'title',
  'authors',
  'publishers',
  'placesOfPublication',
  'publicationDates',
  'physicalDescriptions',
  'isbns',
  'issns',
  'cnb',
  'formats',
];

/**
 * Fetch book details from Knihovny.cz API.
 */
async function fetchFromKnihovnyCz(cleanIsbn: string): Promise<Partial<Book> | null> {
  const searchIsbn13 = cleanIsbn.length === 10 ? (convertIsbn10To13(cleanIsbn) || cleanIsbn) : cleanIsbn;

  const p = new URLSearchParams({
    lookfor: searchIsbn13,
    type: 'ISN',
    limit: '10',
  });
  for (const field of KNIHOVNY_CZ_FIELDS) {
    p.append('field[]', field);
  }

  const url = 'https://www.knihovny.cz/api/v1/search?' + p.toString();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const records = data?.records ?? [];
    if (!Array.isArray(records) || records.length === 0) return null;

    // Filter records to find one whose isbns array actually contains searchIsbn13
    const matchedRecord = records.find((rec: any) => {
      if (!Array.isArray(rec.isbns)) return false;
      return rec.isbns.some((rawIsbn: string) => {
        const digits = rawIsbn.replace(/[^0-9X]/gi, '');
        const isbn13 = digits.length === 10 ? convertIsbn10To13(digits) : digits;
        return isbn13 === searchIsbn13 || digits === cleanIsbn;
      });
    });

    if (!matchedRecord) return null;

    const title = cleanCatalogText(matchedRecord.title);
    if (!title) return null;

    const authors = parseAuthors(matchedRecord.authors);

    let publisher: string | undefined = undefined;
    if (Array.isArray(matchedRecord.publishers) && matchedRecord.publishers.length > 0) {
      publisher = matchedRecord.publishers
        .map((pub: string) => cleanCatalogText(pub))
        .filter(Boolean)
        .join(', ');
    }

    let publishedYear: string | undefined = undefined;
    if (Array.isArray(matchedRecord.publicationDates) && matchedRecord.publicationDates.length > 0) {
      const dateStr = String(matchedRecord.publicationDates[0]);
      const yearMatch = dateStr.match(/\d{4}/);
      if (yearMatch) publishedYear = yearMatch[0];
    }

    const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;

    return {
      title,
      authors: authors || undefined,
      publisher: publisher || undefined,
      publishedYear: publishedYear || undefined,
      coverUrl,
      source: 'Knihovny.cz',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch book details from Google Books API.
 */
async function fetchFromGoogleBooks(cleanIsbn: string): Promise<Partial<Book> | null> {
  const queries = [
    `q=isbn:${cleanIsbn}`,
    `q=${cleanIsbn}`,
  ];

  for (const q of queries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${q}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      if (!data.items || data.items.length === 0) continue;

      const volumeInfo = data.items[0].volumeInfo;
      if (!volumeInfo || !volumeInfo.title) continue;

      const title = volumeInfo.title + (volumeInfo.subtitle ? `: ${volumeInfo.subtitle}` : '');
      const authors = Array.isArray(volumeInfo.authors) ? volumeInfo.authors.join(', ') : undefined;
      const publisher = volumeInfo.publisher;
      const publishedDate = volumeInfo.publishedDate;
      let publishedYear: string | undefined = undefined;
      if (publishedDate) {
        const yearMatch = publishedDate.match(/\d{4}/);
        if (yearMatch) publishedYear = yearMatch[0];
      }

      let coverUrl = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
      if (coverUrl) {
        coverUrl = coverUrl.replace(/^http:/, 'https:');
      } else {
        coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
      }

      return {
        title,
        authors,
        publisher,
        publishedYear,
        coverUrl,
        source: 'Google Books',
      };
    } catch {
      // Continue to next query format
    }
  }

  return null;
}

/**
 * Fetch book details from Open Library API.
 */
async function fetchFromOpenLibrary(cleanIsbn: string): Promise<Partial<Book> | null> {
  // Strategy 1: Open Library Books API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const bibKey = `ISBN:${cleanIsbn}`;
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=${bibKey}&format=json&jscmd=data`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const bookData = data[bibKey];
      if (bookData && bookData.title) {
        const title = bookData.title;
        const authors = Array.isArray(bookData.authors)
          ? bookData.authors.map((a: { name: string }) => a.name).join(', ')
          : undefined;
        const publisher = Array.isArray(bookData.publishers)
          ? bookData.publishers.map((p: { name: string }) => p.name).join(', ')
          : undefined;
        const publishDate = bookData.publish_date;
        let publishedYear: string | undefined = undefined;
        if (publishDate) {
          const yearMatch = String(publishDate).match(/\d{4}/);
          if (yearMatch) publishedYear = yearMatch[0];
        }

        let coverUrl = bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small;
        if (!coverUrl) {
          coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
        }

        return {
          title,
          authors,
          publisher,
          publishedYear,
          coverUrl,
          source: 'Open Library',
        };
      }
    }
  } catch {
    // Continue to strategy 2
  }

  // Strategy 2: Open Library Search API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://openlibrary.org/search.json?q=${cleanIsbn}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.docs && data.docs.length > 0) {
        const doc = data.docs[0];
        const title = doc.title;
        if (title) {
          const authors = Array.isArray(doc.author_name) ? doc.author_name.join(', ') : undefined;
          const publisher = Array.isArray(doc.publisher) ? doc.publisher[0] : undefined;
          const publishedYear = doc.first_publish_year ? String(doc.first_publish_year) : undefined;

          let coverUrl: string | undefined = undefined;
          if (doc.cover_i) {
            coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          } else {
            coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
          }

          return {
            title,
            authors,
            publisher,
            publishedYear,
            coverUrl,
            source: 'Open Library',
          };
        }
      }
    }
  } catch {
    // Continue
  }

  return null;
}

/**
 * Main book lookup function.
 * Tries sources in order: Knihovny.cz -> Google Books -> Open Library.
 * Automatically converts input ISBN to ISBN-13.
 */
export async function fetchBookByIsbn(isbn: string): Promise<Book | null> {
  const cleanIsbn = normalizeIsbn(isbn);
  if (!cleanIsbn) return null;

  // Source 1: Knihovny.cz
  let result = await fetchFromKnihovnyCz(cleanIsbn);

  // Source 2: Google Books
  if (!result) {
    result = await fetchFromGoogleBooks(cleanIsbn);
  }

  // Source 3: Open Library
  if (!result) {
    result = await fetchFromOpenLibrary(cleanIsbn);
  }

  if (result && result.title) {
    return {
      isbn: cleanIsbn,
      title: result.title,
      authors: result.authors,
      publishedYear: result.publishedYear,
      publisher: result.publisher,
      coverUrl: result.coverUrl || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`,
      source: result.source,
      addedAt: Date.now(),
      libraryId: 'default',
      quantity: 1,
    };
  }

  return null;
}
