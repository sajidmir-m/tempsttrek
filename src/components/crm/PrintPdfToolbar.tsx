'use client';

export default function PrintPdfToolbar() {
  return (
    <div className="noPrint sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Itinerary PDF</p>
          <p className="mt-0.5 text-xs text-gray-500">Use your browser’s print dialog → “Save as PDF” to download.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 sm:w-auto"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
