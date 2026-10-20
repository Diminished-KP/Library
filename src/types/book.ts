export interface Library {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export type ReadingStatus = 'unread' | 'reading' | 'read';

export interface Book {
  id?: string;
  isbn: string;
  title: string;
  authors?: string;
  genre?: string;
  readingStatus?: ReadingStatus;
  publishedYear?: string;
  publisher?: string;
  coverUrl?: string;
  source?: string;
  addedAt: number;
  libraryId: string;
  quantity: number;
}
