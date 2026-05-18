'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Mail, MapPin, Phone, Send, User, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { SITE_CONTACT } from '@/lib/site-contact';
import { BOOK_NOW_DISMISS_KEY, isBookNowDismissed, useBookNow } from '@/contexts/BookNowContext';

type FormState = {
  name: string;
  email: string;
  phone: string;
  destination: string;
  travel_date: string;
  travelers: string;
  message: string;
};

const empty: FormState = {
  name: '',
  email: '',
  phone: '',
  destination: 'Kashmir',
  travel_date: '',
  travelers: '2',
  message: '',
};

/** Main landing page — auto popup when opening the site / clicking Home in nav. */
const MAIN_PAGE_PATH = '/';

export default function BookNowPopup() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMainPage = pathname === MAIN_PAGE_PATH;
  const forceBook = searchParams.get('book') === '1';
  const { open, openBookNow, closeBookNow } = useBookNow();
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wasDismissed, setWasDismissed] = useState(false);
  const lastAutoPath = useRef<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    setWasDismissed(isBookNowDismissed());
  }, []);

  const close = useCallback(
    (remember = true) => {
      closeBookNow(remember);
      if (remember) setWasDismissed(true);
    },
    [closeBookNow]
  );

  useEffect(() => {
    if (pathname !== MAIN_PAGE_PATH) {
      lastAutoPath.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    if (!mounted || !isMainPage) return;
    if (!forceBook && wasDismissed) return;
    if (lastAutoPath.current === pathname && !forceBook) return;
    lastAutoPath.current = pathname;

    const t = window.setTimeout(() => openBookNow(), 900);
    return () => window.clearTimeout(t);
  }, [mounted, isMainPage, pathname, wasDismissed, forceBook, openBookNow]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const reopen = () => {
    sessionStorage.removeItem(BOOK_NOW_DISMISS_KEY);
    setWasDismissed(false);
    openBookNow();
  };

  /** Defer until after hydration — sessionStorage is not available on the server. */
  const showFloatingButton = mounted && !open && (!isMainPage || wasDismissed);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showToast('Name, email and phone are required', 'error');
      return;
    }
    setSubmitting(true);
    const message = [
      `Destination: ${form.destination}`,
      form.travel_date ? `Travel date: ${form.travel_date}` : null,
      `Travelers: ${form.travelers}`,
      form.message ? `Notes: ${form.message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw error;

      await fetch('/api/book-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, message, inquiryId: data?.id }),
      });

      showToast('Booking request sent! We will contact you shortly.', 'success');
      setForm(empty);
      close(true);
    } catch (err: unknown) {
      console.error(err);
      showToast('Could not send booking. Please call us or try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const closeBtn = (
    <button
      type="button"
      onClick={() => close(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white/35 focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label="Close booking form"
    >
      <X size={22} strokeWidth={2.5} />
    </button>
  );

  return (
    <>
      {showFloatingButton ? (
        <button
          type="button"
          onClick={reopen}
          className="fixed bottom-4 left-4 z-40 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition hover:scale-105 sm:bottom-6 sm:left-6 sm:px-5"
        >
          Book Now
        </button>
      ) : null}

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="book-now-modal"
            className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
          >
            <motion.button
              type="button"
              aria-label="Close overlay"
              className="absolute inset-0 bg-slate-900/65 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(true)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="book-now-title"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative flex max-h-[min(94dvh,720px)] w-full max-w-[min(100%,28rem)] flex-col overflow-hidden rounded-t-3xl border border-white/20 bg-white shadow-2xl sm:max-h-[90dvh] sm:max-w-lg sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative shrink-0 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-4 pb-4 pt-4 text-white sm:px-6 sm:pb-5 sm:pt-5">
                <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">{closeBtn}</div>
                <p className="pr-12 text-[10px] font-semibold uppercase tracking-widest text-teal-100 sm:text-xs">
                  Limited slots
                </p>
                <h2 id="book-now-title" className="mt-1 pr-10 text-xl font-extrabold leading-tight sm:text-2xl">
                  Book your Kashmir trip
                </h2>
                <p className="mt-1 text-xs text-teal-50 sm:text-sm">Our team replies within 24 hours.</p>
              </div>

              <form
                onSubmit={(e) => void submit(e)}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
              >
                <div className="mb-3 flex items-center justify-between sm:hidden">
                  <span className="text-sm font-semibold text-slate-700">Your details</span>
                  <button
                    type="button"
                    onClick={() => close(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="mb-1 flex items-center gap-1.5">
                      <User size={15} className="text-teal-600" /> Full name
                    </span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      autoComplete="name"
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                      placeholder="Your name"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="mb-1 flex items-center gap-1.5">
                        <Mail size={15} className="text-teal-600" /> Email
                      </span>
                      <input
                        name="email"
                        type="email"
                        inputMode="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        autoComplete="email"
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="mb-1 flex items-center gap-1.5">
                        <Phone size={15} className="text-teal-600" /> Phone
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={onChange}
                        required
                        autoComplete="tel"
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                        placeholder="+91 …"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-slate-700">
                    <span className="mb-1 flex items-center gap-1.5">
                      <MapPin size={15} className="text-teal-600" /> Destination
                    </span>
                    <input
                      name="destination"
                      value={form.destination}
                      onChange={onChange}
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="mb-1 flex items-center gap-1.5">
                        <Calendar size={15} className="text-teal-600" /> Travel date
                      </span>
                      <input
                        name="travel_date"
                        type="date"
                        value={form.travel_date}
                        onChange={onChange}
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="mb-1">Travelers</span>
                      <select
                        name="travelers"
                        value={form.travelers}
                        onChange={onChange}
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={String(n)}>
                            {n} {n === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-slate-700">
                    Message (optional)
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={3}
                      className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 sm:px-4"
                      placeholder="Hotel preference, budget, etc."
                    />
                  </label>
                </div>

                <div className="sticky bottom-0 mt-4 space-y-2 border-t border-slate-100 bg-white pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-600/25 disabled:opacity-70"
                  >
                    <Send size={18} />
                    {submitting ? 'Sending…' : 'Book Now'}
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                    Sent to {SITE_CONTACT.email} · Call +91 {SITE_CONTACT.helpline24}
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
