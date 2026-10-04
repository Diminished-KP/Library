import type { Book } from '../types/book';

/**
 * Normalizes ISBN by stripping hyphens and spaces.
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
 * Fetch book details from Knihovny.cz API.
 */
async function fetchFromKnihovnyCz(cleanIsbn: string): Promise<Partial<Book> | null> {
  const urls = [
    `https://www.knihovny.cz/api/v1/search?q=isbn:${cleanIsbn}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.knihovny.cz/api/v1/search?q=isbn:${cleanIsbn}`)}`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const contentType = res.headers.get('content-type');
      if (contentType && !contentType.includes('json') && !contentType.includes('javascript')) continue;

      const data = await res.json();
      if (!data || !data.documents || data.documents.length === 0) continue;

      const doc = data.documents[0];
      const title = doc.title || doc.title_display;
      if (!title) continue;

      const authors = Array.isArray(doc.author) ? doc.author.join(', ') : doc.author || doc.author_display;
      const publisher = Array.isArray(doc.publisher) ? doc.publisher.join(', ') : doc.publisher;
      const publishedYear = doc.publishDate || doc.year || doc.publishDate_display;

      return {
        title,
        authors: authors || undefined,
        publisher: publisher || undefined,
        publishedYear: publishedYear ? String(publishedYear) : undefined,
        source: 'Knihovny.cz'
      };
    } catch {
      // Continue to next URL
    }
  }

  return null;
}

/**
 * Fetch book details from Google Books API.
 */
async function fetchFromGoogleBooks(cleanIsbn: string): Promise<Partial<Book> | null> {
  const queries = [
    `q=isbn:${cleanIsbn}`,
    `q=${cleanIsbn}`
  ];

  for (const q of queries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${q}`, {
        signal: controller.signal
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

      return {
        title,
        authors,
        publisher,
        publishedYear,
        source: 'Google Books'
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
      signal: controller.signal
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

        return {
          title,
          authors,
          publisher,
          publishedYear,
          source: 'Open Library'
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
      signal: controller.signal
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

          return {
            title,
            authors,
            publisher,
            publishedYear,
            source: 'Open Library'
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
 * Automatically tries both ISBN-13 and ISBN-10 formats.
 */
export async function fetchBookByIsbn(isbn: string): Promise<Book | null> {
  const cleanIsbn = normalizeIsbn(isbn);
  if (!cleanIsbn) return null;

  // Build list of ISBN variants to search (ISBN-13 and ISBN-10)
  const isbnsToTry: string[] = [cleanIsbn];
  if (cleanIsbn.length === 13) {
    const isbn10 = convertIsbn13To10(cleanIsbn);
    if (isbn10) isbnsToTry.push(isbn10);
  } else if (cleanIsbn.length === 10) {
    const isbn13 = convertIsbn10To13(cleanIsbn);
    if (isbn13) isbnsToTry.push(isbn13);
  }

  for (const currentIsbn of isbnsToTry) {
    // Source 1: Knihovny.cz
    let result = await fetchFromKnihovnyCz(currentIsbn);

    // Source 2: Google Books
    if (!result) {
      result = await fetchFromGoogleBooks(currentIsbn);
    }

    // Source 3: Open Library
    if (!result) {
      result = await fetchFromOpenLibrary(currentIsbn);
    }

    if (result && result.title) {
      return {
        isbn: cleanIsbn,
        title: result.title,
        authors: result.authors,
        publishedYear: result.publishedYear,
        publisher: result.publisher,
        source: result.source,
        addedAt: Date.now()
      };
    }
  }

  return null;
}
