import { describe, it, expect, vi } from 'vitest';
import { exportToPdf, exportToExcel, exportToCsv } from './exportService';
import type { Book } from '../types/book';

vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        setFontSize: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
      };
    }),
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn().mockReturnValue({}),
    book_new: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
    sheet_to_csv: vi.fn().mockReturnValue('Název,Autor\nTest,Autor Test'),
  },
  writeFile: vi.fn(),
}));

describe('exportService', () => {
  const sampleBooks: Book[] = [
    {
      isbn: '9788000058825',
      title: 'Babička',
      authors: 'Božena Němcová',
      publishedYear: '1855',
      publisher: 'Albatros',
      addedAt: Date.now(),
    },
  ];

  it('should call PDF export without errors', () => {
    expect(() => exportToPdf(sampleBooks)).not.toThrow();
  });

  it('should call Excel export without errors', () => {
    expect(() => exportToExcel(sampleBooks)).not.toThrow();
  });

  it('should call CSV export without errors', () => {
    expect(() => exportToCsv(sampleBooks)).not.toThrow();
  });
});
