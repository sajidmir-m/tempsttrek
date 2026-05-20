'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AssignInquiryLead from '@/components/crm/inquiries/AssignInquiryLead';
import type { InquiryForLead } from '@/lib/inquiry-lead';

const SOURCE_LABELS: Record<string, string> = {
  'book-now': 'Book Now popup',
  contact: 'Contact page',
  'package-booking': 'Package booking',
  website: 'Website',
};

interface AdminInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryForLead & {
    created_at?: string;
    status?: string;
    package_id?: string | null;
    source?: string | null;
    assignee_email?: string | null;
    assigned_to?: string | null;
  } | null;
  isAdmin?: boolean;
  onAssigned?: () => void;
}

export default function AdminInquiryModal({
  isOpen,
  onClose,
  inquiry,
  isAdmin = true,
  onAssigned,
}: AdminInquiryModalProps) {
  if (!isOpen || !inquiry) return null;

  const sourceLabel = SOURCE_LABELS[inquiry.source || 'website'] || inquiry.source || 'Website';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500"
          type="button"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Website booking / inquiry</h2>
        <p className="text-sm text-teal-700 font-medium mb-6">{sourceLabel}</p>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-900 text-right">{inquiry.name}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900 text-right">{inquiry.email}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-900 text-right">{inquiry.phone}</span>
              </p>
              {inquiry.created_at && (
                <p className="flex justify-between gap-4">
                  <span className="text-gray-600">Submitted</span>
                  <span className="font-medium text-gray-900 text-right">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          </div>

          {(inquiry.hotel_requirement || inquiry.check_in) && (
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-sm space-y-1">
              {inquiry.hotel_requirement && (
                <p>
                  <span className="text-teal-700 font-semibold">Requirement: </span>
                  {inquiry.hotel_requirement}
                </p>
              )}
              {(inquiry.check_in || inquiry.check_out) && (
                <p>
                  <span className="text-teal-700 font-semibold">Dates: </span>
                  {inquiry.check_in || '—'} → {inquiry.check_out || '—'}
                </p>
              )}
            </div>
          )}

          {inquiry.package_id && (
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
              <h3 className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-1">Package</h3>
              <p className="font-bold text-teal-900">Package ID: {inquiry.package_id}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</h3>
            <div className="bg-white border border-gray-200 p-4 rounded-xl text-gray-700 leading-relaxed max-h-48 overflow-y-auto text-sm">
              {inquiry.message || 'No message provided.'}
            </div>
          </div>

          {inquiry.assignee_email && (
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Currently assigned:</span> {inquiry.assignee_email}
            </p>
          )}

          {isAdmin && (
            <AssignInquiryLead
              inquiry={inquiry}
              currentAssigneeId={inquiry.assigned_to}
              onAssigned={() => onAssigned?.()}
            />
          )}

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <Link
              href="/crm/manage-inquiries"
              className="text-sm font-semibold text-teal-700 hover:underline"
            >
              Open CRM Inquiries →
            </Link>
            {inquiry.lead_id && (
              <Link href="/crm/manage-leads" className="text-sm font-semibold text-teal-700 hover:underline">
                Open lead →
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
