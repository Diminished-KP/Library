import { describe, it, expect } from 'vitest';
import { normalizeIsbn, convertIsbn13To10, convertIsbn10To13, fetchBookByIsbn } from './bookService';

describe('bookService', () => {
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

  it('should fetch book details from fallback source for known ISBN', async () => {
    // ISBN 9780140328721 - Fantastic Mr. Fox
    const book = await fetchBookByIsbn('9780140328721');
    expect(book).not.toBeNull();
    if (book) {
      expect(book.title.toLowerCase()).toContain('fox');
      expect(book.isbn).toBe('9780140328721');
    }
  }, 10000);

  it('should return null for non-existent ISBN', async () => {
    const book = await fetchBookByIsbn('1111111111111');
    expect(book).toBeNull();
  }, 10000);
});
