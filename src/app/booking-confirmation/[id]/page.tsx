'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Package, Calendar, MapPin, Phone, Mail, Download } from 'lucide-react';
import Link from 'next/link';

export default function BookingConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select(`
            *,
            packages (
              id,
              title,
              slug,
              duration,
              price,
              location,
              featured_image
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setBooking(data);
        } else {
          // Try localStorage
          if (typeof window !== 'undefined') {
            const localInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
            const found = localInquiries.find((b: any) => b.id === id);
            if (found) setBooking(found);
          }
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBooking();
    }
  }, [id]);

  const handleDownloadPDF = () => {
    // In production, generate and download PDF
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-800 mb-6">The booking you're looking for doesn't exist.</p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-800">Thank you for choosing Tempesttrek</p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Download size={18} />
              Download
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-700 mb-1">Booking ID</p>
              <p className="font-mono font-bold text-gray-900">{booking.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Booking Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(booking.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {booking.packages && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={24} />
                Package Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">{booking.packages.title}</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar size={18} />
                    <span>{booking.packages.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <MapPin size={18} />
                    <span>{booking.packages.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-teal-600">
                    ₹{booking.packages.price?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{booking.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{booking.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {booking.message && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Message</h3>
              <p className="text-gray-700 whitespace-pre-line">{booking.message}</p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-teal-50 rounded-2xl p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Our travel expert will contact you within 24 hours to discuss your itinerary.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>We'll customize the package according to your preferences and provide a detailed quote.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Once confirmed, you can make the payment and receive your travel vouchers.</span>
            </li>
          </ol>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-800 mb-6">Our team is here to assist you with any questions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/919906646113"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <Phone size={18} />
              Our WhatsApp: +91 9906646113
            </a>
            <a
              href="mailto:mirbabatourtravels@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              <Mail size={18} />
              Email Us
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link
            href="/bookings"
            className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            View All Bookings
          </Link>
          <Link
            href="/packages"
            className="flex-1 text-center px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            Browse More Packages
          </Link>
        </div>
      </div>
    </div>
  );
}

