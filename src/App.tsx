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
import { ManualEntryModal } from './components/ManualEntryModal';
import { BookPreviewModal } from './components/BookPreviewModal';
import { BatchReviewModal } from './components/BatchReviewModal';
import { LibraryView } from './components/LibraryView';
import { AddLibraryModal } from './components/AddLibraryModal';
import { ArrowLeft, Loader2, Info } from 'lucide-react';

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

    if (isBatchMode) {
      const existingInBatch = batchBooks.find((b) => b.isbn === cleanIsbn);
      if (existingInBatch) {
        setBatchBooks((prev) =>
          prev.map((b) =>
            b.isbn === cleanIsbn ? { ...b, quantity: (b.quantity || 1) + 1 } : b
          )
        );
        showNotification(`${t.quantityIncreasedInBatch} ${existingInBatch.title}`);
        return;
      }

      setIsLoading(true);
      try {
        const fetchResult = await fetchBookByIsbnDetailed(cleanIsbn);
        setIsLoading(false);

        if (!fetchResult.success) {
          showNotification(t[fetchResult.message === 'Kniha s tímto ISBN nebyla nalezena v dostupné databázi.' ? 'isbnNotFound' : 'isbnFetchError'] || fetchResult.message);
          return;
        }

        const bookToAdd: Book = {
          ...fetchResult.book,
          libraryId: activeLibraryId,
          quantity: 1,
        };

        setBatchBooks((prev) => [bookToAdd, ...prev]);
        showNotification(`${t.scannedInBatch} ${bookToAdd.title}`);
      } catch (err) {
        setIsLoading(false);
        console.error('Error fetching book in batch:', err);
        showNotification(`${t.isbnFetchError} (${cleanIsbn})`);
      }
    } else {
      // Single scan mode
      setIsLoading(true);
      try {
        const fetchResult = await fetchBookByIsbnDetailed(cleanIsbn);
        setIsLoading(false);

        if (!fetchResult.success) {
          showNotification(t[fetchResult.message === 'Kniha s tímto ISBN nebyla nalezena v dostupné databázi.' ? 'isbnNotFound' : 'isbnFetchError'] || fetchResult.message);
          setResumeTrigger((prev) => prev + 1);
          return;
        }

        const bookToAdd: Book = {
          ...fetchResult.book,
          libraryId: activeLibraryId,
          quantity: existingInLibrary ? existingInLibrary.quantity + 1 : 1,
        };

        setScannedBook(bookToAdd);
      } catch (err) {
        setIsLoading(false);
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
      showNotification(t.bookAddedSuccess);
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className={`fixed inset-0 z-50 ${activeThemeConfig.bgClass}/80 backdrop-blur-sm flex flex-col items-center justify-center p-4`}>
          <Loader2 className={`w-12 h-12 ${activeThemeConfig.accentClass} animate-spin mb-3`} />
          <p className={`${activeThemeConfig.textPrimaryClass} font-medium text-sm`}>{t.loading}</p>
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
              onFinishBatch={handleFinishBatch}
              resumeTrigger={resumeTrigger}
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
            onDeleteBook={handleDeleteBook}
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
