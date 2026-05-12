'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash, Loader2 } from 'lucide-react';
import { firebaseClient } from '@/lib/firebase-client';
import { uploadToBucket } from '@/lib/storage-upload';
import Image from 'next/image';

interface Package {
  id?: string;
  title: string;
  slug: string;
  duration: string;
  price: number;
  location: string;
  description: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: any[];
  is_popular: boolean;
  featured_image: string;
}

interface AdminPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  packageData?: Package | null;
}

export default function AdminPackageModal({ isOpen, onClose, onSave, packageData }: AdminPackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Package>({
    title: '',
    slug: '',
    duration: '',
    price: 0,
    location: '',
    description: '',
    inclusions: [],
    exclusions: [],
    itinerary: [],
    is_popular: false,
    featured_image: '',
  });

  // State for temporary inputs
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  
  // Itinerary state
  const [itineraryDay, setItineraryDay] = useState({ day: 1, title: '', desc: '' });

  useEffect(() => {
    if (packageData) {
      setFormData(packageData);
    } else {
      // Reset form for new package
      setFormData({
        title: '',
        slug: '',
        duration: '',
        price: 0,
        location: '',
        description: '',
        inclusions: [],
        exclusions: [],
        itinerary: [],
        is_popular: false,
        featured_image: '',
      });
    }
  }, [packageData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, is_popular: e.target.checked }));
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);
    try {
      const url = await uploadToBucket('packages', 'featured', file);
      setFormData((prev) => ({ ...prev, featured_image: url }));
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // List Management (Inclusions/Exclusions)
  const addItem = (type: 'inclusions' | 'exclusions') => {
    const value = type === 'inclusions' ? newInclusion : newExclusion;
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value]
    }));
    
    if (type === 'inclusions') setNewInclusion('');
    else setNewExclusion('');
  };

  const removeItem = (type: 'inclusions' | 'exclusions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Itinerary Management
  const addItineraryDay = () => {
    if (!itineraryDay.title || !itineraryDay.desc) return;

    setFormData(prev => {
      const nextIndex = prev.itinerary.length;
      const newItinerary = [
        ...prev.itinerary,
        { ...itineraryDay, day: nextIndex + 1 },
      ];

      // Normalize day numbers so they are always 1..N in order
      const normalized = newItinerary.map((d, idx) => ({
        ...d,
        day: idx + 1,
      }));

      return {
      ...prev,
        itinerary: normalized,
      };
    });

    // Reset input fields; the "Add Day X" label is based on formData.itinerary.length + 1
    setItineraryDay({ day: 0, title: '', desc: '' });
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => {
      const filtered = prev.itinerary.filter((_, i) => i !== index);
      const normalized = filtered.map((d, idx) => ({
        ...d,
        day: idx + 1,
      }));

      return {
      ...prev,
        itinerary: normalized,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (packageData?.id) {
        // Update
        const { error } = await firebaseClient
          .from('packages')
          .update(formData)
          .eq('id', packageData.id);
        if (error) throw error;
      } else {
        // Create
        // Generate slug from title if empty
        const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const { error } = await firebaseClient
          .from('packages')
          .insert([{ ...formData, slug }]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error: any) {
      alert('Error saving package: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {packageData ? 'Edit Package' : 'Add New Package'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Title</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. Kashmir Delight" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="auto-generated-if-empty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input required type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. 5D/4N" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
               <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. Srinagar, Gulmarg, Pahalgam" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-xl" />
          </div>

          {/* Image Upload */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
             <div className="flex items-center gap-4">
                {formData.featured_image && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                    <Image src={formData.featured_image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload size={18} />
                  <span>{loading ? 'Uploading...' : 'Upload Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
                </label>
             </div>
          </div>

          {/* Inclusions / Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Add inclusion" />
                <button type="button" onClick={() => addItem('inclusions')} className="p-2 bg-green-600 text-white rounded-lg"><Plus size={18} /></button>
              </div>
              <ul className="space-y-1">
                {formData.inclusions.map((item, idx) => (
                  <li key={idx} className="flex justify-between bg-white p-2 rounded border text-sm">
                    {item}
                    <button type="button" onClick={() => removeItem('inclusions', idx)} className="text-red-500"><Trash size={14} /></button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Exclusions</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Add exclusion" />
                <button type="button" onClick={() => addItem('exclusions')} className="p-2 bg-red-600 text-white rounded-lg"><Plus size={18} /></button>
              </div>
              <ul className="space-y-1">
                {formData.exclusions.map((item, idx) => (
                  <li key={idx} className="flex justify-between bg-white p-2 rounded border text-sm">
                    {item}
                    <button type="button" onClick={() => removeItem('exclusions', idx)} className="text-red-500"><Trash size={14} /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Itinerary */}
          <div className="border p-4 rounded-xl">
             <h3 className="font-bold mb-4">Itinerary</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Day Title" value={itineraryDay.title} onChange={e => setItineraryDay({...itineraryDay, title: e.target.value})} className="px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Description" value={itineraryDay.desc} onChange={e => setItineraryDay({...itineraryDay, desc: e.target.value})} className="px-3 py-2 border rounded-lg md:col-span-2" />
             </div>
             <button type="button" onClick={addItineraryDay} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
                <Plus size={16} /> Add Day {formData.itinerary.length + 1}
             </button>
             
             <div className="space-y-2">
                {formData.itinerary.map((day: any, idx) => (
                   <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg border">
                      <span className="font-bold w-16">Day {day.day}</span>
                      <div className="flex-1">
                         <p className="font-semibold">{day.title}</p>
                         <p className="text-sm text-gray-600">{day.desc}</p>
                      </div>
                      <button type="button" onClick={() => removeItineraryDay(idx)} className="text-red-500"><Trash size={16} /></button>
                   </div>
                ))}
             </div>
          </div>

          {/* Popular Toggle */}
          <div className="flex items-center gap-2">
             <input type="checkbox" id="is_popular" checked={formData.is_popular} onChange={handleCheckbox} className="w-5 h-5 text-teal-600" />
             <label htmlFor="is_popular" className="font-medium text-gray-700">Mark as Popular Package</label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2">
               {loading && <Loader2 className="animate-spin" size={18} />}
               Save Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
