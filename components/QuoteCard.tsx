'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSwipe } from '@/lib/hooks/useSwipe';
import { getCachedEdgeColor, rgbToHex, getContrastTextColor, type RGB } from '@/lib/colorUtils';

export const QUOTE_FONTS = [
  'var(--font-playfair)',
  'var(--font-merriweather)',
  'var(--font-lora)',
  'var(--font-crimson)',
  'var(--font-libre-baskerville)',
  'var(--font-eb-garamond)',
  'var(--font-cormorant)',
  'var(--font-spectral)',
  'var(--font-source-serif)',
  'var(--font-bitter)',
] as const;

export type QuoteFont = typeof QUOTE_FONTS[number];

export interface SavedQuote {
  id: string;
  quote: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
  };
  savedAt: number;
  font?: QuoteFont;
}

interface QuoteCardProps {
  savedQuote: SavedQuote;
  onDelete: () => void;
  fontSize: number;
}

export function QuoteCard({ savedQuote, onDelete, fontSize }: QuoteCardProps) {
  const [bgColor, setBgColor] = useState<RGB>({ r: 100, g: 100, b: 100 });
  const [offsetX, setOffsetX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getCachedEdgeColor(savedQuote.book.cover).then(setBgColor);
  }, [savedQuote.book.cover]);

  const { handlers, state, reset } = useSwipe({
    onSwipeLeft: () => {
      setIsDeleting(true);
      setOffsetX(-400);
      setTimeout(() => {
        onDelete();
      }, 200);
    },
    threshold: 80,
    onSwipeMove: (swipeState) => {
      // Only allow leftward swipe for deletion
      if (swipeState.deltaX < 0) {
        setOffsetX(swipeState.deltaX);
      }
    },
  });

  const handleEnd = () => {
    if (offsetX > -80) {
      setOffsetX(0);
    }
    handlers.onTouchEnd({} as React.TouchEvent);
  };

  const textColor = getContrastTextColor(bgColor);
  const hexColor = rgbToHex(bgColor);
  const deleteProgress = Math.min(Math.abs(offsetX) / 80, 1);

  return (
    <div className="relative overflow-hidden">
      {/* Delete indicator background */}
      <div
        className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6"
        style={{ opacity: deleteProgress }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </div>

      {/* Quote card */}
      <div
        className="relative flex items-stretch rounded-xl overflow-hidden shadow-md cursor-grab active:cursor-grabbing select-none"
        style={{
          touchAction: 'pan-y',
          transform: `translateX(${offsetX}px)`,
          transition: isDeleting ? 'transform 0.2s ease-out' : offsetX === 0 ? 'transform 0.15s ease-out' : 'none',
        }}
        {...handlers}
        onTouchEnd={handleEnd}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Book cover thumbnail */}
        <div className="relative w-16 h-24 flex-shrink-0">
          <Image
            src={savedQuote.book.cover}
            alt={savedQuote.book.title}
            fill
            className="object-cover pointer-events-none"
            sizes="64px"
            draggable={false}
          />
        </div>

        {/* Quote content with extracted color background */}
        <div
          className="flex-1 p-3 min-h-24 flex flex-col justify-center"
          style={{ backgroundColor: hexColor }}
        >
          <p
            className="leading-relaxed font-medium"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily: savedQuote.font || 'Georgia, serif',
            }}
          >
            &ldquo;{savedQuote.quote}&rdquo;
          </p>
          <p
            className="text-xs mt-1 opacity-70"
            style={{ color: textColor }}
          >
            {savedQuote.book.author}
          </p>
        </div>
      </div>
    </div>
  );
}
