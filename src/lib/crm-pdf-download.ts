/**
 * Client PDF export via html2pdf.js (html2canvas + jsPDF).
 * Remote Supabase images are rewritten to /api/crm-pdf-image (same-origin); on failure, retries with placeholders.
 */

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function safeFilename(name: string): string {
  const base = name.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_') || 'document';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

function rewriteImagesInClone(clonedDoc: Document, mode: 'proxy' | 'strip') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  clonedDoc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')?.trim();
    if (!src) return;
    try {
      if (src.startsWith('data:')) {
        return;
      }
      if (src.startsWith('/') && !src.startsWith('//')) {
        img.setAttribute('src', `${origin}${src}`);
        img.crossOrigin = 'anonymous';
        return;
      }
      const abs = new URL(src, origin || undefined);
      if (origin && abs.origin === origin) {
        img.crossOrigin = 'anonymous';
        return;
      }
      if (mode === 'proxy') {
        const proxy = `${origin}/api/crm-pdf-image?url=${encodeURIComponent(abs.toString())}`;
        img.setAttribute('src', proxy);
      } else {
        img.setAttribute('src', TRANSPARENT_PIXEL);
      }
      img.crossOrigin = 'anonymous';
    } catch {
      img.setAttribute('src', TRANSPARENT_PIXEL);
      img.crossOrigin = 'anonymous';
    }
  });
}

function narrowPdfViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
}

async function runHtml2Pdf(
  element: HTMLElement,
  filename: string,
  imageMode: 'proxy' | 'strip'
): Promise<void> {
  const mod = await import('html2pdf.js');
  const html2pdf = (mod as { default?: (opts?: unknown) => unknown }).default;
  if (typeof html2pdf !== 'function') {
    throw new Error('html2pdf not available');
  }

  const narrow = narrowPdfViewport();
  const scale = narrow ? 1.35 : 1.75;
  const margin = narrow ? [6, 6, 10, 6] : [8, 8, 12, 8];

  const chain = (html2pdf as () => { set: (o: Record<string, unknown>) => { from: (el: HTMLElement) => { save: () => void | Promise<void> } } })()
    .set({
      margin,
      filename,
      image: { type: 'jpeg', quality: narrow ? 0.88 : 0.92 },
      html2canvas: {
        scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        letterRendering: true,
        windowWidth: element.scrollWidth,
        onClone: (clonedDoc: Document) => {
          rewriteImagesInClone(clonedDoc, imageMode);
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-avoid-break', 'tr', '.itinerary-pdf-day'] },
    })
    .from(element);

  const saveResult = chain.save();
  if (saveResult != null && typeof (saveResult as Promise<void>).then === 'function') {
    await (saveResult as Promise<void>);
  }
}

export async function downloadElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  const safeName = safeFilename(filename);

  try {
    await runHtml2Pdf(element, safeName, 'proxy');
  } catch (first) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[crm-pdf] proxy pass failed, retrying without remote images', first);
    }
    await runHtml2Pdf(element, safeName, 'strip');
  }
}
