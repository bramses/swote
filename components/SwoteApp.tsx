'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuoteList } from './QuoteList';
import { BookCarousel, type Book } from './BookCarousel';
import type { SavedQuote } from './QuoteCard';

const STORAGE_KEY = 'swote-saved-quotes';
const FONT_SIZE_KEY = 'swote-font-size';

const LOADING_QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  { text: "A room without books is like a body without a soul.", author: "Cicero" },
  { text: "The only thing that you absolutely have to know, is the location of the library.", author: "Albert Einstein" },
  { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "Until I feared I would lose it, I never loved to read. One does not love breathing.", author: "Harper Lee" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Reading is essential for those who seek to rise above the ordinary.", author: "Jim Rohn" },
  { text: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
];

function loadSavedQuotes(): SavedQuote[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSavedQuotes(quotes: SavedQuote[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadFontSize(): number {
  if (typeof window === 'undefined') return 14;
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    return stored ? parseInt(stored, 10) : 14;
  } catch {
    return 14;
  }
}

function saveFontSize(size: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FONT_SIZE_KEY, String(size));
}

function LoadingScreen() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Randomize on mount to avoid hydration mismatch
    setQuoteIndex(Math.floor(Math.random() * LOADING_QUOTES.length));

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
        setIsVisible(true);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const quote = LOADING_QUOTES[quoteIndex];

  return (
    <div className="w-screen flex flex-col items-center justify-center bg-gray-950 px-8" style={{ height: '100dvh' }}>
      <div
        className={`text-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="text-white text-xl leading-relaxed mb-4">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-gray-400 text-sm">
          — {quote.author}
        </p>
      </div>
      <div className="mt-8">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}

export function SwoteApp() {
  const [books, setBooks] = useState<Book[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const quoteListScrollRef = useRef<HTMLDivElement>(null);

  const isAtTop = useCallback(() => {
    return !quoteListScrollRef.current || quoteListScrollRef.current.scrollTop < 10;
  }, []);

  const scrollToTop = useCallback(() => {
    quoteListScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load books from API
  useEffect(() => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => {
        // Shuffle books randomly
        const shuffled = [...data.books].sort(() => Math.random() - 0.5);
        setBooks(shuffled);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load books:', err);
        setIsLoading(false);
      });
  }, []);

  // Hydrate saved quotes and font size from localStorage
  useEffect(() => {
    setSavedQuotes(loadSavedQuotes());
    setFontSize(loadFontSize());
    setIsHydrated(true);
  }, []);

  // Persist quotes to localStorage
  useEffect(() => {
    if (isHydrated) {
      saveSavedQuotes(savedQuotes);
    }
  }, [savedQuotes, isHydrated]);

  const handleSelectQuote = useCallback((book: Book, quote: string) => {
    const newQuote: SavedQuote = {
      id: `${book.id}-${Date.now()}`,
      quote,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.cover,
      },
      savedAt: Date.now(),
    };

    setSavedQuotes((prev) => [newQuote, ...prev]);
  }, []);

  const handleDeleteQuote = useCallback((id: string) => {
    setSavedQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setSavedQuotes([]);
  }, []);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
    saveFontSize(size);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-screen flex flex-col bg-gray-950 overflow-hidden" style={{ height: '100dvh' }}>
      {/* Quote list - top 4/5 */}
      <div className="flex-[4] min-h-0">
        <QuoteList
          quotes={savedQuotes}
          onDeleteQuote={handleDeleteQuote}
          onClearAll={handleClearAll}
          scrollRef={quoteListScrollRef}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-800" />

      {/* Book carousel - bottom */}
      <div className="shrink-0 h-[120px]">
        <BookCarousel
          books={books}
          onSelectQuote={handleSelectQuote}
          isAtTop={isAtTop}
          scrollToTop={scrollToTop}
        />
      </div>
    </div>
  );
}
