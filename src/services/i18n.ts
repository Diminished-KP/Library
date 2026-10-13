export type Language = 'cs' | 'en' | 'es';

export interface Translations {
  // Common / Navigation
  mainMenu: string;
  startScanner: string;
  myLibrary: string;
  settings: string;
  backToMenu: string;
  bookSingular: string;
  bookFew: string;
  bookMany: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  search: string;
  loading: string;

  // Main menu
  appTitle: string;
  appSubtitle: string;

  // Settings
  settingsTitle: string;
  languageSectionTitle: string;
  languageSectionDesc: string;
  themeSectionTitle: string;
  themeSectionDesc: string;
  langCzech: string;
  langEnglish: string;
  langSpanish: string;

  // Themes
  themeDefault: string;
  themeLight: string;
  themeGray: string;
  themeGreen: string;
  themeBrown: string;
  themeOrange: string;
  themePurple: string;
  themeBlack: string;

  // Scanner
  scannerTitle: string;
  batchMode: string;
  singleMode: string;
  manualInput: string;
  finishBatch: string;
  scannedBooksCount: string;
  selectLibrary: string;

  // Library view
  libraryTitle: string;
  addLibrary: string;
  deleteLibrary: string;
  exportLibrary: string;
  importLibrary: string;
  allLibraries: string;
  searchBookPlaceholder: string;
  noBooksFound: string;
  bookDetails: string;
  quantity: string;
  authors: string;
  publisher: string;
  publishedYear: string;
  pages: string;
  isbn: string;

  // Notifications & Messages
  bookAddedSuccess: string;
  bookDeletedSuccess: string;
  quantityDecreased: string;
  libraryCreatedSuccess: string;
  libraryDeletedSuccess: string;
  batchAddedSuccess: string;
  cannotDeleteLastLibrary: string;
  confirmDeleteLibrary: string;
  isbnNotFound: string;
  isbnFetchError: string;
  quantityIncreasedInBatch: string;
  scannedInBatch: string;
  noBooksInBatch: string;

  // Modals
  addBookTitle: string;
  batchReviewTitle: string;
  saveAll: string;
  discardAll: string;
  manualEntryTitle: string;
  manualEntryPlaceholder: string;
  manualEntrySubmit: string;
  addLibraryTitle: string;
  libraryNameLabel: string;
  libraryDescLabel: string;
  deleteBookTitle: string;
  deleteBookConfirmOne: string;
  deleteBookConfirmAll: string;
}

export const translations: Record<Language, Translations> = {
  cs: {
    mainMenu: 'Hlavní menu',
    startScanner: 'Spustit skener',
    myLibrary: 'Moje knihovna',
    settings: 'Nastavení',
    backToMenu: 'Zpět do nabídky',
    bookSingular: 'kniha',
    bookFew: 'knihy',
    bookMany: 'knih',
    cancel: 'Zrušit',
    confirm: 'Potvrdit',
    save: 'Uložit',
    delete: 'Smazat',
    edit: 'Upravit',
    close: 'Zavřít',
    search: 'Hledat',
    loading: 'Načítám...',

    appTitle: 'Knihovnický Skener',
    appSubtitle: 'Rychlé skenování čárových kódů a ISBN čísel pro okamžité ukládání knih do osobní knihovny.',

    settingsTitle: 'Nastavení',
    languageSectionTitle: 'Jazyk / Language',
    languageSectionDesc: 'Vyberte preferovaný jazyk aplikace.',
    themeSectionTitle: 'Grafický motiv',
    themeSectionDesc: 'Vyberte si barevné schéma vyhovující vašim očím.',
    langCzech: 'Čeština',
    langEnglish: 'English',
    langSpanish: 'Español',

    themeDefault: 'Výchozí (Tmavě modrá)',
    themeLight: 'Světlý (Bílá)',
    themeGray: 'Šedý (Neutral Gray)',
    themeGreen: 'Zelený (Smaragd)',
    themeBrown: 'Hnědý (Drevo)',
    themeOrange: 'Oranžový (Západ slunce)',
    themePurple: 'Fialový (Violet)',
    themeBlack: 'Černý (OLED)',

    scannerTitle: 'Skener ISBN',
    batchMode: 'Hromadný režim',
    singleMode: 'Jednotlivý režim',
    manualInput: 'Ruční zadání ISBN',
    finishBatch: 'Dokončit hromadný sběr',
    scannedBooksCount: 'Naskenované knihy',
    selectLibrary: 'Vyberte knihovnu',

    libraryTitle: 'Moje Knihovna',
    addLibrary: 'Přidat knihovnu',
    deleteLibrary: 'Smazat knihovnu',
    exportLibrary: 'Exportovat knihovnu',
    importLibrary: 'Importovat knihovnu',
    allLibraries: 'Všechny knihovny',
    searchBookPlaceholder: 'Hledat podle názvu, autora nebo ISBN...',
    noBooksFound: 'V knihovně nebyly nalezeny žádné knihy.',
    bookDetails: 'Detail knihy',
    quantity: 'Počet kusů',
    authors: 'Autoři',
    publisher: 'Vydavatel',
    publishedYear: 'Rok vydání',
    pages: 'Počet stran',
    isbn: 'ISBN',

    bookAddedSuccess: 'Kniha byla úspěšně přidána do knihovny.',
    bookDeletedSuccess: 'Kniha byla smazána z knihovny.',
    quantityDecreased: 'Počet kusů byl snížen o 1.',
    libraryCreatedSuccess: 'Knihovna byla úspěšně vytvořena.',
    libraryDeletedSuccess: 'Knihovna byla smazána.',
    batchAddedSuccess: 'Přidáno ks knih do knihovny.',
    cannotDeleteLastLibrary: 'Nelze smazat jedinou zbývající knihovnu.',
    confirmDeleteLibrary: 'Opravdu chcete smazat knihovnu včetně všech jejích knih?',
    isbnNotFound: 'Kniha s tímto ISBN nebyla nalezena.',
    isbnFetchError: 'Chyba při vyhledávání ISBN. Zkontrolujte připojení.',
    quantityIncreasedInBatch: 'Zvýšen počet u naskenované knihy:',
    scannedInBatch: 'Naskenováno:',
    noBooksInBatch: 'Zatím nebyly naskenovány žádné nové knihy.',

    addBookTitle: 'Naskenovaná kniha',
    batchReviewTitle: 'Kontrola naskenovaných knih',
    saveAll: 'Uložit vše do knihovny',
    discardAll: 'Zahodit vše',
    manualEntryTitle: 'Zadat ISBN ručně',
    manualEntryPlaceholder: 'Zadejte 10 nebo 13-místné ISBN',
    manualEntrySubmit: 'Vyhledat knihu',
    addLibraryTitle: 'Vytvořit novou knihovnu',
    libraryNameLabel: 'Název knihovny',
    libraryDescLabel: 'Popis (volitelné)',
    deleteBookTitle: 'Odstranit knihu',
    deleteBookConfirmOne: 'Odebrat 1 kus',
    deleteBookConfirmAll: 'Smazat všechny kusy',
  },

  en: {
    mainMenu: 'Main Menu',
    startScanner: 'Start Scanner',
    myLibrary: 'My Library',
    settings: 'Settings',
    backToMenu: 'Back to Menu',
    bookSingular: 'book',
    bookFew: 'books',
    bookMany: 'books',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',

    appTitle: 'Library Scanner',
    appSubtitle: 'Fast barcode and ISBN scanning to instantly save books into your personal library.',

    settingsTitle: 'Settings',
    languageSectionTitle: 'Language',
    languageSectionDesc: 'Select your preferred application language.',
    themeSectionTitle: 'Color Theme',
    themeSectionDesc: 'Choose a color scheme that suits your preferences.',
    langCzech: 'Čeština',
    langEnglish: 'English',
    langSpanish: 'Español',

    themeDefault: 'Default (Dark Blue)',
    themeLight: 'Light (White)',
    themeGray: 'Gray (Neutral Dark)',
    themeGreen: 'Green (Emerald)',
    themeBrown: 'Brown (Wood)',
    themeOrange: 'Orange (Sunset)',
    themePurple: 'Purple (Violet)',
    themeBlack: 'Black (OLED)',

    scannerTitle: 'ISBN Scanner',
    batchMode: 'Batch Mode',
    singleMode: 'Single Mode',
    manualInput: 'Manual ISBN Entry',
    finishBatch: 'Finish Batch',
    scannedBooksCount: 'Scanned books',
    selectLibrary: 'Select library',

    libraryTitle: 'My Library',
    addLibrary: 'Add Library',
    deleteLibrary: 'Delete Library',
    exportLibrary: 'Export Library',
    importLibrary: 'Import Library',
    allLibraries: 'All Libraries',
    searchBookPlaceholder: 'Search by title, author or ISBN...',
    noBooksFound: 'No books found in the library.',
    bookDetails: 'Book Details',
    quantity: 'Quantity',
    authors: 'Authors',
    publisher: 'Publisher',
    publishedYear: 'Publication Year',
    pages: 'Pages',
    isbn: 'ISBN',

    bookAddedSuccess: 'Book was successfully added to the library.',
    bookDeletedSuccess: 'Book was deleted from the library.',
    quantityDecreased: 'Quantity decreased by 1.',
    libraryCreatedSuccess: 'Library was successfully created.',
    libraryDeletedSuccess: 'Library was deleted.',
    batchAddedSuccess: 'books added to library.',
    cannotDeleteLastLibrary: 'Cannot delete the only remaining library.',
    confirmDeleteLibrary: 'Are you sure you want to delete the library along with all its books?',
    isbnNotFound: 'Book with this ISBN was not found.',
    isbnFetchError: 'Error fetching ISBN. Check your connection.',
    quantityIncreasedInBatch: 'Increased count for scanned book:',
    scannedInBatch: 'Scanned:',
    noBooksInBatch: 'No new books have been scanned yet.',

    addBookTitle: 'Scanned Book',
    batchReviewTitle: 'Review Scanned Books',
    saveAll: 'Save All to Library',
    discardAll: 'Discard All',
    manualEntryTitle: 'Enter ISBN Manually',
    manualEntryPlaceholder: 'Enter 10 or 13 digit ISBN',
    manualEntrySubmit: 'Search Book',
    addLibraryTitle: 'Create New Library',
    libraryNameLabel: 'Library Name',
    libraryDescLabel: 'Description (optional)',
    deleteBookTitle: 'Remove Book',
    deleteBookConfirmOne: 'Remove 1 copy',
    deleteBookConfirmAll: 'Remove all copies',
  },

  es: {
    mainMenu: 'Menú principal',
    startScanner: 'Iniciar escáner',
    myLibrary: 'Mi biblioteca',
    settings: 'Ajustes',
    backToMenu: 'Volver al menú',
    bookSingular: 'libro',
    bookFew: 'libros',
    bookMany: 'libros',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    search: 'Buscar',
    loading: 'Cargando...',

    appTitle: 'Escáner de Biblioteca',
    appSubtitle: 'Escaneo rápido de códigos de barras e ISBN para guardar libros al instante en tu biblioteca personal.',

    settingsTitle: 'Ajustes',
    languageSectionTitle: 'Idioma',
    languageSectionDesc: 'Selecciona tu idioma preferido para la aplicación.',
    themeSectionTitle: 'Tema gráfico',
    themeSectionDesc: 'Elige un esquema de colores a tu gusto.',
    langCzech: 'Čeština',
    langEnglish: 'English',
    langSpanish: 'Español',

    themeDefault: 'Predeterminado (Azul oscuro)',
    themeLight: 'Claro (Blanco)',
    themeGray: 'Gris (Neutral)',
    themeGreen: 'Verde (Esmeralda)',
    themeBrown: 'Marrón (Madera)',
    themeOrange: 'Naranja (Atardecer)',
    themePurple: 'Púrpura (Violeta)',
    themeBlack: 'Negro (OLED)',

    scannerTitle: 'Escáner ISBN',
    batchMode: 'Modo por lotes',
    singleMode: 'Modo individual',
    manualInput: 'Entrada manual de ISBN',
    finishBatch: 'Finalizar lote',
    scannedBooksCount: 'Libros escaneados',
    selectLibrary: 'Seleccionar biblioteca',

    libraryTitle: 'Mi Biblioteca',
    addLibrary: 'Añadir biblioteca',
    deleteLibrary: 'Eliminar biblioteca',
    exportLibrary: 'Exportar biblioteca',
    importLibrary: 'Importar biblioteca',
    allLibraries: 'Todas las bibliotecas',
    searchBookPlaceholder: 'Buscar por título, autor o ISBN...',
    noBooksFound: 'No se encontraron libros en la biblioteca.',
    bookDetails: 'Detalles del libro',
    quantity: 'Cantidad',
    authors: 'Autores',
    publisher: 'Editorial',
    publishedYear: 'Año de publicación',
    pages: 'Páginas',
    isbn: 'ISBN',

    bookAddedSuccess: 'El libro fue añadido con éxito a la biblioteca.',
    bookDeletedSuccess: 'El libro fue eliminado de la biblioteca.',
    quantityDecreased: 'Cantidad reducida en 1.',
    libraryCreatedSuccess: 'La biblioteca se creó con éxito.',
    libraryDeletedSuccess: 'Biblioteca eliminada.',
    batchAddedSuccess: 'libros añadidos a la biblioteca.',
    cannotDeleteLastLibrary: 'No se puede eliminar la única biblioteca restante.',
    confirmDeleteLibrary: '¿Estás seguro de que deseas eliminar la biblioteca y todos sus libros?',
    isbnNotFound: 'No se encontró ningún libro con este ISBN.',
    isbnFetchError: 'Error al buscar ISBN. Comprueba tu conexión.',
    quantityIncreasedInBatch: 'Se aumentó la cantidad del libro escaneado:',
    scannedInBatch: 'Escaneado:',
    noBooksInBatch: 'Aún no se han escaneado nuevos libros.',

    addBookTitle: 'Libro escaneado',
    batchReviewTitle: 'Revisar libros escaneados',
    saveAll: 'Guardar todo en la biblioteca',
    discardAll: 'Descartar todo',
    manualEntryTitle: 'Ingresar ISBN manualmente',
    manualEntryPlaceholder: 'Ingresa un ISBN de 10 o 13 dígitos',
    manualEntrySubmit: 'Buscar libro',
    addLibraryTitle: 'Crear nueva biblioteca',
    libraryNameLabel: 'Nombre de la biblioteca',
    libraryDescLabel: 'Descripción (opcional)',
    deleteBookTitle: 'Eliminar libro',
    deleteBookConfirmOne: 'Eliminar 1 copia',
    deleteBookConfirmAll: 'Eliminar todas las copias',
  },
};

export const formatBookCount = (count: number, lang: Language, t: Translations): string => {
  if (lang === 'cs') {
    if (count === 1) return `${count} ${t.bookSingular}`;
    if (count >= 2 && count <= 4) return `${count} ${t.bookFew}`;
    return `${count} ${t.bookMany}`;
  }
  if (count === 1) return `${count} ${t.bookSingular}`;
  return `${count} ${t.bookMany}`;
};
