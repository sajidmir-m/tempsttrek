export default function CornerDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Top Left Corner */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-br-full blur-xl"></div>
      
      {/* Top Right Corner */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-full blur-2xl"></div>
      
      {/* Decorative Snow Clumps (SVG) */}
      <svg className="absolute top-0 left-0 w-24 h-24 text-white/80 drop-shadow-lg" viewBox="0 0 100 100" fill="currentColor">
        <path d="M0 0 L100 0 C 50 10, 20 40, 0 100 Z" />
      </svg>
       <svg className="absolute top-0 right-0 w-24 h-24 text-white/80 drop-shadow-lg transform scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
        <path d="M0 0 L100 0 C 50 10, 20 40, 0 100 Z" />
      </svg>
    </div>
  );
}
