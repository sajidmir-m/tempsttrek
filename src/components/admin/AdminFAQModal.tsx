'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { firebaseClient } from '@/lib/firebase-client';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
}

interface AdminFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  faqData?: FAQ | null;
}

export default function AdminFAQModal({ isOpen, onClose, onSave, faqData }: AdminFAQModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FAQ>({
    question: '',
    answer: '',
    category: 'General',
  });

  useEffect(() => {
    if (faqData) {
      setFormData(faqData);
    } else {
      setFormData({
        question: '',
        answer: '',
        category: 'General',
      });
    }
  }, [faqData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (faqData?.id) {
        // Update
        const { error } = await firebaseClient
          .from('chatbot_faqs')
          .update(formData)
          .eq('id', faqData.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await firebaseClient
          .from('chatbot_faqs')
          .insert([formData]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error: any) {
      alert('Error saving FAQ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {faqData ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input 
              required 
              type="text" 
              value={formData.question} 
              onChange={(e) => setFormData({...formData, question: e.target.value})} 
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
              placeholder="e.g. What is the best time to visit?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea 
              required 
              rows={4}
              value={formData.answer} 
              onChange={(e) => setFormData({...formData, answer: e.target.value})} 
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
              placeholder="e.g. The best time is..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="General">General</option>
              <option value="Pricing">Pricing</option>
              <option value="Services">Services</option>
              <option value="Booking">Booking</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2">
               {loading && <Loader2 className="animate-spin" size={18} />}
               Save FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
