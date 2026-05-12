
import SectionHeading from '@/components/ui/SectionHeading';
import Link from 'next/link';
import { FileText, Shield, AlertCircle, CreditCard, RefreshCcw } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions - Tempesttrek',
  description: 'Read our terms and conditions regarding bookings, cancellations, refunds, and privacy policies.',
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-teal-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-teal-100 text-lg">Please read these terms carefully before booking your trip.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          
          {/* Section 1: Introduction */}
          <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-800 leading-relaxed">
                  Welcome to Tempesttrek. By booking a tour or using our services, you agree to comply with and be bound by the following terms and conditions. These terms apply to all bookings made through our website, via phone, or in person.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Booking & Payment */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-teal-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">2. Booking & Payment Policy</h2>
            </div>
            <div className="prose prose-lg text-gray-800 pl-10">
              <ul className="space-y-3 list-disc">
                <li>A deposit of <strong>30% of the total tour cost</strong> is required at the time of booking to confirm your reservation.</li>
                <li>The remaining balance must be paid <strong>7 days prior</strong> to the trip start date.</li>
                <li>For bookings made less than 7 days before departure, full payment is required immediately.</li>
                <li>We accept payments via Bank Transfer, UPI, and major Credit/Debit cards.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Cancellation & Refund */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <RefreshCcw className="text-teal-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">3. Cancellation & Refund Policy</h2>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 ml-10">
              <p className="text-red-800 font-medium mb-4">Cancellation charges apply as follows:</p>
              <ul className="space-y-2 text-red-700/80">
                <li className="flex justify-between">
                  <span>30 days or more before departure:</span>
                  <span className="font-bold">10% of total cost</span>
                </li>
                <li className="flex justify-between">
                  <span>15-29 days before departure:</span>
                  <span className="font-bold">30% of total cost</span>
                </li>
                <li className="flex justify-between">
                  <span>7-14 days before departure:</span>
                  <span className="font-bold">50% of total cost</span>
                </li>
                <li className="flex justify-between">
                  <span>Less than 7 days before departure:</span>
                  <span className="font-bold">100% (No Refund)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Liability */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-teal-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">4. Liability & Responsibility</h2>
            </div>
            <div className="prose prose-lg text-gray-800 pl-10">
              <p className="mb-4">
                Tempesttrek acts only as an agent for the various independent suppliers that provide hotel accommodations, transportation, sightseeing, activities, or other services connected with this itinerary.
              </p>
              <p>
                We shall not be held liable for any loss, damage, injury, delay, or irregularity that may be occasioned by any defect in any vehicle, or through the acts or defaults of any company or person engaged in conveying the passenger or in carrying out the arrangements of the tour.
              </p>
            </div>
          </section>

          {/* Section 5: Jurisdiction */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-teal-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">5. Jurisdiction</h2>
            </div>
            <div className="prose prose-lg text-gray-800 pl-10">
              <p>
                Any disputes arising out of or in connection with these terms and conditions shall be subject to the exclusive jurisdiction of the courts in <strong>Srinagar, Jammu & Kashmir</strong>.
              </p>
            </div>
          </section>

          <div className="pt-10 border-t border-gray-200 mt-12">
            <p className="text-center text-gray-700 mb-6">Have questions about our terms?</p>
            <div className="flex justify-center">
              <Link 
                href="/contact" 
                className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
