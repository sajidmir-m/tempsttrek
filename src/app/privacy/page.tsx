import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Tempest Treks',
  description: 'How Tempest Treks Tour & Travels handles your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pb-16">
      <div className="bg-teal-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        <p className="text-teal-100 mt-2 max-w-2xl mx-auto text-sm">
          We respect your privacy. This page summarises how we collect and use information when you use our website
          or book with Tempest Treks Tour and Travels — LIVE THE EXPERIENCE.
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray text-gray-800">
        <p>
          We may collect your name, phone number, email, and travel preferences when you submit an enquiry or
          booking. This data is used only to arrange your trip and communicate with you. We do not sell your details
          to third parties.
        </p>
        <p>
          Our site may use basic analytics to understand traffic. You can request correction or deletion of your
          personal data by contacting us at{' '}
          <a href="mailto:info@tempesttreks.in" className="text-teal-700 font-medium">
            info@tempesttreks.in
          </a>
          .
        </p>
        <p className="text-sm text-gray-600 not-prose">
          For full legal wording tailored to your business, have a lawyer review this draft.
        </p>
        <p className="not-prose pt-6">
          <Link href="/contact" className="text-teal-700 font-semibold hover:underline">
            Contact us
          </Link>
          {' · '}
          <Link href="/terms" className="text-teal-700 font-semibold hover:underline">
            Terms &amp; conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
