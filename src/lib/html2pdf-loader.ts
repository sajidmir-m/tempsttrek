'use client';

/**
 * Load html2pdf.js from /public/vendor (no webpack chunk — avoids ChunkLoadError in Next dev).
 */

const VENDOR_SCRIPT = '/vendor/html2pdf.bundle.min.js';

export type Html2PdfWorker = {
  set: (options: Record<string, unknown>) => Html2PdfWorker;
  from: (el: HTMLElement) => Html2PdfWorker;
  save: () => void | Promise<void>;
};

export type Html2PdfFn = () => Html2PdfWorker;

type Html2PdfGlobal = typeof globalThis & { html2pdf?: Html2PdfFn };

let loadPromise: Promise<Html2PdfFn> | null = null;

function loadFromScript(): Promise<Html2PdfFn> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('html2pdf can only load in the browser'));
  }

  const g = window as Html2PdfGlobal;
  if (typeof g.html2pdf === 'function') {
    return Promise.resolve(g.html2pdf);
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (typeof g.html2pdf === 'function') {
        resolve(g.html2pdf);
      } else {
        reject(new Error('html2pdf script loaded but global is missing'));
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${VENDOR_SCRIPT}"]`);
    if (existing) {
      if (typeof g.html2pdf === 'function') {
        finish();
        return;
      }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('html2pdf vendor script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = VENDOR_SCRIPT;
    script.async = true;
    script.onload = finish;
    script.onerror = () =>
      reject(
        new Error(
          `Failed to load ${VENDOR_SCRIPT}. Run: npm install (copies vendor bundle via postinstall).`
        )
      );
    document.head.appendChild(script);
  });
}

export function loadHtml2Pdf(): Promise<Html2PdfFn> {
  if (!loadPromise) {
    loadPromise = loadFromScript();
  }
  return loadPromise;
}

export function resetHtml2PdfLoader(): void {
  loadPromise = null;
}
