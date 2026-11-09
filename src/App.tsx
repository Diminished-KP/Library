import { useState, useEffect, useCallback } from 'react';
import type { Book, Library } from './types/book';
import type { Language } from './services/i18n';
import type { ThemeId } from './types/theme';
import { translations, formatBookCount } from './services/i18n';
import { themes } from './types/theme';
import { fetchBookByIsbnDetailed, normalizeIsbn } from './services/bookService';
import { MainMenu } from './components/MainMenu';
import { SettingsView } from './components/SettingsView';
import { ScannerComponent } from './components/Scanner';
import type { ReadingStatus } from './types/book';
import { ManualEntryModal } from './components/ManualEntryModal';
import { ManualEntryWithoutIsbnModal } from './components/ManualEntryWithoutIsbnModal';
import { BookPreviewModal } from './components/BookPreviewModal';
import { BatchReviewModal } from './components/BatchReviewModal';
import { LibraryView } from './components/LibraryView';
import { AddLibraryModal } from './components/AddLibraryModal';
import { ArrowLeft, Info } from 'lucide-react';

type View = 'menu' | 'scanner' | 'library' | 'settings';

const STORAGE_KEY_BOOKS = 'knihovna_books';
const STORAGE_KEY_LIBRARIES = 'knihovna_libraries';
const STORAGE_KEY_LANG = 'knihovna_language';
const STORAGE_KEY_THEME = 'knihovna_theme';

const DEFAULT_LIBRARY: Library = {
  id: 'default',
  name: 'Moje knihovna',
  description: 'Hlavní knihovna',
  createdAt: 0,
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('menu');

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && (saved === 'cs' || saved === 'en' || saved === 'es')) {
        return saved as Language;
      }
    } catch (e) {
      console.error('Failed to parse language from localStorage', e);
    }
    return 'cs';
  });

  // Theme state
  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved && themes[saved as ThemeId]) {
        return saved as ThemeId;
      }
    } catch (e) {
      console.error('Failed to parse theme from localStorage', e);
    }
    return 'default';
  });

  const t = translations[language] || translations.cs;
  const activeThemeConfig = themes[theme] || themes.default;

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
    return [{ ...DEFAULT_LIBRARY, name: t.myLibrary }];
  });

  const [activeLibraryId, setActiveLibraryId] = useState<string>(() => libraries[0]?.id || 'default');

  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKS);
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        return parsed.map((b, idx) => {
          const rawIsbn = b.isbn ? String(b.isbn).trim() : '';
          const hasRealIsbn = rawIsbn && !rawIsbn.startsWith('NO_ISBN_');
          return {
            ...b,
            id: b.id || `book_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
            isbn: hasRealIsbn ? rawIsbn : (rawIsbn.startsWith('NO_ISBN_') ? undefined : (rawIsbn || undefined)),
            libraryId: b.libraryId || 'default',
            quantity: typeof b.quantity === 'number' ? b.quantity : 1,
            readingStatus: b.readingStatus || 'unread',
            description: b.description || undefined,
          } as Book;
        });
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
  const [isManualNoIsbnModalOpen, setIsManualNoIsbnModalOpen] = useState(false);
  const [initialManualIsbn, setInitialManualIsbn] = useState<string>('');
  const [isAddLibraryModalOpen, setIsAddLibraryModalOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [isScannerProcessing, setIsScannerProcessing] = useState(false);
  const [showScannerSuccessCheck, setShowScannerSuccessCheck] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [resumeTrigger, setResumeTrigger] = useState(0);

  // Sync language with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
    } catch (e) {
      console.error('Failed to save language to localStorage', e);
    }
  }, [language]);

  // Sync theme with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, [theme]);

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

  // Show floating notification message
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  const handleAddLibrary = useCallback((name: string, description: string) => {
    const timestamp = Date.now();
    const id = 'lib_' + timestamp;
    setLibraries((prev) => [
      ...prev,
      {
        id,
        name,
        description,
        createdAt: timestamp,
      },
    ]);
    setActiveLibraryId(id);
    showNotification(`${t.libraryCreatedSuccess} (${name})`);
  }, [showNotification, t.libraryCreatedSuccess]);

  const handleDeleteLibrary = (libraryId: string) => {
    if (libraries.length <= 1) {
      alert(t.cannotDeleteLastLibrary);
      return;
    }
    const target = libraries.find((l) => l.id === libraryId);
    if (confirm(`${t.confirmDeleteLibrary} (${target?.name})`)) {
      setBooks((prev) => prev.filter((b) => b.libraryId !== libraryId));
      setLibraries((prev) => prev.filter((l) => l.id !== libraryId));
      const remaining = libraries.filter((l) => l.id !== libraryId);
      setActiveLibraryId(remaining[0]?.id || 'default');
      showNotification(t.libraryDeletedSuccess);
    }
  };

  const handleIsbnProcess = async (rawIsbn: string) => {
    const cleanIsbn = normalizeIsbn(rawIsbn);
    if (!cleanIsbn) return;

    const existingInLibrary = books.find(
      (b) => b.isbn === cleanIsbn && b.libraryId === activeLibraryId
    );

    const triggerSuccessCheck = () => {
      setShowScannerSuccessCheck(true);
      setTimeout(() => {
        setShowScannerSuccessCheck(false);
      }, 1800);
    };

    if (isBatchMode) {
      setIsScannerProcessing(true);
      const scanStartTime = Date.now();

      const existingInBatch = batchBooks.find((b) => b.isbn === cleanIsbn);
      if (existingInBatch) {
        setBatchBooks((prev) =>
          prev.map((b) =>
            b.isbn === cleanIsbn ? { ...b, quantity: (b.quantity || 1) + 1 } : b
          )
        );
        showNotification(`${t.quantityIncreasedInBatch} ${existingInBatch.title}`);
        triggerSuccessCheck();

        // Enforce cooldown so user clearly sees the spinner until scanner is ready
        const elapsed = Date.now() - scanStartTime;
        const remainingCooldown = Math.max(0, 1800 - elapsed);
        setTimeout(() => {
          setIsScannerProcessing(false);
        }, remainingCooldown);
        return;
      }

      try {
        const fetchResult = await fetchBookByIsbnDetailed(cleanIsbn);

        if (!fetchResult.success) {
          showNotification(t[fetchResult.message === 'Kniha s tímto ISBN nebyla nalezena v dostupné databázi.' ? 'isbnNotFound' : 'isbnFetchError'] || fetchResult.message);
          const elapsed = Date.now() - scanStartTime;
          const remainingCooldown = Math.max(0, 1200 - elapsed);
          setTimeout(() => {
            setIsScannerProcessing(false);
          }, remainingCooldown);
          return;
        }

        const bookToAdd: Book = {
          ...fetchResult.book,
          libraryId: activeLibraryId,
          quantity: 1,
        };

        setBatchBooks((prev) => [bookToAdd, ...prev]);
        showNotification(`${t.scannedInBatch} ${bookToAdd.title}`);
        triggerSuccessCheck();

        // Keep scanner busy with spinner during post-fetch cooldown so user knows when ready
        const elapsed = Date.now() - scanStartTime;
        const remainingCooldown = Math.max(0, 1800 - elapsed);
        setTimeout(() => {
          setIsScannerProcessing(false);
        }, remainingCooldown);
      } catch (err) {
        console.error('Error fetching book in batch:', err);
        showNotification(`${t.isbnFetchError} (${cleanIsbn})`);
        const elapsed = Date.now() - scanStartTime;
        const remainingCooldown = Math.max(0, 1200 - elapsed);
        setTimeout(() => {
          setIsScannerProcessing(false);
        }, remainingCooldown);
      }
    } else {
      // Single scan mode
      setIsScannerProcessing(true);
      try {
        const fetchResult = await fetchBookByIsbnDetailed(cleanIsbn);
        setIsScannerProcessing(false);

        if (!fetchResult.success) {
          showNotification(t[fetchResult.message === 'Kniha s tímto ISBN nebyla nalezena v dostupné databázi.' ? 'isbnNotFound' : 'isbnFetchError'] || fetchResult.message);
          setResumeTrigger((prev) => prev + 1);
          // If not found online, offer manual details entry pre-filled with this ISBN
          setInitialManualIsbn(cleanIsbn);
          setIsManualNoIsbnModalOpen(true);
          return;
        }

        const bookToAdd: Book = {
          ...fetchResult.book,
          libraryId: activeLibraryId,
          quantity: existingInLibrary ? existingInLibrary.quantity + 1 : 1,
        };

        triggerSuccessCheck();
        setScannedBook(bookToAdd);
      } catch (err) {
        setIsScannerProcessing(false);
        console.error('Error fetching book:', err);
        showNotification(`${t.isbnFetchError} (${cleanIsbn})`);
        setResumeTrigger((prev) => prev + 1);
      }
    }
  };

  const handleAddBook = () => {
    if (scannedBook) {
      setBooks((prev) => {
        const existingIdx = prev.findIndex(
          (b) =>
            b.isbn &&
            scannedBook.isbn &&
            b.isbn === scannedBook.isbn &&
            b.libraryId === scannedBook.libraryId
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
      showNotification(t.bookAddedSuccess);
      setResumeTrigger((prev) => prev + 1);
    }
  };

  const handleAddCustomBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    showNotification(t.bookAddedSuccess);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
    showNotification(t.bookUpdatedSuccess);
  };

  const handleDuplicateBook = (bookToDuplicate: Book) => {
    const timestamp = Date.now();
    const duplicate: Book = {
      ...bookToDuplicate,
      id: `book_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
      addedAt: timestamp,
      quantity: 1,
    };
    setBooks((prev) => [duplicate, ...prev]);
    showNotification(t.duplicateCreatedSuccess);
  };

  const handleUpdateReadingStatus = (targetBook: Book, status: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === targetBook.id) {
          return { ...b, readingStatus: status };
        }
        return b;
      })
    );
  };

  const handleDiscardBook = () => {
    setScannedBook(null);
    setResumeTrigger((prev) => prev + 1);
  };

  const handleDeleteBook = (bookIdOrIsbn: string, libraryId: string, removeAll: boolean) => {
    setBooks((prev) => {
      // Find book primarily by id, fallback to isbn and libraryId for backward compat
      const existing = prev.find(
        (b) => b.id === bookIdOrIsbn || (b.isbn === bookIdOrIsbn && b.libraryId === libraryId)
      );
      if (!existing) return prev;

      if (removeAll || existing.quantity <= 1) {
        return prev.filter((b) => b.id !== existing.id);
      } else {
        return prev.map((b) =>
          b.id === existing.id ? { ...b, quantity: b.quantity - 1 } : b
        );
      }
    });
    showNotification(removeAll ? t.bookDeletedSuccess : t.quantityDecreased);
  };

  const handleFinishBatch = () => {
    if (batchBooks.length === 0) {
      showNotification(t.noBooksInBatch);
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
      showNotification(`${formatBookCount(totalQuantity, language, t)} ${t.batchAddedSuccess}`);
      setCurrentView('library');
    }
  };

  const handleRemoveFromBatch = (isbn: string) => {
    setBatchBooks((prev) => prev.filter((b) => b.isbn !== isbn));
  };

  return (
    <div className={`min-h-screen ${activeThemeConfig.bgClass} ${activeThemeConfig.textPrimaryClass} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Banner / Toast Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between text-sm font-medium animate-in fade-in slide-in-from-top-4`}>
          <div className="flex items-center gap-2.5">
            <Info className={`w-5 h-5 ${activeThemeConfig.accentClass} flex-shrink-0`} />
            <span>{notification}</span>
          </div>
        </div>
      )}


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {currentView === 'menu' && (
          <MainMenu
            onNavigateToScanner={() => setCurrentView('scanner')}
            onNavigateToLibrary={() => setCurrentView('library')}
            onNavigateToSettings={() => setCurrentView('settings')}
            bookCount={books.reduce((acc, b) => acc + (b.quantity || 1), 0)}
            t={t}
            currentLanguage={language}
            currentTheme={theme}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            currentLanguage={language}
            onSelectLanguage={setLanguage}
            currentTheme={theme}
            onSelectTheme={setTheme}
            onBackToMenu={() => setCurrentView('menu')}
            t={t}
          />
        )}

        {currentView === 'scanner' && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-lg flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView('menu')}
                className={`flex items-center gap-2 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} font-medium px-3 py-2 rounded-xl transition`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t.mainMenu}</span>
              </button>
              <h2 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.scannerTitle}</h2>
            </div>

            <ScannerComponent
              isBatchMode={isBatchMode}
              onToggleBatchMode={setIsBatchMode}
              batchCount={batchBooks.reduce((acc, b) => acc + (b.quantity || 1), 0)}
              onScanSuccess={(isbn) => handleIsbnProcess(isbn)}
              onOpenManualEntry={() => setIsManualModalOpen(true)}
              onOpenManualEntryNoIsbn={() => setIsManualNoIsbnModalOpen(true)}
              onFinishBatch={handleFinishBatch}
              resumeTrigger={resumeTrigger}
              isProcessing={isScannerProcessing}
              showSuccessCheck={showScannerSuccessCheck}
              libraries={libraries}
              selectedLibraryId={activeLibraryId}
              onSelectLibrary={setActiveLibraryId}
              t={t}
              currentLanguage={language}
              currentTheme={theme}
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
            onNavigateToScanner={() => setCurrentView('scanner')}
            onOpenManualEntryNoIsbn={() => {
              setInitialManualIsbn('');
              setIsManualNoIsbnModalOpen(true);
            }}
            onDeleteBook={handleDeleteBook}
            onUpdateBook={handleUpdateBook}
            onDuplicateBook={handleDuplicateBook}
            onUpdateReadingStatus={handleUpdateReadingStatus}
            t={t}
            currentLanguage={language}
            currentTheme={theme}
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
        onSwitchToManualDetails={(failedIsbn) => {
          setIsManualModalOpen(false);
          setInitialManualIsbn(failedIsbn);
          setIsManualNoIsbnModalOpen(true);
        }}
        libraries={libraries}
        selectedLibraryId={activeLibraryId}
        onSelectLibrary={setActiveLibraryId}
        t={t}
        currentTheme={theme}
      />

      {/* Manual Entry Without ISBN Modal */}
      <ManualEntryWithoutIsbnModal
        isOpen={isManualNoIsbnModalOpen}
        initialIsbn={initialManualIsbn}
        onClose={() => {
          setIsManualNoIsbnModalOpen(false);
          setInitialManualIsbn('');
        }}
        onSubmit={handleAddCustomBook}
        libraries={libraries}
        selectedLibraryId={activeLibraryId}
        onSelectLibrary={setActiveLibraryId}
        t={t}
        currentTheme={theme}
      />

      {/* Add Library Modal */}
      <AddLibraryModal
        isOpen={isAddLibraryModalOpen}
        onClose={() => setIsAddLibraryModalOpen(false)}
        onAddLibrary={handleAddLibrary}
        t={t}
        currentTheme={theme}
      />

      {/* Book Preview Modal (Single Scan) */}
      <BookPreviewModal
        book={scannedBook}
        libraryName={libraries.find((l) => l.id === activeLibraryId)?.name}
        onAdd={handleAddBook}
        onDiscard={handleDiscardBook}
        t={t}
        currentTheme={theme}
      />

      {/* Batch Review Modal (Batch Scan) */}
      <BatchReviewModal
        isOpen={isBatchReviewOpen}
        books={batchBooks}
        libraryName={libraries.find((l) => l.id === activeLibraryId)?.name}
        onRemoveBook={handleRemoveFromBatch}
        onSaveAll={handleSaveAllBatch}
        onDiscardAll={() => setIsBatchReviewOpen(false)}
        t={t}
        currentTheme={theme}
      />
    </div>
  );
}
