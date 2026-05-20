
'use client';

import { useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import { useToast } from '@/components/ui/Toast';
import { Mail, Phone, MapPin, Send, Calendar, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sendEmail, generateInquiryEmail } from '@/lib/email';
import { SITE_CONTACT, SITE_BRAND, formatPhoneDisplay, telHref } from '@/lib/site-contact';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  hotel_requirement: '',
  check_in: '',
  check_out: '',
  message: '',
};

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) return 'Valid phone number is required';
    if (formData.check_in && formData.check_out && formData.check_out < formData.check_in) {
      return 'Check-out must be after check-in';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showToast(err, 'error');
      return;
    }
    setStatus('submitting');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim() || null,
        address: formData.address.trim() || null,
        hotel_requirement: formData.hotel_requirement.trim() || null,
        check_in: formData.check_in || null,
        check_out: formData.check_out || null,
        source: 'contact',
        status: 'pending',
      };

      const { error } = await supabase.from('inquiries').insert([payload]);
      if (error) throw error;

      try {
        await sendEmail(generateInquiryEmail({ ...formData, id: 'new' }));
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      showToast('Your inquiry was submitted. Our team will contact you shortly.', 'success');
      setStatus('success');
      setFormData(initialForm);
    } catch (error) {
      console.error('Error submitting form:', error);
      try {
        const existing = JSON.parse(localStorage.getItem('inquiries') || '[]');
        const newInquiry = {
          id: Date.now().toString(),
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('inquiries', JSON.stringify([newInquiry, ...existing]));
        setStatus('success');
        setFormData(initialForm);
        showToast('Saved locally (demo mode). Connect Supabase for live CRM sync.', 'info');
      } catch {
        showToast('Failed to send inquiry. Please try again.', 'error');
        setStatus('error');
      }
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-teal-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">
          Plan your Kashmir trip — share your hotel needs, travel dates, and we will respond promptly.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading title="Get in Touch" subtitle="Reach out for bookings, hotel requirements, or custom itineraries." center={false} />

            <div className="space-y-8 mt-8">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Our Office</h3>
                  <p className="text-gray-800">{SITE_CONTACT.address}</p>
                  <p className="text-sm text-gray-600 mt-1">{SITE_CONTACT.officeHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Phone Numbers</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">24×7 Helpline:</span>{' '}
                    <a className="text-teal-700 font-medium hover:underline" href={telHref(SITE_CONTACT.helpline24)}>
                      {formatPhoneDisplay(SITE_CONTACT.helpline24)}
                    </a>
                  </p>
                  <ul className="space-y-1 text-gray-800">
                    {SITE_CONTACT.phones.map((num) => (
                      <li key={num}>
                        <a href={telHref(num)} className="hover:text-teal-700 font-medium">
                          {formatPhoneDisplay(num)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Email</h3>
                  <a href={`mailto:${SITE_CONTACT.email}`} className="text-teal-700 font-medium hover:underline">
                    {SITE_CONTACT.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send an Inquiry</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your request is logged in our CRM and assigned to our travel team at {SITE_BRAND.shortName}.
            </p>

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We have received your inquiry and will be in touch soon.</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-teal-700 font-semibold hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      name="phone"
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="10-digit mobile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      name="email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="City, state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Building2 size={14} /> Hotel Requirement
                  </label>
                  <input
                    name="hotel_requirement"
                    value={formData.hotel_requirement}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="e.g. 4-star in Gulmarg, houseboat in Srinagar"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar size={14} /> Check-in
                    </label>
                    <input
                      name="check_in"
                      type="date"
                      value={formData.check_in}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <input
                      name="check_out"
                      type="date"
                      value={formData.check_out}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                    placeholder="Tell us about your trip plans…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Sending…' : (
                    <>
                      <Send size={18} /> Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
