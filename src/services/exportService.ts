import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Book } from '../types/book';

/**
 * Export books to PDF table.
 */
export function exportToPdf(books: Book[], filename = 'knihovna.pdf') {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Seznam knih', 14, 20);

  doc.setFontSize(10);
  doc.text(`Celkem knih: ${books.length}`, 14, 27);

  const tableData = books.map((b) => [
    b.title || '',
    b.authors || '',
    b.isbn || '',
    b.publishedYear || '',
    b.publisher || '',
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['Název', 'Autor', 'ISBN', 'Rok', 'Nakladatelství']],
    body: tableData,
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(filename);
}

/**
 * Export books to Excel (.xlsx) file.
 */
export function exportToExcel(books: Book[], filename = 'knihovna.xlsx') {
  const data = books.map((b) => ({
    'Název': b.title,
    'Autor': b.authors || '',
    'ISBN': b.isbn,
    'Rok vydání': b.publishedYear || '',
    'Nakladatelství': b.publisher || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Knihy');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export books to CSV (.csv) file (compatible with Google Sheets & Excel).
 */
export function exportToCsv(books: Book[], filename = 'knihovna.csv') {
  const data = books.map((b) => ({
    'Název': b.title,
    'Autor': b.authors || '',
    'ISBN': b.isbn,
    'Rok vydání': b.publishedYear || '',
    'Nakladatelství': b.publisher || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
