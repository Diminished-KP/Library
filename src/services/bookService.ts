import type { Book } from '../types/book';

/**
 * Normalizes ISBN by stripping hyphens and spaces.
 */
export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[-_\s]/g, '').trim();
}

/**
 * Fetch book details from Knihovny.cz API.
 */
async function fetchFromKnihovnyCz(cleanIsbn: string): Promise<Partial<Book> | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://www.knihovny.cz/api/v1/search?q=isbn:${cleanIsbn}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;

    const data = await res.json();
    if (!data || !data.documents || data.documents.length === 0) return null;

    const doc = data.documents[0];
    const title = doc.title || doc.title_display;
    if (!title) return null;

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
  } catch (err) {
    console.warn('Knihovny.cz fetch failed or timed out:', err);
    return null;
  }
}

/**
 * Fetch book details from Google Books API.
 */
async function fetchFromGoogleBooks(cleanIsbn: string): Promise<Partial<Book> | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const volumeInfo = data.items[0].volumeInfo;
    if (!volumeInfo || !volumeInfo.title) return null;

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
  } catch (err) {
    console.warn('Google Books fetch failed:', err);
    return null;
  }
}

/**
 * Fetch book details from Open Library API.
 */
async function fetchFromOpenLibrary(cleanIsbn: string): Promise<Partial<Book> | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const bibKey = `ISBN:${cleanIsbn}`;
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=${bibKey}&format=json&jscmd=data`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const bookData = data[bibKey];
    if (!bookData || !bookData.title) return null;

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
  } catch (err) {
    console.warn('Open Library fetch failed:', err);
    return null;
  }
}

/**
 * Main book lookup function.
 * Tries sources in order: Knihovny.cz -> Google Books -> Open Library.
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

  if (!result || !result.title) {
    return null;
  }

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
