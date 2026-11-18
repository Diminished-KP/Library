import type { Book, Library, ReadingStatus } from '../types/book';

const READING_STATUSES: ReadingStatus[] = ['unread', 'reading', 'read'];

function parseArray(value: string | null): unknown[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToLocalStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseStoredBooks(value: string | null): Book[] {
  return parseArray(value).flatMap((entry, index) => {
    if (!isRecord(entry) || typeof entry.title !== 'string' || !entry.title.trim()) return [];

    const rawIsbn = typeof entry.isbn === 'string' ? entry.isbn.trim() : '';
    const isbn = rawIsbn.startsWith('NO_ISBN_') ? undefined : rawIsbn || undefined;
    const status = READING_STATUSES.includes(entry.readingStatus as ReadingStatus)
      ? (entry.readingStatus as ReadingStatus)
      : 'unread';

    return [{
      id: typeof entry.id === 'string' && entry.id
        ? entry.id
        : `book_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      isbn,
      title: entry.title.trim(),
      authors: typeof entry.authors === 'string' ? entry.authors : undefined,
      description: typeof entry.description === 'string' ? entry.description : undefined,
      genre: typeof entry.genre === 'string' ? entry.genre : undefined,
      readingStatus: status,
      publishedYear: typeof entry.publishedYear === 'string' ? entry.publishedYear : undefined,
      publisher: typeof entry.publisher === 'string' ? entry.publisher : undefined,
      coverUrl: typeof entry.coverUrl === 'string' ? entry.coverUrl : undefined,
      source: typeof entry.source === 'string' ? entry.source : undefined,
      addedAt: typeof entry.addedAt === 'number' && Number.isFinite(entry.addedAt) ? entry.addedAt : 0,
      libraryId: typeof entry.libraryId === 'string' && entry.libraryId ? entry.libraryId : 'default',
      quantity: typeof entry.quantity === 'number' && Number.isFinite(entry.quantity) && entry.quantity > 0
        ? entry.quantity
        : 1,
    }];
  });
}

export function parseStoredLibraries(value: string | null): Library[] {
  return parseArray(value).flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !entry.id || typeof entry.name !== 'string' || !entry.name.trim()) {
      return [];
    }

    return [{
      id: entry.id,
      name: entry.name.trim(),
      description: typeof entry.description === 'string' ? entry.description : undefined,
      createdAt: typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt) ? entry.createdAt : 0,
    }];
  });
}
