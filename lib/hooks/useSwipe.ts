'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

export interface SwipeState {
  direction: SwipeDirection;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
}

export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent | React.MouseEvent) => void;
  onTouchMove: (e: React.TouchEvent | React.MouseEvent) => void;
  onTouchEnd: (e: React.TouchEvent | React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}

export interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance to trigger swipe
  onSwipeMove?: (state: SwipeState) => void;
}

export function useSwipe(options: UseSwipeOptions = {}): {
  handlers: SwipeHandlers;
  state: SwipeState;
  reset: () => void;
} {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    onSwipeMove,
  } = options;

  const [state, setState] = useState<SwipeState>({
    direction: null,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
  });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isMouseDown = useRef(false);

  const reset = useCallback(() => {
    setState({
      direction: null,
      deltaX: 0,
      deltaY: 0,
      isSwiping: false,
    });
    startPos.current = null;
    isMouseDown.current = false;
  }, []);

  const getPosition = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if ('clientX' in e) {
      return { x: e.clientX, y: e.clientY };
    }
    return null;
  };

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const pos = getPosition(e);
    if (pos) {
      startPos.current = pos;
      setState((prev) => ({ ...prev, isSwiping: true }));
      if ('button' in e) {
        isMouseDown.current = true;
      }
    }
  }, []);

  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!startPos.current) return;
      if ('button' in e && !isMouseDown.current) return;

      const pos = getPosition(e);
      if (!pos) return;

      const deltaX = pos.x - startPos.current.x;
      const deltaY = pos.y - startPos.current.y;

      let direction: SwipeDirection = null;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else if (absY > absX) {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const newState: SwipeState = {
        direction,
        deltaX,
        deltaY,
        isSwiping: true,
      };

      setState(newState);
      onSwipeMove?.(newState);
    },
    [onSwipeMove]
  );

  const handleEnd = useCallback(() => {
    if (!startPos.current) return;

    const absX = Math.abs(state.deltaX);
    const absY = Math.abs(state.deltaY);

    if (absX >= threshold && absX > absY) {
      if (state.deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absY >= threshold && absY > absX) {
      if (state.deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    reset();
  }, [state.deltaX, state.deltaY, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, reset]);

  const handlers: SwipeHandlers = {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };

  return { handlers, state, reset };
}

/**
 * Hook for keyboard navigation (arrow keys)
 */
export function useKeyboardNavigation(options: {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  enabled?: boolean;
}) {
  const { onLeft, onRight, onUp, onDown, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onDown?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onLeft, onRight, onUp, onDown]);
}
