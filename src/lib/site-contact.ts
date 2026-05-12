/** Single source for Tempest Treks contact details (navbar + footer + contact page). */

export const SITE_BRAND = {
  legalName: 'Tempest Treks Tour & Travels Holidays',
  shortName: 'Tempesttrek',
  description:
    'Tempest Treks Tour and Travels is an online travel platform which provides you great holiday packages.',
} as const;

export const SITE_CONTACT = {
  phones: ['7006796123', '9682513124', '9596367536'] as const,
  /** Primary helpline shown in navbar */
  helpline24: '7006796123',
  email: 'info@tempesttreks.in',
  address: 'Illahi Bagh Soura Near Grid Station, Jammu and Kashmir — 190020',
  officeHours: 'Mon–Fri: 10 AM – 5 PM',
} as const;

export function telHref(num: string) {
  return `tel:+91${num.replace(/\D/g, '')}`;
}

export function formatPhoneDisplay(num: string) {
  const digits = num.replace(/\D/g, '');
  return `+91 ${digits}`;
}

/** Deduped office numbers for PDFs / letterhead (uses `SITE_CONTACT.phones`). */
export function companyPhonesDisplayLine(): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const p of SITE_CONTACT.phones) {
    const d = p.replace(/\D/g, '');
    if (!d || seen.has(d)) continue;
    seen.add(d);
    parts.push(formatPhoneDisplay(p));
  }
  return parts.join(' · ');
}
