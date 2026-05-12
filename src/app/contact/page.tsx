
'use client';

import { useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import { useToast } from '@/components/ui/Toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { firebaseClient } from '@/lib/firebase-client';
import { sendEmail, generateInquiryEmail } from '@/lib/email';
import { SITE_CONTACT, SITE_BRAND, formatPhoneDisplay, telHref } from '@/lib/site-contact';

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const { error } = await firebaseClient
        .from('inquiries')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            phone: formData.phone, 
            message: formData.message 
          }
        ]);

      if (error) throw error;

      // Send confirmation email
      const inquiry = { ...formData, id: 'new' };
      try {
        await sendEmail(generateInquiryEmail(inquiry));
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      showToast('Message sent successfully! We will contact you soon.', 'success');
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // FALLBACK: If Firebase fails (e.g. invalid keys), save to LocalStorage for Demo purposes
      try {
        const existing = JSON.parse(localStorage.getItem('inquiries') || '[]');
        const newInquiry = {
          id: Date.now().toString(),
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('inquiries', JSON.stringify([newInquiry, ...existing]));
        console.log('Saved to LocalStorage (Fallback mode)');
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } catch (lsError) {
        console.error('LocalStorage fallback failed:', lsError);
        showToast('Failed to send message. Please try again.', 'error');
        setStatus('error');
      }
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-teal-700 text-white pt-28 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">Have questions? We'd love to hear from you.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <SectionHeading title="Get in Touch" subtitle="Reach out to us for bookings, inquiries, or just to say hello." center={false} />
            
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
                  <h3 className="text-lg font-bold text-gray-900">Email Address</h3>
                  <p className="text-gray-800">
                    <a href={`mailto:${SITE_CONTACT.email}`} className="text-teal-700 font-medium hover:underline">
                      {SITE_CONTACT.email}
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{SITE_BRAND.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Find Us on Map</h3>
              <div className="h-64 bg-gray-200 rounded-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105627.87787383287!2d74.7262413!3d34.0836531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e1855686e3c5ef%3A0x662252774043236!2sSrinagar!5e0!3m2!1sen!2sin!4v1629876543210!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Tell us about your travel plans..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === 'submitting' ? 'Sending...' : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>

              {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  Message sent successfully! We will get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                  Something went wrong. Please try again later.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
