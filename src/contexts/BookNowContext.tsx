'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

/** Session-only: closing the popup blocks auto-show until the browser tab is closed. */
export const BOOK_NOW_DISMISS_KEY = 'tt_book_now_dismissed_session';

type BookNowContextValue = {
  open: boolean;
  openBookNow: () => void;
  closeBookNow: (remember?: boolean) => void;
};

const BookNowContext = createContext<BookNowContextValue | null>(null);

export function BookNowProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const closeBookNow = useCallback((remember = true) => {
    setOpen(false);
    if (remember && typeof window !== 'undefined') {
      sessionStorage.setItem(BOOK_NOW_DISMISS_KEY, '1');
    }
  }, []);

  const openBookNow = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <BookNowContext.Provider value={{ open, openBookNow, closeBookNow }}>
      {children}
    </BookNowContext.Provider>
  );
}

export function useBookNow() {
  const ctx = useContext(BookNowContext);
  if (!ctx) {
    throw new Error('useBookNow must be used within BookNowProvider');
  }
  return ctx;
}

export function isBookNowDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(BOOK_NOW_DISMISS_KEY) === '1';
}
