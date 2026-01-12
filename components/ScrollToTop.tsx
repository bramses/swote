'use client';

import { useState, useEffect, RefObject } from 'react';

interface ScrollToTopProps {
  scrollRef: RefObject<HTMLElement | null>;
  threshold?: number;
}

export function ScrollToTop({ scrollRef, threshold = 200 }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsVisible(container.scrollTop > threshold);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollRef, threshold]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="absolute bottom-4 right-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
}
