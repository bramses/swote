'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useSwipe } from '@/lib/hooks/useSwipe';

export interface BookCoverProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  onSwipeUp: () => void;
}

export function BookCover({ id, title, author, cover, onSwipeUp }: BookCoverProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { handlers, state, reset } = useSwipe({
    onSwipeUp: () => {
      setIsAnimating(true);
      setOffsetY(-200);
      setTimeout(() => {
        onSwipeUp();
        setOffsetY(0);
        setIsAnimating(false);
        reset();
      }, 200);
    },
    threshold: 40,
    onSwipeMove: (swipeState) => {
      if (swipeState.deltaY < 0) {
        // Limit the upward drag
        setOffsetY(Math.max(swipeState.deltaY, -100));
      }
    },
  });

  const handleEnd = () => {
    if (Math.abs(offsetY) < 40) {
      setOffsetY(0);
    }
    handlers.onTouchEnd({} as React.TouchEvent);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-shrink-0 w-24 h-36 cursor-grab active:cursor-grabbing select-none"
      style={{
        touchAction: 'pan-x',
        transform: `translateY(${offsetY}px)`,
        transition: isAnimating ? 'transform 0.2s ease-out' : 'none',
        opacity: isAnimating ? 0 : 1,
      }}
      {...handlers}
      onTouchEnd={handleEnd}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-gray-800">
        <Image
          src={cover}
          alt={`${title} by ${author}`}
          fill
          className="object-cover pointer-events-none"
          sizes="96px"
          draggable={false}
        />
        {/* Swipe up indicator */}
        {state.isSwiping && state.deltaY < -10 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
