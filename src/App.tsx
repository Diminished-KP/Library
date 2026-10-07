import { useState, useEffect } from 'react';
import type { Book, Library } from './types/book';
import { fetchBookByIsbn, normalizeIsbn } from './services/bookService';
import { MainMenu } from './components/MainMenu';
import { ScannerComponent } from './components/Scanner';
import { ManualEntryModal } from './components/ManualEntryModal';
import { BookPreviewModal } from './components/BookPreviewModal';
import { BatchReviewModal } from './components/BatchReviewModal';
import { LibraryView } from './components/LibraryView';
import { AddLibraryModal } from './components/AddLibraryModal';
import { ArrowLeft, Loader2, Info } from 'lucide-react';

type View = 'menu' | 'scanner' | 'library';

const STORAGE_KEY_BOOKS = 'knihovna_books';
const STORAGE_KEY_LIBRARIES = 'knihovna_libraries';

const DEFAULT_LIBRARY: Library = {
  id: 'default',
  name: 'Moje knihovna',
  description: 'Hlavní knihovna',
  createdAt: Date.now(),
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('menu');

  const [libraries, setLibraries] = useState<Library[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIBRARIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse libraries from localStorage', e);
    }
    return [DEFAULT_LIBRARY];
  });

  const [activeLibraryId, setActiveLibraryId] = useState<string>(() => libraries[0]?.id || 'default');

  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKS);
      if (saved) {
        const parsed: Book[] = JSON.parse(saved);
        return parsed.map((b) => ({
          ...b,
          libraryId: b.libraryId || 'default',
          quantity: typeof b.quantity === 'number' ? b.quantity : 1,
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchBooks, setBatchBooks] = useState<Book[]>([]);
  const [isBatchReviewOpen, setIsBatchReviewOpen] = useState(false);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAddLibraryModalOpen, setIsAddLibraryModalOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [resumeTrigger, setResumeTrigger] = useState(0);

  // Sync books with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save books to localStorage', e);
    }
  }, [books]);

  // Sync libraries with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LIBRARIES, JSON.stringify(libraries));
    } catch (e) {
      console.error('Failed to save libraries to localStorage', e);
    }
  }, [libraries]);

  const handleAddLibrary = (name: string, description: string) => {
    const newLib: Library = {
      id: 'lib_' + Date.now(),
      name,
      description,
      createdAt: Date.now(),
    };
    setLibraries((prev) => [...prev, newLib]);
    setActiveLibraryId(newLib.id);
    showNotification(`Knihovna "${name}" byla úspěšně vytvořena.`);
  };

  const handleDeleteLibrary = (libraryId: string) => {
    if (libraries.length <= 1) {
      alert('Nelze smazat jedinou zbývající knihovnu.');
      return;
    }
    const target = libraries.find((l) => l.id === libraryId);
    if (confirm(`Opravdu chcete smazat knihovnu "${target?.name}" včetně všech jejích knih?`)) {
      setBooks((prev) => prev.filter((b) => b.libraryId !== libraryId));
      setLibraries((prev) => prev.filter((l) => l.id !== libraryId));
      const remaining = libraries.filter((l) => l.id !== libraryId);
      setActiveLibraryId(remaining[0]?.id || 'default');
      showNotification('Knihovna byla smazána.');
    }
  };

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

    const existingInLibrary = books.find(
      (b) => b.isbn === cleanIsbn && b.libraryId === activeLibraryId
    );

    if (isBatchMode) {
      const existingInBatch = batchBooks.find((b) => b.isbn === cleanIsbn);
      if (existingInBatch) {
        setBatchBooks((prev) =>
          prev.map((b) =>
            b.isbn === cleanIsbn ? { ...b, quantity: (b.quantity || 1) + 1 } : b
          )
        );
        showNotification(`Zvýšen počet u naskenované knihy: ${existingInBatch.title}`);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedBook = await fetchBookByIsbn(cleanIsbn);
        setIsLoading(false);

        if (!fetchedBook) {
          showNotification(`Číslo ISBN (${cleanIsbn}) nebylo nalezeno.`);
          return;
        }

        const bookToAdd: Book = {
          ...fetchedBook,
          libraryId: activeLibraryId,
          quantity: 1,
        };

        setBatchBooks((prev) => [bookToAdd, ...prev]);
        showNotification(`Naskenováno: ${bookToAdd.title}`);
      } catch (err) {
        setIsLoading(false);
        console.error('Error fetching book in batch:', err);
        showNotification(`Číslo ISBN (${cleanIsbn}) nebylo nalezeno.`);
      }
    } else {
      // Single scan mode
      setIsLoading(true);
      try {
        const fetchedBook = await fetchBookByIsbn(cleanIsbn);
        setIsLoading(false);

        if (!fetchedBook) {
          alert('Číslo ISBN nebo čárový kód nebylo nalezeno.');
          setResumeTrigger((prev) => prev + 1);
          return;
        }

        const bookToAdd: Book = {
          ...fetchedBook,
          libraryId: activeLibraryId,
          quantity: existingInLibrary ? existingInLibrary.quantity + 1 : 1,
        };

        setScannedBook(bookToAdd);
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
      setBooks((prev) => {
        const existingIdx = prev.findIndex(
          (b) => b.isbn === scannedBook.isbn && b.libraryId === scannedBook.libraryId
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + 1,
          };
          return updated;
        }
        return [{ ...scannedBook, quantity: 1 }, ...prev];
      });
      setScannedBook(null);
      showNotification('Kniha byla úspěšně přidána do knihovny.');
      setResumeTrigger((prev) => prev + 1);
    }
  };

  const handleDiscardBook = () => {
    setScannedBook(null);
    setResumeTrigger((prev) => prev + 1);
  };

  const handleDeleteBook = (isbn: string, libraryId: string, removeAll: boolean) => {
    setBooks((prev) => {
      const existing = prev.find((b) => b.isbn === isbn && b.libraryId === libraryId);
      if (!existing) return prev;

      if (removeAll || existing.quantity <= 1) {
        return prev.filter((b) => !(b.isbn === isbn && b.libraryId === libraryId));
      } else {
        return prev.map((b) =>
          b.isbn === isbn && b.libraryId === libraryId
            ? { ...b, quantity: b.quantity - 1 }
            : b
        );
      }
    });
    showNotification(removeAll ? 'Kniha byla smazána z knihovny.' : 'Počet kusů byl snížen o 1.');
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
      setBooks((prev) => {
        let updated = [...prev];
        batchBooks.forEach((batchBook) => {
          const idx = updated.findIndex(
            (b) => b.isbn === batchBook.isbn && b.libraryId === batchBook.libraryId
          );
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              quantity: updated[idx].quantity + (batchBook.quantity || 1),
            };
          } else {
            updated = [{ ...batchBook, quantity: batchBook.quantity || 1 }, ...updated];
          }
        });
        return updated;
      });

      const totalQuantity = batchBooks.reduce((acc, b) => acc + (b.quantity || 1), 0);
      setBatchBooks([]);
      setIsBatchReviewOpen(false);
      showNotification(`Přidáno ${totalQuantity} ks knih do knihovny.`);
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
            bookCount={books.reduce((acc, b) => acc + (b.quantity || 1), 0)}
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
              batchCount={batchBooks.reduce((acc, b) => acc + (b.quantity || 1), 0)}
              onScanSuccess={(isbn) => handleIsbnProcess(isbn)}
              onOpenManualEntry={() => setIsManualModalOpen(true)}
              onFinishBatch={handleFinishBatch}
              resumeTrigger={resumeTrigger}
              libraries={libraries}
              selectedLibraryId={activeLibraryId}
              onSelectLibrary={setActiveLibraryId}
            />
          </div>
        )}

        {currentView === 'library' && (
          <LibraryView
            books={books}
            libraries={libraries}
            activeLibraryId={activeLibraryId}
            onSelectLibrary={setActiveLibraryId}
            onOpenAddLibraryModal={() => setIsAddLibraryModalOpen(true)}
            onDeleteLibrary={handleDeleteLibrary}
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
        libraries={libraries}
        selectedLibraryId={activeLibraryId}
        onSelectLibrary={setActiveLibraryId}
      />

      {/* Add Library Modal */}
      <AddLibraryModal
        isOpen={isAddLibraryModalOpen}
        onClose={() => setIsAddLibraryModalOpen(false)}
        onAddLibrary={handleAddLibrary}
      />

      {/* Book Preview Modal (Single Scan) */}
      <BookPreviewModal
        book={scannedBook}
        libraryName={libraries.find((l) => l.id === activeLibraryId)?.name}
        onAdd={handleAddBook}
        onDiscard={handleDiscardBook}
      />

      {/* Batch Review Modal (Batch Scan) */}
      <BatchReviewModal
        isOpen={isBatchReviewOpen}
        books={batchBooks}
        libraryName={libraries.find((l) => l.id === activeLibraryId)?.name}
        onRemoveBook={handleRemoveFromBatch}
        onSaveAll={handleSaveAllBatch}
        onDiscardAll={() => setIsBatchReviewOpen(false)}
      />
    </div>
  );
}
