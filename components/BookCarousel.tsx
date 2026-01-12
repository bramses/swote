'use client';

import { useRef, useState, useEffect } from 'react';
import { BookCover } from './BookCover';
import { useKeyboardNavigation } from '@/lib/hooks/useSwipe';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  quotes: string[];
}

interface BookCarouselProps {
  books: Book[];
  onSelectQuote: (book: Book, quote: string) => void;
  isAtTop: () => boolean;
  scrollToTop: () => void;
}

export function BookCarousel({ books, onSelectQuote, isAtTop, scrollToTop }: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => scrollEl.removeEventListener('scroll', updateScrollButtons);
    }
  }, [books]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useKeyboardNavigation({
    onLeft: () => scroll('left'),
    onRight: () => scroll('right'),
  });

  const handleSwipeUp = (book: Book) => {
    // Scroll to top if not already there
    if (!isAtTop()) {
      scrollToTop();
    }
    // Pick a random quote from the book
    const randomQuote = book.quotes[Math.floor(Math.random() * book.quotes.length)];
    onSelectQuote(book, randomQuote);
  };

  return (
    <div className="relative w-full h-full bg-gray-900/50 backdrop-blur-sm">
      {/* Scroll left button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Books container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 h-full px-12 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book) => (
          <div key={book.id} className="snap-center group">
            <BookCover
              id={book.id}
              title={book.title}
              author={book.author}
              cover={book.cover}
              onSwipeUp={() => handleSwipeUp(book)}
            />
          </div>
        ))}
      </div>

      {/* Scroll right button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Hint text */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-500">
        Swipe up on a book to add a quote
      </div>
    </div>
  );
}
