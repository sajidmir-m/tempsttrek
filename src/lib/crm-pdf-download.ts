'use client';

/**
 * Client PDF export via html2pdf.js (html2canvas + jsPDF).
 * Itineraries capture the visible on-screen .itin-doc (WYSIWYG) — off-screen clones
 * often produce blank or faint PDFs.
 */

import { loadHtml2Pdf } from '@/lib/html2pdf-loader';

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const A4_CONTENT_WIDTH_PX = 718;
const IMAGE_WAIT_MS = 8000;
const CAPTURE_PREP_MAX_MS = 18000;

/** Injected into html2canvas clone so text/colors stay solid (not washed out). */
const ITINERARY_CAPTURE_BOOST_CSS = `
  .itin-doc, .itinerary-pdf-pro, .itin-doc *, .itinerary-pdf-pro * {
    opacity: 1 !important;
    visibility: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .itin-letterhead {
    background: #0c1929 !important;
    color: #ffffff !important;
    border-bottom: 3px solid #b8860b !important;
  }
  .itin-letterhead * { color: #ffffff !important; }
  .itin-letterhead-tag { color: #f5ecd6 !important; }
  .itin-cover-title, .itin-day-title, .itin-hotel-name, .itin-dest-name {
    color: #0c1929 !important;
  }
  .itin-doc, .itin-doc p, .itin-doc li, .itin-doc dd, .itin-doc dt, .itin-doc td, .itin-doc th,
  .itin-fact-value, .itin-timeline-body {
    color: #1a1a1a !important;
  }
  .itin-fact-label, .itin-muted, .itin-cover-eyebrow {
    color: #5c5c5c !important;
  }
  .itin-chip { background: #0c1929 !important; color: #ffffff !important; }
  .itin-chip--gold { background: #f5ecd6 !important; color: #0c1929 !important; }
  .itin-pay-footer {
    background: #0c1929 !important;
    color: #ffffff !important;
  }
  .itin-pay-footer * { color: #ffffff !important; }
`;

function safeFilename(name: string): string {
  const base = name.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_') || 'document';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

function isItineraryPdfExport(element: HTMLElement): boolean {
  return (
    element.classList.contains('itin-doc') ||
    element.classList.contains('itinerary-pdf-pro') ||
    !!element.querySelector('.itin-doc, .itinerary-pdf-pro')
  );
}

function resolveCaptureElement(element: HTMLElement): HTMLElement {
  const doc =
    element.querySelector('.itin-doc') ?? element.querySelector('.itinerary-pdf-pro');
  if (doc instanceof HTMLElement) return doc;
  if (element.classList.contains('itin-doc') || element.classList.contains('itinerary-pdf-pro')) {
    return element;
  }
  return element;
}

function injectCapturedStyles(sourceElement: HTMLElement, clonedDoc: Document) {
  const head = clonedDoc.head;
  if (!head) return;

  const roots = new Set<HTMLElement>();
  roots.add(sourceElement);
  const itineraryRoot = sourceElement.closest('.itinerary-pdf-root');
  if (itineraryRoot instanceof HTMLElement) roots.add(itineraryRoot);

  for (const root of roots) {
    root.querySelectorAll('style').forEach((styleEl) => {
      const clone = clonedDoc.createElement('style');
      clone.textContent = styleEl.textContent;
      head.appendChild(clone);
    });
  }
}

function rewriteImagesInClone(clonedDoc: Document, mode: 'proxy' | 'strip') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  clonedDoc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')?.trim();
    if (!src) return;
    try {
      if (src.startsWith('data:')) return;
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
        img.setAttribute('src', `${origin}/api/crm-pdf-image?url=${encodeURIComponent(abs.toString())}`);
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

function absolutizeImagesInElement(element: HTMLElement) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')?.trim();
    if (!src || src.startsWith('data:') || src.startsWith('http')) return;
    if (src.startsWith('/') && !src.startsWith('//')) {
      img.setAttribute('src', `${origin}${src}`);
    }
    img.crossOrigin = 'anonymous';
  });
}

type ItineraryCaptureSession = {
  captureEl: HTMLElement;
  styleSource: HTMLElement;
  cleanup: () => void;
};

/** Capture the live preview node (what you see on screen), not an off-screen clone. */
function beginItineraryCapture(element: HTMLElement): ItineraryCaptureSession {
  const itineraryRoot = element.closest('.itinerary-pdf-root');
  const captureEl = resolveCaptureElement(element);
  const styleSource = (itineraryRoot ?? element) as HTMLElement;

  const hiddenChrome: { el: HTMLElement; visibility: string }[] = [];
  document.querySelectorAll('.noPrint').forEach((node) => {
    if (node instanceof HTMLElement) {
      hiddenChrome.push({ el: node, visibility: node.style.visibility });
      node.style.visibility = 'hidden';
    }
  });

  const prevWidth = captureEl.style.width;
  const prevMaxWidth = captureEl.style.maxWidth;
  captureEl.style.width = `${A4_CONTENT_WIDTH_PX}px`;
  captureEl.style.maxWidth = `${A4_CONTENT_WIDTH_PX}px`;
  absolutizeImagesInElement(captureEl);
  captureEl.scrollIntoView({ block: 'start' });
  void captureEl.offsetHeight;

  return {
    captureEl,
    styleSource,
    cleanup: () => {
      captureEl.style.width = prevWidth;
      captureEl.style.maxWidth = prevMaxWidth;
      for (const { el, visibility } of hiddenChrome) {
        el.style.visibility = visibility;
      }
    },
  };
}

function narrowPdfViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
}

function waitForImage(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete) {
      resolve();
      return;
    }
    const finish = () => resolve();
    img.addEventListener('load', finish, { once: true });
    img.addEventListener('error', finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

async function waitForImagesInElement(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.querySelectorAll('img'));
  if (!imgs.length) return;
  await Promise.race([
    Promise.all(imgs.map((img) => waitForImage(img, IMAGE_WAIT_MS))),
    new Promise<void>((r) => window.setTimeout(r, CAPTURE_PREP_MAX_MS)),
  ]);
}

function itineraryOnClone(clonedDoc: Document, imageMode: 'proxy' | 'strip', styleSource: HTMLElement) {
  rewriteImagesInClone(clonedDoc, imageMode);
  injectCapturedStyles(styleSource, clonedDoc);
  const boost = clonedDoc.createElement('style');
  boost.textContent = ITINERARY_CAPTURE_BOOST_CSS;
  clonedDoc.head?.appendChild(boost);

  const clonedPro = clonedDoc.querySelector('.itin-doc, .itinerary-pdf-pro');
  if (clonedPro instanceof HTMLElement) {
    clonedPro.style.overflow = 'visible';
    clonedPro.style.height = 'auto';
    clonedPro.style.maxHeight = 'none';
    clonedPro.style.width = `${A4_CONTENT_WIDTH_PX}px`;
    clonedPro.style.maxWidth = `${A4_CONTENT_WIDTH_PX}px`;
    clonedPro.style.transform = 'none';
    clonedPro.style.filter = 'none';
    clonedPro.style.opacity = '1';
    clonedPro.style.background = '#ffffff';
  }
}

async function runHtml2Pdf(
  captureEl: HTMLElement,
  filename: string,
  imageMode: 'proxy' | 'strip',
  styleSource: HTMLElement,
  itinerary: boolean
): Promise<void> {
  const html2pdf = await loadHtml2Pdf();

  const narrow = itinerary ? false : narrowPdfViewport();
  const scale = itinerary ? 2 : narrow ? 1.35 : 1.75;
  const margin = itinerary ? [8, 6, 10, 6] : narrow ? [6, 6, 10, 6] : [8, 8, 12, 8];

  const captureW = Math.max(captureEl.scrollWidth, captureEl.offsetWidth, 1);
  const captureH = Math.max(captureEl.scrollHeight, captureEl.offsetHeight, 1);

  const html2canvasOpts: Record<string, unknown> = {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    letterRendering: itinerary,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: -window.scrollY,
    width: captureW,
    windowWidth: itinerary ? Math.max(captureW, A4_CONTENT_WIDTH_PX) : captureW,
    height: captureH,
    windowHeight: captureH,
    onclone: (clonedDoc: Document, _el?: HTMLElement) => {
      if (itinerary) {
        itineraryOnClone(clonedDoc, imageMode, styleSource);
        return;
      }
      rewriteImagesInClone(clonedDoc, imageMode);
      injectCapturedStyles(styleSource, clonedDoc);
      const clonedRoot = clonedDoc.querySelector('.hv-doc, .invoice-pdf-root > div');
      if (clonedRoot instanceof HTMLElement) {
        clonedRoot.style.overflow = 'visible';
        clonedRoot.style.height = 'auto';
        clonedRoot.style.maxHeight = 'none';
      }
    },
  };

  const pagebreakAvoid = itinerary
    ? ['.itin-letterhead', '.itin-cover', '.itin-day', '.itin-hotel-card']
    : [
        '.pdf-avoid-break',
        '.pdf-keep-together',
        'tr',
        '.crm-pdf-card',
        '.crm-pdf-pay-card',
        '.crm-pdf-footer',
        '.hv-header',
        '.hv-footer',
      ];

  const chain = (html2pdf as () => { set: (o: Record<string, unknown>) => { from: (el: HTMLElement) => { save: () => void | Promise<void> } } })()
    .set({
      margin,
      filename,
      image: itinerary
        ? { type: 'png' }
        : { type: 'jpeg', quality: narrow ? 0.88 : 0.92 },
      html2canvas: html2canvasOpts,
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: pagebreakAvoid,
      },
    })
    .from(captureEl);

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
  const itinerary = isItineraryPdfExport(element);
  const itineraryRoot = element.closest('.itinerary-pdf-root');

  let captureEl = resolveCaptureElement(element);
  let sessionCleanup: (() => void) | null = null;
  let styleSource: HTMLElement = element;

  if (itinerary) {
    if (itineraryRoot) itineraryRoot.classList.add('itinerary-pdf-exporting');
    const session = beginItineraryCapture(element);
    captureEl = session.captureEl;
    styleSource = session.styleSource;
    sessionCleanup = session.cleanup;
  }

  await waitForImagesInElement(captureEl);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  void captureEl.offsetHeight;

  try {
    try {
      await runHtml2Pdf(captureEl, safeName, 'proxy', styleSource, itinerary);
    } catch (first) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[crm-pdf] proxy pass failed, retrying without remote images', first);
      }
      await runHtml2Pdf(captureEl, safeName, 'strip', styleSource, itinerary);
    }
  } finally {
    sessionCleanup?.();
    if (itineraryRoot) itineraryRoot.classList.remove('itinerary-pdf-exporting');
  }
}
