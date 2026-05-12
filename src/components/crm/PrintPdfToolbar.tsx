'use client';

export default function PrintPdfToolbar() {
  return (
    <div className="noPrint sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Itinerary PDF</p>
          <p className="text-xs text-gray-500 mt-0.5">Use your browser’s print dialog → “Save as PDF” to download.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-semibold"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
