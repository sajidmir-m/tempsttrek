'use client';

/**
 * Client PDF export via html2pdf.js (html2canvas + jsPDF).
 * Remote Supabase images are rewritten to /api/crm-pdf-image (same-origin); on failure, retries with placeholders.
 */

import { loadHtml2Pdf } from '@/lib/html2pdf-loader';

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function safeFilename(name: string): string {
  const base = name.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_') || 'document';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

/** Copy <style> blocks from the capture root into the clone document (html2canvas backup). */
function injectCapturedStyles(sourceElement: HTMLElement, clonedDoc: Document) {
  const head = clonedDoc.head;
  if (!head) return;
  sourceElement.querySelectorAll('style').forEach((styleEl) => {
    const clone = clonedDoc.createElement('style');
    clone.textContent = styleEl.textContent;
    head.appendChild(clone);
  });
}

/** Copy exact computed colors from the live voucher so the PDF matches the on-screen invoice. */
function syncVoucherPaintFromOriginal(sourceElement: HTMLElement, clonedDoc: Document) {
  const origRoot = sourceElement.querySelector('.hv-doc');
  const cloneRoot = clonedDoc.querySelector('.hv-doc');
  if (!origRoot || !cloneRoot) return;

  const origList = [origRoot, ...Array.from(origRoot.querySelectorAll('*'))];
  const cloneList = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll('*'))];
  const len = Math.min(origList.length, cloneList.length);

  for (let i = 0; i < len; i++) {
    const orig = origList[i];
    const clone = cloneList[i];
    if (!(orig instanceof HTMLElement) || !(clone instanceof HTMLElement)) continue;

    const cs = window.getComputedStyle(orig);
    const color = cs.color;
    const bg = cs.backgroundColor;
    const borderColor = cs.borderColor;

    if (color && color !== 'rgba(0, 0, 0, 0)') {
      clone.style.color = color;
      clone.style.setProperty('-webkit-text-fill-color', color);
    }
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      clone.style.backgroundColor = bg;
    }
    if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
      clone.style.borderColor = borderColor;
    }
  }
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

async function waitForImagesInElement(element: HTMLElement, timeoutMs = 14000): Promise<void> {
  const imgs = Array.from(element.querySelectorAll('img'));
  if (!imgs.length) return;

  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const finish = () => resolve();
          img.addEventListener('load', finish, { once: true });
          img.addEventListener('error', finish, { once: true });
          window.setTimeout(finish, timeoutMs);
        })
    )
  );
}

async function runHtml2Pdf(
  element: HTMLElement,
  filename: string,
  imageMode: 'proxy' | 'strip',
  sourceElement?: HTMLElement
): Promise<void> {
  const html2pdf = await loadHtml2Pdf();

  const narrow = narrowPdfViewport();
  const scale = narrow ? 1.35 : 1.75;
  const margin = narrow ? [6, 6, 10, 6] : [8, 8, 12, 8];

  const captureW = Math.max(element.scrollWidth, element.offsetWidth, 1);
  const captureH = Math.max(element.scrollHeight, element.offsetHeight, 1);

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
        backgroundColor: '#ffffff',
        width: captureW,
        height: captureH,
        windowWidth: captureW,
        windowHeight: captureH,
        scrollX: 0,
        scrollY: 0,
        onClone: (clonedDoc: Document) => {
          rewriteImagesInClone(clonedDoc, imageMode);
          if (sourceElement) {
            injectCapturedStyles(sourceElement, clonedDoc);
            if (sourceElement.querySelector('.hv-doc')) {
              syncVoucherPaintFromOriginal(sourceElement, clonedDoc);
            }
          }
          const clonedRoot = clonedDoc.querySelector('.hv-doc, .invoice-pdf-root > div');
          if (clonedRoot instanceof HTMLElement) {
            clonedRoot.style.overflow = 'visible';
            clonedRoot.style.height = 'auto';
            clonedRoot.style.maxHeight = 'none';
          }
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: [
          '.pdf-avoid-break',
          'tr',
          '.itinerary-pdf-day',
          '.hv-header',
          '.hv-info-bar',
          '.hv-panels',
          '.hv-table-wrap',
          '.hv-cab',
          '.hv-terms',
          '.hv-footer',
        ],
      },
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

  await waitForImagesInElement(element);

  const prevOverflow = element.style.overflow;
  const prevHeight = element.style.height;
  element.style.overflow = 'visible';
  element.style.height = 'auto';

  try {
    try {
      await runHtml2Pdf(element, safeName, 'proxy', element);
    } catch (first) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[crm-pdf] proxy pass failed, retrying without remote images', first);
      }
      await runHtml2Pdf(element, safeName, 'strip', element);
    }
  } finally {
    element.style.overflow = prevOverflow;
    element.style.height = prevHeight;
  }
}
