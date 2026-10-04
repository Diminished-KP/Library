export interface Book {
  isbn: string;
  title: string;
  authors?: string;
  publishedYear?: string;
  publisher?: string;
  source?: string;
  addedAt: number;
}
