import { useState, useEffect } from "react";
import { X, Plus, Trash, Loader2 } from "lucide-react";
import { firebaseClient } from "@/lib/firebase-client";

interface AdminCabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cabData?: any;
}

export default function AdminCabModal({ isOpen, onClose, onSave, cabData }: AdminCabModalProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    description: "",
    duration: "",
    starting_from: "",
    vehicle_type: "",
    ideal_for: "",
    routes: [] as string[],
    is_featured: false,
  });
  const [newRoute, setNewRoute] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cabData) {
      setFormData({
        name: cabData.name || "",
        slug: cabData.slug || "",
        description: cabData.description || "",
        duration: cabData.duration || "",
        starting_from: cabData.starting_from || "",
        vehicle_type: cabData.vehicle_type || "",
        ideal_for: cabData.ideal_for || "",
        routes: cabData.routes || [],
        is_featured: cabData.is_featured || false,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        duration: "",
        starting_from: "",
        vehicle_type: "",
        ideal_for: "",
        routes: [],
        is_featured: false,
      });
      setNewRoute("");
    }
  }, [cabData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const addRoute = () => {
    if (!newRoute.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      routes: [...(prev.routes || []), newRoute.trim()],
    }));
    setNewRoute("");
  };

  const removeRoute = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      routes: prev.routes.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cabData?.id) {
        const { error } = await firebaseClient
          .from("cabs")
          .update(formData)
          .eq("id", cabData.id);
        if (error) throw error;
      } else {
        const slug =
          formData.slug ||
          formData.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        const { error } = await firebaseClient
          .from("cabs")
          .insert([{ ...formData, slug }]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error: any) {
      alert("Error saving cab plan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {cabData ? "Edit Cab Plan" : "Add New Cab Plan"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
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
              {formData.routes?.map((r: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => removeRoute(idx)}
                    className="text-red-500 hover:text-red-600"
                  >
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
              Save Cab Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


