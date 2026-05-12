'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, ArrowRight, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatInr } from '@/lib/format-currency';

interface PackageProps {
  id: string;
  title: string;
  duration: string;
  price: number;
  image: string;
  slug: string;
  location?: string;
}

export default function PackageCard({ id, title, duration, price, image, slug, location }: PackageProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />
        
        {/* Snow Effect on Corner */}
        <div className="absolute top-0 right-0 p-3 bg-white/10 backdrop-blur-md rounded-bl-2xl border-b border-l border-white/20">
            <Snowflake className="text-white animate-spin-slow" size={20} />
        </div>

        <div className="absolute top-4 left-4 bg-sky-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wider">
          Best Seller
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
             <Clock size={14} />
             <span>{duration}</span>
          </div>
          <h3 className="text-2xl font-bold text-white leading-tight mb-1 group-hover:text-sky-300 transition-colors">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50">
        <div className="flex-grow">
           <div className="flex items-start gap-2 text-gray-700 text-sm mb-4">
              <MapPin size={16} className="text-sky-500 mt-0.5" />
              <span className="line-clamp-2">{location || 'Srinagar • Gulmarg • Pahalgam • Sonmarg'}</span>
           </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between mt-auto">
          <div>
            <p className="text-xs text-gray-600 uppercase font-medium">Starting from</p>
            <p className="text-xl font-bold text-sky-700">₹{formatInr(price)}</p>
          </div>
          
          <Link 
            href={`/packages/${slug}`}
            className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 hover:bg-sky-600 hover:text-white transition-colors shadow-sm hover:shadow-md"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
