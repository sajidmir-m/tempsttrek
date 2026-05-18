'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/Toast';
import { PackageCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Package, Calendar, MapPin, Phone, Mail, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import CrmEntityDetailModal from '@/components/crm/details/CrmEntityDetailModal';
import Link from 'next/link';

export default function CustomerPortal() {
  const router = useRouter();
  const { showToast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [detailBooking, setDetailBooking] = useState<any | null>(null);

  useEffect(() => {
    // Check for session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      if (session) {
        fetchBookings(session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      if (session) {
        fetchBookings(session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBookings = async (userEmail: string) => {
    try {
      // Fetch inquiries by email
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
        .eq('email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      // Try localStorage fallback
      if (typeof window !== 'undefined') {
        const localInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
        const userBookings = localInquiries.filter((b: any) => b.email === userEmail);
        setBookings(userBookings);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Try to find bookings by email or phone
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
        .or(`email.eq.${email},phone.eq.${phone}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setBookings(data);
        showToast('Bookings found!', 'success');
      } else {
        // Try localStorage
        if (typeof window !== 'undefined') {
          const localInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
          const userBookings = localInquiries.filter(
            (b: any) => b.email === email || b.phone === phone
          );
          if (userBookings.length > 0) {
            setBookings(userBookings);
            showToast('Bookings found!', 'success');
          } else {
            showToast('No bookings found with these details.', 'info');
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      showToast('Error fetching bookings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'booked':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'contacted':
        return <Clock className="text-blue-600" size={20} />;
      case 'closed':
        return <XCircle className="text-gray-800" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!session && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-teal-800 mb-2">My Bookings</h1>
          <p className="text-gray-800 mb-6">View your booking status and details</p>
          
          <form onSubmit={handleGuestAccess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder="+91 9876543210"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-70"
            >
              {loading ? 'Loading...' : 'View My Bookings'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-xl opacity-90">Track and manage your tour bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-800 mb-6">You haven't made any bookings yet.</p>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {booking.packages?.featured_image && (
                          <img
                            src={booking.packages.featured_image}
                            alt={booking.packages.title}
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {booking.packages?.title || 'Custom Package'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)} flex items-center gap-1`}>
                              {getStatusIcon(booking.status)}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          {booking.packages && (
                            <div className="flex flex-wrap gap-4 text-sm text-gray-800 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {booking.packages.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={16} />
                                {booking.packages.location}
                              </span>
                              <span className="font-bold text-teal-600">
                                ₹{booking.packages.price?.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-700 mb-2">
                            Booking ID: <span className="font-mono">{booking.id}</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            Submitted: {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Your Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            {booking.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            {booking.phone}
                          </div>
                        </div>
                        {booking.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{booking.message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailBooking(booking)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                      >
                        <Eye size={16} /> View Details
                      </button>
                      {booking.packages?.slug && (
                        <Link
                          href={`/packages/${booking.packages.slug}`}
                          className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-medium hover:bg-teal-100 transition-colors text-center"
                        >
                          View Package
                        </Link>
                      )}
                      <a
                        href="https://wa.me/917006796123"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-center"
                      >
                        Our WhatsApp: +91 7006796123
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CrmEntityDetailModal
        open={detailBooking != null}
        title={detailBooking?.packages?.title || 'Booking details'}
        subtitle={detailBooking?.name}
        onClose={() => setDetailBooking(null)}
        sections={[
          {
            heading: 'Booking information',
            fields: detailBooking
              ? [
                  { label: 'Status', value: detailBooking.status },
                  { label: 'Booking ID', value: detailBooking.id },
                  { label: 'Submitted', value: new Date(detailBooking.created_at).toLocaleString() },
                  { label: 'Package', value: detailBooking.packages?.title || 'Custom' },
                ]
              : [],
          },
          {
            heading: 'Customer data',
            fields: detailBooking
              ? [
                  { label: 'Name', value: detailBooking.name },
                  { label: 'Email', value: detailBooking.email },
                  { label: 'Phone', value: detailBooking.phone },
                  { label: 'Message', value: detailBooking.message || '—' },
                ]
              : [],
          },
          {
            heading: 'Payment history',
            fields: detailBooking
              ? [
                  { label: 'Package price', value: detailBooking.packages?.price ? `₹${Number(detailBooking.packages.price).toLocaleString()}` : 'On request' },
                  { label: 'Payment', value: 'Contact office for payment status' },
                ]
              : [],
          },
        ]}
      />
    </div>
  );
}

