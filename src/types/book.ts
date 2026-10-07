export interface Library {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Book {
  isbn: string;
  title: string;
  authors?: string;
  publishedYear?: string;
  publisher?: string;
  coverUrl?: string;
  source?: string;
  addedAt: number;
  libraryId: string;
  quantity: number;
}
