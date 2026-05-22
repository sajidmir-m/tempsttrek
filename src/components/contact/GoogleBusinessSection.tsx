import { MapPin, Star } from 'lucide-react';
import { SITE_CONTACT } from '@/lib/site-contact';
import {
  resolveGoogleMapsEmbedSrc,
  resolveGoogleMapsReviewsUrl,
} from '@/lib/google-maps-embed';

export default function GoogleBusinessSection() {
  const embedSrc = resolveGoogleMapsEmbedSrc();
  const reviewsUrl = resolveGoogleMapsReviewsUrl();

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="text-center mb-8">
        <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">Visit us</span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Office location &amp; Google reviews</h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm">
          Find Tempesttrek in Srinagar and read what travelers say on Google.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
          <iframe
            title="Tempesttrek office on Google Maps"
            src={embedSrc}
            className="w-full h-[320px] sm:h-[400px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-teal-50 border border-teal-100">
            <div className="bg-teal-100 p-3 rounded-full text-teal-600 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Our office</h3>
              <p className="text-gray-800 mt-1">{SITE_CONTACT.address}</p>
              <p className="text-sm text-gray-600 mt-1">{SITE_CONTACT.officeHours}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Google reviews</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              See ratings and reviews from guests who booked Kashmir trips with us. Your feedback on Google helps
              other travelers choose with confidence.
            </p>
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 text-sm transition-colors"
            >
              Read reviews on Google
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
