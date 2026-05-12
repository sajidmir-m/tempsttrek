import Link from 'next/link';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, CreditCard, Smartphone } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/social-links';
import { SITE_BRAND, SITE_CONTACT, formatPhoneDisplay, telHref } from '@/lib/site-contact';
import FooterNewsletter from '@/components/footer/FooterNewsletter';

const usefulLinks = [
  { href: '/terms', label: 'Terms and conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/contact', label: 'Contact us' },
  { href: '/about', label: 'About Us' },
];

const otherLinks = [
  { href: '/packages', label: 'Packages' },
  { href: '/places', label: 'Destination' },
  { href: '/cabs', label: 'Cabs' },
  { href: '/contact', label: 'Hotels' },
  { href: '/contact', label: 'Houseboats' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-emerald-950 via-teal-900 to-sky-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Contact */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-lg font-bold text-white">Contact us</h3>
            <p className="text-emerald-50/95 text-sm leading-relaxed">{SITE_BRAND.description}</p>
            <ul className="space-y-2 text-sm text-emerald-50/95">
              <li className="flex items-start gap-2">
                <Phone size={16} className="shrink-0 text-emerald-300 mt-0.5" />
                <div>
                  <span className="font-medium text-emerald-100">Phone</span>
                  <div className="mt-1 flex flex-col gap-1">
                    {SITE_CONTACT.phones.map((num) => (
                      <a
                        key={num}
                        href={telHref(num)}
                        className="hover:text-white transition-colors underline-offset-2 hover:underline"
                      >
                        {formatPhoneDisplay(num)}
                      </a>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3 pt-1">
                <Mail size={16} className="shrink-0 text-emerald-300 mt-0.5" />
                <div>
                  <span className="font-medium text-emerald-100">Email</span>
                  <br />
                  <a href={`mailto:${SITE_CONTACT.email}`} className="hover:text-white transition-colors break-all">
                    {SITE_CONTACT.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="shrink-0 text-emerald-300 mt-0.5" />
                <div>
                  <span className="font-medium text-emerald-100">Location</span>
                  <p className="mt-0.5 leading-snug">{SITE_CONTACT.address}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/90 mb-4">Useful link</h3>
            <ul className="space-y-2.5">
              {usefulLinks.map(({ href, label }) => (
                <li key={href + label}>
                  <Link href={href} className="text-emerald-50/90 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200/90 mb-4">Other Link</h3>
            <ul className="space-y-2.5">
              {otherLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-emerald-50/90 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 max-w-md">
            <FooterNewsletter />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/15 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200/90 mb-2">We support</p>
            <div className="flex flex-wrap items-center gap-4 text-emerald-50/90 text-sm">
              <span className="inline-flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-300" />
                Bank / NEFT
              </span>
              <span className="inline-flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-300" />
                UPI
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/90">Follow</span>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-100 hover:text-white p-1 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={22} />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-100 hover:text-white p-1 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
            <a
              href={SOCIAL_LINKS.youtubeChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-100 hover:text-white p-1 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={24} />
            </a>
          </div>
        </div>

        <p className="text-center text-emerald-100/80 text-xs sm:text-sm mt-8 pt-6 border-t border-white/10">
          &copy; 2014–<span suppressHydrationWarning>{year}</span> {SITE_BRAND.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
