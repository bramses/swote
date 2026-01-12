'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuoteList } from './QuoteList';
import { BookCarousel, type Book } from './BookCarousel';
import type { SavedQuote } from './QuoteCard';

const STORAGE_KEY = 'swote-saved-quotes';
const FONT_SIZE_KEY = 'swote-font-size';

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
        setBooks(data.books);
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
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
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

      {/* Book carousel - bottom 1/5 */}
      <div className="flex-1 min-h-[140px] max-h-[180px]">
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
