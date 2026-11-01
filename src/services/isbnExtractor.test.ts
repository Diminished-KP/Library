import { describe, it, expect } from 'vitest';
import { isValidIsbn10, isValidIsbn13, isValidIsbn, extractIsbnsFromText } from './isbnExtractor';

describe('isbnExtractor', () => {
  describe('isValidIsbn10', () => {
    it('validates correct ISBN-10 numbers', () => {
      expect(isValidIsbn10('80-85983-44-3')).toBe(true);
      expect(isValidIsbn10('8085983443')).toBe(true);
      // ISBN ending with X
      expect(isValidIsbn10('0-8044-2957-X')).toBe(true);
    });

    it('rejects invalid ISBN-10 numbers', () => {
      expect(isValidIsbn10('80-85983-44-0')).toBe(false);
      expect(isValidIsbn10('1234567890')).toBe(false);
      expect(isValidIsbn10('abc')).toBe(false);
    });
  });

  describe('isValidIsbn13', () => {
    it('validates correct ISBN-13 numbers', () => {
      // Valid ISBN-13: 978-0-306-40615-7 and 978-80-204-1800-5
      expect(isValidIsbn13('9780306406157')).toBe(true);
      expect(isValidIsbn13('978-80-204-1800-5')).toBe(true);
    });

    it('rejects invalid ISBN-13 checksum or invalid prefix', () => {
      expect(isValidIsbn13('978-80-7203-123-4')).toBe(false); // bad checksum
      expect(isValidIsbn13('9770306406157')).toBe(false); // wrong prefix (977 is ISSN)
      expect(isValidIsbn13('9780306406150')).toBe(false);
    });
  });

  describe('isValidIsbn', () => {
    it('validates both 10 and 13 digit ISBNs', () => {
      expect(isValidIsbn('0-8044-2957-X')).toBe(true);
      expect(isValidIsbn('978-80-204-1800-5')).toBe(true);
      expect(isValidIsbn('invalid')).toBe(false);
    });
  });

  describe('extractIsbnsFromText', () => {
    it('extracts ISBN with prefix "ISBN 978-..."', () => {
      const text = `
        Vydalo nakladatelství Argo v Praze roku 2021.
        ISBN 978-80-204-1800-5 (váz.)
        Vytiskla tiskárna PBtisk Příbram.
      `;
      const result = extractIsbnsFromText(text);
      expect(result).toContain('9788020418005');
    });

    it('extracts multiple ISBNs and deduplicates them', () => {
      const text = `
        ISBN-13: 978-80-204-1800-5 (hardcover)
        ISBN-10: 80-85983-44-3 (paperback)
      `;
      const result = extractIsbnsFromText(text);
      expect(result.length).toBe(2);
      expect(result).toContain('9788020418005');
      expect(result).toContain('8085983443');
    });

    it('extracts standalone 978 ISBN without explicit "ISBN" keyword', () => {
      const text = `
        Číslo publikace 1234
        978-80-204-1800-5
        Cena 399 Kč
      `;
      const result = extractIsbnsFromText(text);
      expect(result).toContain('9788020418005');
    });

    it('prioritizes valid checksum ISBNs first', () => {
      const text = `
        Some code 1234567890123
        Real ISBN 978-80-204-1800-5
      `;
      const result = extractIsbnsFromText(text);
      expect(result[0]).toBe('9788020418005');
    });

    it('returns empty array when no ISBN found in text', () => {
      const text = 'Toto je obyčejný text bez jakéhokoliv čísla nebo kódu.';
      expect(extractIsbnsFromText(text)).toEqual([]);
    });
  });
});
