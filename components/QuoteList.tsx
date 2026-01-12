'use client';

import { RefObject } from 'react';
import { QuoteCard, type SavedQuote } from './QuoteCard';
import { ScrollToTop } from './ScrollToTop';

interface QuoteListProps {
  quotes: SavedQuote[];
  onDeleteQuote: (id: string) => void;
  onClearAll: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function QuoteList({ quotes, onDeleteQuote, onClearAll, scrollRef, fontSize, onFontSizeChange }: QuoteListProps) {

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-white">Your Quotes</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">A</span>
            <input
              type="range"
              min="12"
              max="20"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10))}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-sm text-gray-400">A</span>
          </div>
          {quotes.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Quote list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {quotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-16 h-16 mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-center">No quotes yet</p>
            <p className="text-sm mt-1 text-center">
              Swipe up on a book below to save a quote
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                savedQuote={quote}
                onDelete={() => onDeleteQuote(quote.id)}
                fontSize={fontSize}
              />
            ))}
          </div>
        )}
      </div>

      <ScrollToTop scrollRef={scrollRef} />
    </div>
  );
}
