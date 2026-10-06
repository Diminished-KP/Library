import { useState, useEffect } from 'react';
import type { Book } from './types/book';
import { fetchBookByIsbn, normalizeIsbn } from './services/bookService';
import { MainMenu } from './components/MainMenu';
import { ScannerComponent } from './components/Scanner';
import { ManualEntryModal } from './components/ManualEntryModal';
import { BookPreviewModal } from './components/BookPreviewModal';
import { BatchReviewModal } from './components/BatchReviewModal';
import { LibraryView } from './components/LibraryView';
import { ArrowLeft, Loader2, Info } from 'lucide-react';

type View = 'menu' | 'scanner' | 'library';

const STORAGE_KEY = 'knihovna_books';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('menu');
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchBooks, setBatchBooks] = useState<Book[]>([]);
  const [isBatchReviewOpen, setIsBatchReviewOpen] = useState(false);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [resumeTrigger, setResumeTrigger] = useState(0);

  // Sync books with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save books to localStorage', e);
    }
  }, [books]);

  // Show floating notification message
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleIsbnProcess = async (rawIsbn: string) => {
    const cleanIsbn = normalizeIsbn(rawIsbn);
    if (!cleanIsbn) return;

    // Check if book already exists in library
    const existingInLibrary = books.find((b) => b.isbn === cleanIsbn);
    if (existingInLibrary) {
      showNotification('Tato kniha už je ve vaší knihovně.');
      return;
    }

    if (isBatchMode) {
      // Check if book is already in current batch
      const existingInBatch = batchBooks.find((b) => b.isbn === cleanIsbn);
      if (existingInBatch) {
        showNotification('Tato kniha už je v seznamu naskenovaných.');
        return;
      }

      setIsLoading(true);
      try {
        const book = await fetchBookByIsbn(cleanIsbn);
        setIsLoading(false);

        if (!book) {
          showNotification(`Číslo ISBN (${cleanIsbn}) nebylo nalezeno.`);
          return;
        }

        setBatchBooks((prev) => [book, ...prev]);
        showNotification(`Naskenováno: ${book.title}`);
      } catch (err) {
        setIsLoading(false);
        console.error('Error fetching book in batch:', err);
        showNotification(`Číslo ISBN (${cleanIsbn}) nebylo nalezeno.`);
      }
    } else {
      // Single scan mode
      setIsLoading(true);
      try {
        const book = await fetchBookByIsbn(cleanIsbn);
        setIsLoading(false);

        if (!book) {
          alert('Číslo ISBN nebo čárový kód nebylo nalezeno.');
          setResumeTrigger((prev) => prev + 1);
          return;
        }

        setScannedBook(book);
      } catch (err) {
        setIsLoading(false);
        console.error('Error fetching book:', err);
        alert('Číslo ISBN nebo čárový kód nebylo nalezeno.');
        setResumeTrigger((prev) => prev + 1);
      }
    }
  };

  const handleAddBook = () => {
    if (scannedBook) {
      setBooks((prev) => [scannedBook, ...prev]);
      setScannedBook(null);
      showNotification('Kniha byla úspěšně přidána do knihovny.');
      setResumeTrigger((prev) => prev + 1);
    }
  };

  const handleDiscardBook = () => {
    setScannedBook(null);
    setResumeTrigger((prev) => prev + 1);
  };

  const handleDeleteBook = (isbn: string) => {
    setBooks((prev) => prev.filter((b) => b.isbn !== isbn));
    showNotification('Kniha byla smazána z knihovny.');
  };

  const handleFinishBatch = () => {
    if (batchBooks.length === 0) {
      showNotification('Zatím nebyly naskenovány žádné nové knihy.');
      return;
    }
    setIsBatchReviewOpen(true);
  };

  const handleSaveAllBatch = () => {
    if (batchBooks.length > 0) {
      const addedCount = batchBooks.length;
      setBooks((prev) => [...batchBooks, ...prev]);
      setBatchBooks([]);
      setIsBatchReviewOpen(false);
      showNotification(`Přidáno ${addedCount} knih do knihovny.`);
      setCurrentView('library');
    }
  };

  const handleRemoveFromBatch = (isbn: string) => {
    setBatchBooks((prev) => prev.filter((b) => b.isbn !== isbn));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner / Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 bg-blue-900/90 border border-blue-500 text-blue-100 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between text-sm font-medium animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-3" />
          <p className="text-slate-200 font-medium text-sm">Vyhledávám informace o knize...</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {currentView === 'menu' && (
          <MainMenu
            onNavigateToScanner={() => setCurrentView('scanner')}
            onNavigateToLibrary={() => setCurrentView('library')}
            bookCount={books.length}
          />
        )}

        {currentView === 'scanner' && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-lg flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView('menu')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-100 font-medium px-3 py-2 rounded-xl hover:bg-slate-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Hlavní menu</span>
              </button>
              <h2 className="text-lg font-bold text-slate-200">Skener ISBN</h2>
            </div>

            <ScannerComponent
              isBatchMode={isBatchMode}
              onToggleBatchMode={setIsBatchMode}
              batchCount={batchBooks.length}
              onScanSuccess={(isbn) => handleIsbnProcess(isbn)}
              onOpenManualEntry={() => setIsManualModalOpen(true)}
              onFinishBatch={handleFinishBatch}
              resumeTrigger={resumeTrigger}
            />
          </div>
        )}

        {currentView === 'library' && (
          <LibraryView
            books={books}
            onBackToMenu={() => setCurrentView('menu')}
            onDeleteBook={handleDeleteBook}
          />
        )}
      </main>

      {/* Manual ISBN Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={(isbn) => {
          setIsManualModalOpen(false);
          handleIsbnProcess(isbn);
        }}
      />

      {/* Book Preview Modal (Single Scan) */}
      <BookPreviewModal
        book={scannedBook}
        onAdd={handleAddBook}
        onDiscard={handleDiscardBook}
      />

      {/* Batch Review Modal (Batch Scan) */}
      <BatchReviewModal
        isOpen={isBatchReviewOpen}
        books={batchBooks}
        onRemoveBook={handleRemoveFromBatch}
        onSaveAll={handleSaveAllBatch}
        onDiscardAll={() => setIsBatchReviewOpen(false)}
      />
    </div>
  );
}
