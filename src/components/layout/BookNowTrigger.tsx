'use client';

import { useBookNow } from '@/contexts/BookNowContext';

type BookNowTriggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Called after opening the popup (e.g. close mobile nav). */
  onOpen?: () => void;
};

export default function BookNowTrigger({ children, className, onOpen }: BookNowTriggerProps) {
  const { openBookNow } = useBookNow();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        openBookNow();
        onOpen?.();
      }}
    >
      {children}
    </button>
  );
}
