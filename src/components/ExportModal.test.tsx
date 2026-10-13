// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from './ExportModal';
import { translations } from '../services/i18n';
import type { Book } from '../types/book';

// Mock exportService functions
vi.mock('../services/exportService', () => ({
  exportToPdf: vi.fn(),
  exportToExcel: vi.fn(),
  exportToCsv: vi.fn(),
}));

import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';

const mockBooks: Book[] = [
  {
    isbn: '9788025703670',
    title: 'Test Book 1',
    authors: 'Test Author',
    publishedYear: '2020',
    publisher: 'Test Publisher',
    addedAt: Date.now(),
    libraryId: 'default',
    quantity: 1,
  },
];

describe('ExportModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ExportModal isOpen={false} onClose={vi.fn()} books={mockBooks} t={translations.cs} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content and triggers export options when clicked', () => {
    const onClose = vi.fn();
    render(<ExportModal isOpen={true} onClose={onClose} books={mockBooks} t={translations.cs} />);

    expect(screen.getByText('Exportovat knihovnu')).toBeDefined();

    const pdfBtn = screen.getByText('PDF Dokument');
    fireEvent.click(pdfBtn);
    expect(exportToPdf).toHaveBeenCalledWith(mockBooks);
    expect(onClose).toHaveBeenCalled();

    const excelBtn = screen.getByText('Excel (.xlsx)');
    fireEvent.click(excelBtn);
    expect(exportToExcel).toHaveBeenCalledWith(mockBooks);

    const csvBtn = screen.getByText('CSV / Google Sheets');
    fireEvent.click(csvBtn);
    expect(exportToCsv).toHaveBeenCalledWith(mockBooks);
  });
});
