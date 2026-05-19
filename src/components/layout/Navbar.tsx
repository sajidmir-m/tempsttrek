'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import { SOCIAL_LINKS } from '@/lib/social-links';
import { SITE_BRAND, SITE_CONTACT, formatPhoneDisplay, telHref } from '@/lib/site-contact';
import { cn } from '@/lib/cn';

const navLinks: Array<{ name: string; href: string }> = [
  { name: 'Home', href: '/' },
  { name: 'Packages', href: '/packages' },
  { name: 'Cabs', href: '/cabs' },
  { name: 'Off Beat', href: '/offbeat' },
  { name: 'Car Rental', href: '/car-rental' },
  { name: 'About', href: '/about' },
  { name: 'Social', href: '/social' },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 24);
  });

  const helpline = SITE_CONTACT.helpline24;
  const waDigits = helpline.replace(/\D/g, '');

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Utility strip */}
      <motion.div
        initial={false}
        animate={{ height: isScrolled ? 0 : 'auto', opacity: isScrolled ? 0 : 1 }}
        className="overflow-hidden border-b border-white/[0.08] bg-[#0c1f1a]/95 backdrop-blur-md"
      >
        <motion.div
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2 text-[11px] sm:px-6 sm:text-xs lg:px-8"
          aria-hidden={isScrolled}
        >
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300/95">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            24×7 Helpline
          </span>
          <a
            href={telHref(helpline)}
            className="font-semibold text-white/95 transition hover:text-emerald-200"
          >
            {formatPhoneDisplay(helpline)}
          </a>
          <span className="hidden text-white/20 sm:inline">|</span>
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="hidden truncate text-white/75 transition hover:text-white sm:inline md:max-w-none"
          >
            {SITE_CONTACT.email}
          </a>
          <div className="ml-auto flex items-center gap-0.5">
            {[
              { href: SOCIAL_LINKS.facebook, label: 'Facebook', Icon: Facebook },
              { href: SOCIAL_LINKS.instagram, label: 'Instagram', Icon: Instagram },
              { href: SOCIAL_LINKS.youtubeChannel, label: 'YouTube', Icon: Youtube },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label={label}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Main navigation */}
      <motion.nav
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'w-full transition-[background,box-shadow,padding] duration-500 ease-out',
          isScrolled
            ? 'border-b border-slate-200/80 bg-white/85 py-2.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl'
            : 'border-b border-white/10 bg-gradient-to-b from-slate-950/75 via-slate-900/55 to-transparent py-3.5 backdrop-blur-sm'
        )}
      >
        <motion.div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <Link href="/" className="group flex min-w-0 items-center gap-3.5 sm:gap-4">
              <div
                className={cn(
                  'relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 transition duration-300 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]',
                  isScrolled
                    ? 'bg-white ring-slate-200/80 shadow-sm group-hover:shadow-md'
                    : 'bg-white/95 ring-white/30 shadow-lg shadow-black/20 group-hover:ring-white/50'
                )}
              >
                <Image
                  src="/logo.png"
                  alt={SITE_BRAND.shortName}
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <div className="hidden min-w-0 flex-col sm:flex">
                <span
                  className={cn(
                    'truncate text-base font-bold tracking-tight transition-colors sm:text-lg',
                    isScrolled ? 'text-slate-900' : 'text-white'
                  )}
                >
                  {SITE_BRAND.shortName}
                </span>
                <span
                  className={cn(
                    'truncate text-[10px] font-medium uppercase tracking-[0.2em] transition-colors',
                    isScrolled ? 'text-emerald-700' : 'text-emerald-200/90'
                  )}
                >
                  {SITE_BRAND.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <motion.div
              className={cn(
                'hidden items-center gap-1 rounded-2xl p-1 md:flex',
                isScrolled ? 'bg-slate-100/80' : 'bg-white/[0.08] ring-1 ring-white/10'
              )}
            >
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'relative rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 lg:px-4',
                      active
                        ? isScrolled
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'bg-white/15 text-white shadow-inner'
                        : isScrolled
                          ? 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {link.name}
                    {active ? (
                      <span
                        className={cn(
                          'absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full',
                          isScrolled ? 'bg-emerald-600' : 'bg-emerald-300'
                        )}
                      />
                    ) : null}
                  </Link>
                );
              })}
            </motion.div>

            {/* Desktop actions */}
            <motion.div className="hidden items-center gap-2 md:flex lg:gap-3">
              <a
                href={telHref(helpline)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all',
                  isScrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white/90 hover:bg-white/10'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    isScrolled ? 'bg-emerald-50 text-emerald-700' : 'bg-white/15 text-white'
                  )}
                >
                  <Phone size={15} />
                </span>
                <span className="hidden lg:inline">Call us</span>
              </a>

              <Link
                href="/contact"
                className={cn(
                  'group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition-all duration-300',
                  isScrolled
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:brightness-105'
                    : 'bg-white text-emerald-900 shadow-black/20 hover:bg-emerald-50'
                )}
              >
                Book Now
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>

            {/* Mobile toggle */}
            <motion.div className="flex items-center gap-2 md:hidden">
              <a
                href={telHref(helpline)}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-xl transition',
                  isScrolled
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-white/15 text-white ring-1 ring-white/20'
                )}
                aria-label="Call helpline"
              >
                <Phone size={18} />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-xl transition',
                  isScrolled
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/15 text-white ring-1 ring-white/25'
                )}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-[var(--site-navbar-offset)] z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-50 border-t border-slate-200/80 bg-white shadow-2xl md:hidden"
              >
                <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
                  {navLinks.map((link, i) => {
                    const active = isActivePath(pathname, link.href);
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold transition',
                            active
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                              : 'text-slate-800 hover:bg-slate-50'
                          )}
                        >
                          {link.name}
                          {active ? <ArrowRight size={18} className="opacity-90" /> : null}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <a
                      href={telHref(helpline)}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Phone size={18} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          24×7 Helpline
                        </p>
                        <p className="text-sm font-bold text-slate-900">{formatPhoneDisplay(helpline)}</p>
                      </div>
                    </a>
                    <a
                      href={`https://wa.me/91${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                        <MessageCircle size={18} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">WhatsApp</p>
                        <p className="text-sm font-bold text-slate-900">{formatPhoneDisplay(helpline)}</p>
                      </div>
                    </a>
                    <a
                      href={`mailto:${SITE_CONTACT.email}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <Mail size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</p>
                        <p className="truncate text-sm font-bold text-slate-900">{SITE_CONTACT.email}</p>
                      </div>
                    </a>
                  </div>

                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/30"
                  >
                    Book your trip
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
