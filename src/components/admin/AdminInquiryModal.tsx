'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: any;
}

export default function AdminInquiryModal({ isOpen, onClose, inquiry }: AdminInquiryModalProps) {
  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Inquiry Details</h2>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{inquiry.name}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{inquiry.email}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{inquiry.phone}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(inquiry.created_at).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Package Info (if any) */}
          {inquiry.package_id && (
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
              <h3 className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">Interested Package</h3>
              <p className="font-bold text-teal-900 text-lg">
                Package ID: {inquiry.package_id}
              </p>
              {/* Note: In a real app we might pass the full package object or fetch it, 
                  but here we assume the admin can look it up or we just show the ID 
                  if we don't have the joined data readily available in this modal prop. 
                  (The parent has it, we can pass it if needed, but ID is often enough or we can enhance later)
               */}
            </div>
          )}

          {/* Message */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</h3>
            <div className="bg-white border border-gray-200 p-4 rounded-xl text-gray-700 leading-relaxed max-h-60 overflow-y-auto">
              {inquiry.message || "No message provided."}
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className="text-gray-600">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              inquiry.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {inquiry.status === 'read' ? 'Read' : 'Pending'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
