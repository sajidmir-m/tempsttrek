'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DEFAULT_HERO_SLIDES, type HeroSlide } from '@/lib/home-content';

type HeroProps = {
  heroSlides?: HeroSlide[];
};

export default function Hero({ heroSlides }: HeroProps) {
  const slides = useMemo(() => {
    return heroSlides?.length ? heroSlides : DEFAULT_HERO_SLIDES;
  }, [heroSlides]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex((i) => (i >= slides.length ? 0 : i));
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentIndex] ?? slides[0];

  if (!current) return null;

  return (
    <div className="relative min-h-[calc(100dvh-var(--site-navbar-offset))] w-full overflow-hidden bg-black box-border">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.src}-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <video
            key={current.src}
            src={current.src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all hidden md:block"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all hidden md:block"
      >
        <ChevronRight size={32} />
      </button>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.span
          key={`sub-${currentIndex}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sky-400 font-medium tracking-[0.2em] text-sm md:text-base uppercase mb-4"
        >
          Welcome to Paradise
        </motion.span>

        <motion.h1
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-white mb-6 leading-tight"
        >
          Explore{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            {current.title}
          </span>
          <br /> {current.subtitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed font-light"
        >
          Experience the breathtaking landscapes, serene lakes, and mountains with Tempesttrek. Your journey
          starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link
            href="/packages"
            className="group relative px-8 py-4 bg-sky-600 text-white font-semibold rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Packages <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            href="/contact"
            className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
          >
            Plan Your Trip
          </Link>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              type="button"
              key={`dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentIndex === idx ? 'bg-sky-500 w-8' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
