'use client';

import { useState, useEffect } from "react";
import { X, Plus, Trash, Loader2, Upload } from "lucide-react";
import { firebaseClient } from "@/lib/firebase-client";
import { uploadToBucket } from '@/lib/storage-upload';
import Image from "next/image";

interface AdminPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  placeData?: any;
}

export default function AdminPlaceModal({ isOpen, onClose, onSave, placeData }: AdminPlaceModalProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    tag: "",
    location: "",
    description: "",
    highlights: [] as string[],
    best_time: "",
    ideal_stay: "",
    hero_image: "",
    is_featured: false,
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (placeData) {
      setFormData({
        name: placeData.name || "",
        slug: placeData.slug || "",
        tag: placeData.tag || "",
        location: placeData.location || "",
        description: placeData.description || "",
        highlights: placeData.highlights || [],
        best_time: placeData.best_time || "",
        ideal_stay: placeData.ideal_stay || "",
        hero_image: placeData.hero_image || "",
        is_featured: placeData.is_featured || false,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        tag: "",
        location: "",
        description: "",
        highlights: [],
        best_time: "",
        ideal_stay: "",
        hero_image: "",
        is_featured: false,
      });
      setNewHighlight("");
    }
  }, [placeData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlight.trim()],
    }));
    setNewHighlight("");
  };

  const removeHighlight = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      highlights: prev.highlights.filter((_: string, i: number) => i !== idx),
    }));
  };

  // Hero Image Upload (Firebase Storage)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);
    try {
      const url = await uploadToBucket('places', 'hero', file);
      setFormData((prev: any) => ({ ...prev, hero_image: url }));
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (placeData?.id) {
        const { error } = await firebaseClient.from("places").update(formData).eq("id", placeData.id);
        if (error) throw error;
      } else {
        const slug =
          formData.slug ||
          formData.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        const { error } = await firebaseClient.from("places").insert([{ ...formData, slug }]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error: any) {
      alert("Error saving place: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {placeData ? "Edit Place" : "Add New Place"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="e.g. Srinagar"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="City of Lakes & Gardens"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Dal Lake, Mughal Gardens"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Best Time</label>
              <input
                type="text"
                name="best_time"
                value={formData.best_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="March – November"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ideal Stay</label>
              <input
                type="text"
                name="ideal_stay"
                value={formData.ideal_stay}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="2–3 Nights"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Short overview of the place..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highlights</label>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="e.g. Shikara Ride"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                <Plus size={16} />
                <span className="ml-1">Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.highlights?.map((h: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700"
                >
                  {h}
                  <button
                    type="button"
                    onClick={() => removeHighlight(idx)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
            <div className="flex items-center gap-4">
              {formData.hero_image && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image src={formData.hero_image} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload size={18} />
                <span>{loading ? "Uploading..." : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Or paste a URL below (optional)
            </p>
            <input
              type="text"
              name="hero_image"
              value={formData.hero_image}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl mt-2"
              placeholder="https://..."
            />
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
              Mark as Featured Place
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-xl hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Save Place
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


