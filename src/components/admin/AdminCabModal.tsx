'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Trash, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StorageUploadField from '@/components/admin/StorageUploadField';

type CabForm = {
  name: string;
  slug: string;
  description: string;
  duration: string;
  starting_from: string;
  vehicle_type: string;
  ideal_for: string;
  routes: string[];
  image_url: string;
  is_featured: boolean;
};

const emptyForm: CabForm = {
  name: '',
  slug: '',
  description: '',
  duration: '',
  starting_from: '',
  vehicle_type: '',
  ideal_for: '',
  routes: [],
  image_url: '',
  is_featured: false,
};

interface AdminCabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cabData?: Record<string, unknown> | null;
}

export default function AdminCabModal({ isOpen, onClose, onSave, cabData }: AdminCabModalProps) {
  const [formData, setFormData] = useState<CabForm>(emptyForm);
  const [newRoute, setNewRoute] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (cabData?.id) {
      setFormData({
        name: String(cabData.name || ''),
        slug: String(cabData.slug || ''),
        description: String(cabData.description || ''),
        duration: String(cabData.duration || ''),
        starting_from: String(cabData.starting_from || ''),
        vehicle_type: String(cabData.vehicle_type || ''),
        ideal_for: String(cabData.ideal_for || ''),
        routes: Array.isArray(cabData.routes) ? (cabData.routes as string[]) : [],
        image_url: String(cabData.image_url || ''),
        is_featured: Boolean(cabData.is_featured),
      });
    } else {
      setFormData(emptyForm);
      setNewRoute('');
    }
  }, [cabData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const addRoute = () => {
    if (!newRoute.trim()) return;
    setFormData((prev) => ({
      ...prev,
      routes: [...(prev.routes || []), newRoute.trim()],
    }));
    setNewRoute('');
  };

  const removeRoute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug =
        formData.slug.trim() ||
        formData.name
          .trim()
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
      const payload = {
        name: formData.name.trim(),
        slug,
        description: formData.description.trim() || null,
        duration: formData.duration.trim() || null,
        starting_from: formData.starting_from.trim() || null,
        vehicle_type: formData.vehicle_type.trim() || null,
        ideal_for: formData.ideal_for.trim() || null,
        routes: formData.routes,
        image_url: formData.image_url.trim() || null,
        is_featured: formData.is_featured,
        updated_at: new Date().toISOString(),
      };

      if (cabData?.id) {
        const { error } = await supabase.from('cabs').update(payload).eq('id', String(cabData.id));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cabs').insert([payload]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert('Error saving cab plan: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">{cabData?.id ? 'Edit Cab Plan' : 'Add New Cab Plan'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="e.g. Srinagar Local Sightseeing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="auto-generated-if-empty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="e.g. Full Day, 3–7 Days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting From</label>
              <input
                type="text"
                name="starting_from"
                value={formData.starting_from}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="e.g. ₹3,500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <input
                type="text"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Sedan / SUV / Tempo Traveller"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ideal For</label>
              <input
                type="text"
                name="ideal_for"
                value={formData.ideal_for}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Families, Honeymooners, Groups"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero image URL or path</label>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full flex-1 px-4 py-2 border rounded-xl"
                placeholder="/videos/adventure-1.png or Supabase public URL"
              />
              <StorageUploadField
                bucket="cabs"
                folder="plans"
                accept="image/*"
                label="Upload image"
                disabled={loading}
                onUploaded={(url) => setFormData((p) => ({ ...p, image_url: url }))}
              />
            </div>
            {formData.image_url?.trim() ? (
              <div className="mt-3 relative h-44 rounded-xl overflow-hidden border border-gray-100">
                <Image src={formData.image_url.trim()} alt="" fill className="object-cover" sizes="400px" />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Short description of this cab plan..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Overview (Badges)</label>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="e.g. Srinagar → Gulmarg → Srinagar"
              />
              <button
                type="button"
                onClick={addRoute}
                className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                <Plus size={16} />
                <span className="ml-1">Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.routes?.map((r, idx) => (
                <span
                  key={`${r}-${idx}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700"
                >
                  {r}
                  <button type="button" onClick={() => removeRoute(idx)} className="text-red-500 hover:text-red-600">
                    <Trash size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleCheckbox}
              className="w-5 h-5 text-teal-600"
            />
            <label htmlFor="is_featured" className="font-medium text-gray-700">
              Mark as Featured Cab Plan
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Save Cab Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
