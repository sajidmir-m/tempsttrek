'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import StorageUploadField from '@/components/admin/StorageUploadField';

type CarRow = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  seats: number | null;
  transmission: string;
  fuel: string;
  price_per_day: number | null;
  price_per_km: number | null;
  image_url: string;
  features: string[];
  is_available: boolean;
  sort_order: number;
};

export default function AdminCarModal({
  isOpen,
  onClose,
  onSave,
  carData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  carData?: CarRow | null;
}) {
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<CarRow>({
    name: '',
    slug: '',
    category: 'Sedan',
    seats: 4,
    transmission: 'Manual',
    fuel: 'Diesel',
    price_per_day: null,
    price_per_km: null,
    image_url: '',
    features: [],
    is_available: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (carData) {
      setFormData({
        name: carData.name || '',
        slug: carData.slug || '',
        category: carData.category || 'Sedan',
        seats: carData.seats ?? 4,
        transmission: carData.transmission || 'Manual',
        fuel: carData.fuel || 'Diesel',
        price_per_day: carData.price_per_day ?? null,
        price_per_km: carData.price_per_km ?? null,
        image_url: carData.image_url || '',
        features: carData.features || [],
        is_available: carData.is_available ?? true,
        sort_order: carData.sort_order ?? 0,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        category: 'Sedan',
        seats: 4,
        transmission: 'Manual',
        fuel: 'Diesel',
        price_per_day: null,
        price_per_km: null,
        image_url: '',
        features: [],
        is_available: true,
        sort_order: 0,
      });
      setNewFeature('');
    }
  }, [isOpen, carData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? null
            : Number(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }) as CarRow);
  };

  const addFeature = () => {
    const v = newFeature.trim();
    if (!v) return;
    setFormData((p) => ({ ...p, features: [...(p.features || []), v] }));
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setFormData((p) => ({ ...p, features: (p.features || []).filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = formData.slug?.trim()
        ? formData.slug.trim()
        : formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const payload = { ...formData, slug };

      if (carData?.id) {
        const { error } = await supabase.from('cars').update(payload).eq('id', carData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cars').insert([payload]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert('Error saving car: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">{carData ? 'Edit Car' : 'Add New Car'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Car name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. Toyota Etios" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
              <input name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="auto-generated-if-empty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl">
                <option>Sedan</option>
                <option>SUV</option>
                <option>4x4</option>
                <option>SUV/MPV</option>
                <option>Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
              <input type="number" name="seats" value={formData.seats ?? ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl">
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel</label>
              <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl">
                <option>Diesel</option>
                <option>Petrol</option>
                <option>CNG</option>
                <option>Electric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per day (₹)</label>
              <input type="number" name="price_per_day" value={formData.price_per_day ?? ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per km (₹)</label>
              <input type="number" name="price_per_km" value={formData.price_per_km ?? ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (or public path)</label>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full flex-1 px-4 py-2 border rounded-xl"
                  placeholder="/videos/adventure-1.png or Supabase public URL"
                />
                <StorageUploadField
                  bucket="cars"
                  folder="fleet"
                  accept="image/*"
                  label="Upload image"
                  onUploaded={(url) => setFormData((p) => ({ ...p, image_url: url }))}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Uses bucket <code className="text-[11px] bg-gray-50 px-1 rounded">cars</code> (create as public). Admin-only delete from storage.
              </p>
              {formData.image_url?.trim() ? (
                <div className="mt-3 relative h-44 rounded-xl overflow-hidden border border-gray-100">
                  <Image src={formData.image_url} alt="Preview" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} />
                Available
              </label>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort</label>
                <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="w-24 px-3 py-2 border rounded-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-bold text-gray-800">Features</h3>
              <div className="flex items-center gap-2">
                <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="px-3 py-2 border rounded-xl text-sm" placeholder="e.g. AC" />
                <button type="button" onClick={addFeature} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.features || []).length === 0 ? (
                <p className="text-sm text-gray-500">No features added.</p>
              ) : (
                (formData.features || []).map((f, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full">
                    {f}
                    <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-70 inline-flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {carData ? 'Update car' : 'Create car'}
          </button>
        </form>
      </div>
    </div>
  );
}

