import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy - Tempest Treks',
  description: 'Cancellation and refund information for Tempest Treks bookings.',
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen pb-16">
      <div className="bg-teal-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Refund Policy</h1>
        <p className="text-teal-100 mt-2 max-w-2xl mx-auto text-sm">
          Cancellation charges and refunds depend on your package, season, and supplier policies. The summary below
          is typical—your booking confirmation may state exact terms.
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray text-gray-800">
        <ul>
          <li>Refunds, if applicable, are processed to the original payment mode where possible.</li>
          <li>Third-party costs (hotels, flights, permits) already paid on your behalf may be non-refundable.</li>
          <li>Requests must be emailed with booking reference to info@tempesttreks.in.</li>
        </ul>
        <p>
          For detailed cancellation slabs, see also our{' '}
          <Link href="/terms" className="text-teal-700 font-medium">
            Terms &amp; conditions
          </Link>
          .
        </p>
        <p className="text-sm text-gray-600 not-prose">
          Replace this page with lawyer-reviewed text for your operating jurisdiction.
        </p>
        <p className="not-prose pt-6">
          <Link href="/contact" className="text-teal-700 font-semibold hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
