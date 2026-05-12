'use client';

import { useState } from 'react';
import { SITE_CONTACT } from '@/lib/site-contact';
import { Send } from 'lucide-react';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const subject = encodeURIComponent('Newsletter subscription');
    const body = encodeURIComponent(`Please add this email to your newsletter list:\n\n${trimmed}\n`);
    window.location.href = `mailto:${SITE_CONTACT.email}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/90">Newsletter</h3>
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-emerald-100/50 outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300"
      />
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 transition-colors"
      >
        <Send size={16} />
        Send
      </button>
      <p className="text-[11px] text-emerald-100/70 leading-snug">
        Opens your email app to send a subscription request—we will add you manually.
      </p>
    </form>
  );
}
