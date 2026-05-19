'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DEFAULT_HERO_SLIDES, type HeroSlide } from '@/lib/home-content';

type HeroProps = {
  heroSlides?: HeroSlide[];
};

function isVideoSrc(src: string): boolean {
  const path = (src.split('?')[0] ?? '').toLowerCase();
  return /\.(mp4|webm|mov|m4v)$/.test(path);
}

export default function Hero({ heroSlides }: HeroProps) {
  const slides = useMemo(() => {
    return heroSlides?.length ? heroSlides : DEFAULT_HERO_SLIDES;
  }, [heroSlides]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

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

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentIndex] ?? slides[0];
  const fadeDuration = reduceMotion ? 0.2 : 0.55;

  if (!current) return null;

  const video = isVideoSrc(current.src);

  return (
    <div className="relative min-h-[calc(100dvh-var(--site-navbar-offset))] w-full overflow-hidden bg-black box-border">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.src}-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDuration }}
          className="absolute inset-0 z-0"
        >
          {video ? (
            <video
              key={current.src}
              src={current.src}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover opacity-80"
            />
          ) : (
            <Image
              key={current.src}
              src={current.src}
              alt=""
              fill
              priority={currentIndex === 0}
              sizes="100vw"
              quality={82}
              className="object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all hover:bg-white/20 md:block"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all hover:bg-white/20 md:block"
      >
        <ChevronRight size={32} />
      </button>

      <div className="relative z-10 flex h-full max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="flex w-full max-w-5xl flex-col items-center text-center translate-y-6 sm:translate-y-8 md:translate-y-12">
        <motion.span
          key={`sub-${currentIndex}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.35, duration: reduceMotion ? 0.2 : 0.55 }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-sky-400 md:text-base"
        >
          Welcome to Paradise
        </motion.span>

        <motion.h1
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.55, duration: reduceMotion ? 0.2 : 0.55 }}
          className="mb-6 text-5xl font-bold leading-tight text-white sm:text-7xl md:text-8xl"
        >
          Explore{' '}
          <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            {current.title}
          </span>
          <br /> {current.subtitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.85, duration: reduceMotion ? 0.2 : 0.55 }}
          className="mb-10 max-w-2xl text-lg font-light leading-relaxed text-gray-200 sm:text-xl"
        >
          Experience the breathtaking landscapes, serene lakes, and mountains with Tempesttrek. Your journey
          starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 1.05, duration: reduceMotion ? 0.2 : 0.55 }}
          className="flex flex-col gap-6 sm:flex-row"
        >
          <Link
            href="/packages"
            className="group relative overflow-hidden rounded-full bg-sky-600 px-8 py-4 font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Packages <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>

          <Link
            href="/contact"
            className="group rounded-full border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            Plan Your Trip
          </Link>
        </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              type="button"
              key={`dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 rounded-full transition-all ${
                currentIndex === idx ? 'w-8 bg-sky-500' : 'w-3 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
