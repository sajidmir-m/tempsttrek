
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  location: string;
  comment: string;
  rating: number;
}

export default function TestimonialCard({ name, location, comment, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
      <p className="text-gray-800 mb-6 italic">"{comment}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-xs text-gray-700">{location}</p>
        </div>
      </div>
    </div>
  );
}
