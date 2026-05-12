
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, MessageCircle, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import { SOCIAL_LINKS } from '@/lib/social-links';
import { SITE_CONTACT, formatPhoneDisplay, telHref } from '@/lib/site-contact';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks: Array<{ name: string; href: string }> = [
    { name: 'Home', href: '/' },
    { name: 'Packages', href: '/packages' },
    { name: 'Off Beat', href: '/offbeat' },
    { name: 'Car Rental', href: '/car-rental' },
    { name: 'About', href: '/about' },
    { name: 'Social', href: '/social' },
  ];

  const helpline = SITE_CONTACT.helpline24;
  const waDigits = helpline.replace(/\D/g, '');

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-emerald-950 text-emerald-100/95 text-[11px] sm:text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="font-bold text-emerald-300 shrink-0">24×7 Helpline</span>
          <a href={telHref(helpline)} className="font-semibold text-white hover:text-emerald-200 shrink-0">
            {formatPhoneDisplay(helpline)}
          </a>
          <span className="hidden sm:inline text-white/25 select-none">|</span>
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="hidden sm:inline hover:text-white truncate max-w-[200px] md:max-w-none"
          >
            {SITE_CONTACT.email}
          </a>
          <span className="hidden lg:inline text-white/25 select-none">|</span>
          <span className="hidden lg:inline text-emerald-100/90">{SITE_CONTACT.officeHours}</span>
          <div className="flex items-center gap-1 sm:ml-auto shrink-0">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href={SOCIAL_LINKS.youtubeChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={17} />
            </a>
          </div>
        </div>
      </div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg py-3'
            : 'bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-800 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-white/90 overflow-hidden border border-white/40 shadow-sm">
                <Image src="/logo.png" alt="Tempest Treks" fill className="object-contain p-1" priority />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                    isScrolled ? 'text-emerald-900' : 'text-white'
                  }`}
                >
                  Tempesttrek
                </span>
                <span
                  className={`text-[10px] sm:text-xs tracking-widest uppercase ${
                    isScrolled ? 'text-sky-700' : 'text-emerald-100'
                  }`}
                >
                  Kashmir Journeys
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-5 lg:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium text-sm transition-colors ${
                    isScrolled ? 'text-gray-800 hover:text-emerald-600' : 'text-white/95 hover:text-emerald-200'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <a
                href={telHref(helpline)}
                className={`hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  isScrolled
                    ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                    : 'border-white/70 text-white/95 hover:bg-white/15'
                }`}
              >
                <Phone size={16} />
                <span>Helpline</span>
              </a>

              <Link
                href="/contact"
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all transform hover:scale-105 ${
                  isScrolled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                    : 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-md'
                }`}
              >
                Book Now
              </Link>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <a
                href={telHref(helpline)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold ${
                  isScrolled ? 'bg-emerald-700 text-white' : 'bg-white/15 text-white border border-white/35'
                }`}
              >
                <Phone size={12} />
                <span>24×7</span>
              </a>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md border ${
                  isScrolled ? 'text-gray-900 border-gray-200 bg-white' : 'text-white border-white/40 bg-white/10'
                }`}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
        >
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-lg text-base font-medium text-gray-800 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="space-y-3 px-3 text-gray-800">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-600">24×7 Helpline</p>
                    <a href={telHref(helpline)} className="text-sm font-semibold">
                      {formatPhoneDisplay(helpline)}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-600">WhatsApp</p>
                    <a
                      href={`https://wa.me/91${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold"
                    >
                      {formatPhoneDisplay(helpline)}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-sky-700 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-600">Email</p>
                    <a href={`mailto:${SITE_CONTACT.email}`} className="text-sm font-semibold break-all">
                      {SITE_CONTACT.email}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{SITE_CONTACT.officeHours}</p>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-lg bg-emerald-600 text-white font-semibold shadow-md mt-2"
                >
                  Book Your Trip
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.nav>
    </header>
  );
}
