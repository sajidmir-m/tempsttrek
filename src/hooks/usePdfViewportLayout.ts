'use client';

import { useEffect, useState } from 'react';

/** `unknown` until mounted; `narrow` is max-width 639px (phones). */
export type PdfViewportLayout = 'unknown' | 'narrow' | 'wide';

export function usePdfViewportLayout(): PdfViewportLayout {
  const [layout, setLayout] = useState<PdfViewportLayout>('unknown');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setLayout(mq.matches ? 'narrow' : 'wide');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return layout;
}
