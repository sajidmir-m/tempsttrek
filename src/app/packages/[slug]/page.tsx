'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Check, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { firebaseClient } from '@/lib/firebase-client';
import { useToast } from '@/components/ui/Toast';
import { sendEmail, generateInquiryEmail, generateBookingConfirmationEmail } from '@/lib/email';

import { MOCK_PACKAGES } from '@/data/packages';
import { formatInr } from '@/lib/format-currency';

function getMockPackage(slug: string) {
  return MOCK_PACKAGES.find(p => p.slug === slug);
}

export default function PackageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  
  const [pkg, setPkg] = useState<any>(null);
  const [packageImages, setPackageImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const { data, error } = await firebaseClient
          .from('packages')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setPkg(data);
          // Fetch package images
          const { data: images } = await firebaseClient
            .from('package_images')
            .select('*')
            .eq('package_id', data.id)
            .order('created_at', { ascending: true });
          
          if (images && images.length > 0) {
            setPackageImages(images);
          } else if (data.featured_image) {
            // Use featured image as fallback
            setPackageImages([{ image_url: data.featured_image, caption: data.title }]);
          }
        } else {
          const mockPkg = getMockPackage(slug);
          setPkg(mockPkg);
          if (mockPkg?.featured_image) {
            setPackageImages([{ image_url: mockPkg.featured_image, caption: mockPkg.title }]);
          }
        }
      } catch (err) {
        console.error('Error fetching package:', err);
        const mockPkg = getMockPackage(slug);
        setPkg(mockPkg);
        if (mockPkg?.featured_image) {
          setPackageImages([{ image_url: mockPkg.featured_image, caption: mockPkg.title }]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [slug]);

  // Handle booking form
  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    const formData = new FormData(e.currentTarget);
    
    try {
      // Prepare payload
      const payload: any = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        // travel_date is not in schema, so we append it to message
        message: `Booking Inquiry for: ${pkg?.title}\nTravel Date: ${formData.get('date')}`, 
      };

      // Only include package_id if it's a valid UUID (Real Firebase Data)
      if (pkg?.id && pkg.id.length > 20) {
        payload.package_id = pkg.id;
      }

      const { data, error } = await firebaseClient
        .from('inquiries')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      // Send confirmation email
      try {
        const inquiry = {
          id: data.id,
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          message: payload.message,
        };
        await sendEmail(generateInquiryEmail(inquiry, pkg));
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      setBookingId(data.id);
      setFormStatus('success');
      showToast('Booking inquiry submitted! Check your email for confirmation.', 'success');
      
      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        router.push(`/booking-confirmation/${data.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Firebase submission failed, falling back to local storage:', err.message || err);
      
      // FALLBACK: Save to LocalStorage for Demo
      try {
        const existing = JSON.parse(localStorage.getItem('inquiries') || '[]');
        const newInquiry = {
          id: Date.now().toString(),
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: `Booking Inquiry for: ${pkg?.title}\nTravel Date: ${formData.get('date')}`,
          package_id: pkg?.id,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('inquiries', JSON.stringify([newInquiry, ...existing]));
        setFormStatus('success');
      } catch (lsError) {
        console.error('LocalStorage fallback failed:', lsError);
        setFormStatus('error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
          <p className="text-gray-800 mb-6">The package you're looking for doesn't exist.</p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            Browse All Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={packageImages.length > 0 ? packageImages[0].image_url : pkg.featured_image}
          alt={pkg.title}
          fill
          className="object-cover cursor-pointer"
          onClick={() => setSelectedImage(packageImages.length > 0 ? packageImages[0].image_url : pkg.featured_image)}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pkg.title}</h1>
          <div className="flex flex-wrap gap-6 text-lg">
            <div className="flex items-center gap-2">
              <Clock />
              <span>{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin />
              <span>{pkg.location}</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-teal-300">
              <span>Starting from ₹{formatInr(Number(pkg.price))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {packageImages.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Photo Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {packageImages.map((img: any, idx: number) => (
                <div
                  key={idx}
                  className="relative h-24 md:h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || `Gallery image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XCircle size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Gallery view"
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${activeTab === 'itinerary' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('inclusions')}
              className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${activeTab === 'inclusions' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Inclusions & Exclusions
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            {activeTab === 'itinerary' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-6">Day Wise Itinerary</h2>
                {pkg.itinerary?.map((day: any) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {day.day}
                      </div>
                      <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{day.title}</h3>
                      <p className="text-gray-800">{day.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inclusions' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    <Check size={24} /> Inclusions
                  </h3>
                  <ul className="space-y-3">
                    {pkg.inclusions?.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <Check size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                    <X size={24} /> Exclusions
                  </h3>
                  <ul className="space-y-3">
                    {pkg.exclusions?.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <X size={18} className="text-red-600 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8 border border-teal-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Book This Tour</h3>
            
            {formStatus === 'success' ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                <p className="font-bold text-lg mb-2">Thank You!</p>
                <p>We have received your inquiry. Our team will contact you shortly.</p>
                <button 
                  onClick={() => setFormStatus('idle')}
                  className="mt-4 text-sm underline hover:text-green-800"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+91 9876543210" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                  <input type="date" name="date" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>

                <button 
                  type="submit" 
                  disabled={formStatus === 'submitting'}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formStatus === 'submitting' ? 'Sending...' : 'Send Inquiry'}
                </button>

                <p className="text-xs text-center text-gray-700 mt-4">
                  *No payment required now. We will customize the package for you.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
