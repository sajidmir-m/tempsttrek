'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StorageUploadField from '@/components/admin/StorageUploadField';
import { offbeatSpotPath } from '@/lib/offbeat-slug';

export type OffbeatSpotRow = {
  id: string;
  type: 'trek' | 'hidden_place';
  name: string;
  slug: string | null;
  region: string | null;
  difficulty: string | null;
  best_season: string | null;
  duration: string | null;
  altitude: string | null;
  description: string | null;
  detail_body: string | null;
  hero_image: string | null;
  is_featured: boolean | null;
};

const emptyForm: Omit<OffbeatSpotRow, 'id'> & { id?: string } = {
  type: 'trek',
  name: '',
  slug: null,
  region: '',
  difficulty: '',
  best_season: '',
  duration: '',
  altitude: '',
  description: '',
  detail_body: '',
  hero_image: '',
  is_featured: false,
};

export default function AdminOffbeatModal({
  isOpen,
  onClose,
  onSave,
  spot,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  spot?: OffbeatSpotRow | null;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (spot?.id) {
      setForm({
        id: spot.id,
        type: spot.type,
        name: spot.name || '',
        slug: spot.slug,
        region: spot.region || '',
        difficulty: spot.difficulty || '',
        best_season: spot.best_season || '',
        duration: spot.duration || '',
        altitude: spot.altitude || '',
        description: spot.description || '',
        detail_body: spot.detail_body || '',
        hero_image: spot.hero_image || '',
        is_featured: spot.is_featured ?? false,
      });
    } else {
      setForm({ ...emptyForm, id: undefined });
    }
  }, [spot, isOpen]);

  if (!isOpen) return null;

  const setField = (name: keyof typeof form, value: string | boolean | null) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const previewPath = offbeatSpotPath({
    slug: typeof form.slug === 'string' ? form.slug : null,
    name: form.name || 'preview',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slugVal = typeof form.slug === 'string' ? form.slug.trim() : '';
      const payload = {
        type: form.type,
        name: form.name.trim(),
        slug: slugVal ? slugVal : null,
        region: form.region?.trim() || null,
        difficulty: form.difficulty?.trim() || null,
        best_season: form.best_season?.trim() || null,
        duration: form.duration?.trim() || null,
        altitude: form.altitude?.trim() || null,
        description: form.description?.trim() || null,
        detail_body: form.detail_body?.trim() || null,
        hero_image: form.hero_image?.trim() || null,
        is_featured: Boolean(form.is_featured),
        updated_at: new Date().toISOString(),
      };

      if (!payload.name) {
        alert('Name is required.');
        return;
      }

      if (form.id) {
        const { error } = await supabase.from('offbeat_spots').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('offbeat_spots').insert([payload]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Save failed: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl my-4">
        <div className="sticky top-0 bg-white p-5 border-b border-gray-100 flex justify-between items-center gap-3 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.id ? 'Edit off-beat spot' : 'Add off-beat spot'}</h2>
            {form.name ? (
              <Link
                href={previewPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-teal-700 hover:underline mt-1 inline-block"
              >
                Open public page →
              </Link>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full shrink-0" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.type}
                onChange={(e) => setField('type', e.target.value as 'trek' | 'hidden_place')}
              >
                <option value="trek">Trek</option>
                <option value="hidden_place">Hidden place</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
              <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_featured)}
                  onChange={(e) => setField('is_featured', e.target.checked)}
                />
                Show on off-beat highlights
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Tarsar Marsar Trek"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL slug (optional)</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-sm"
                value={form.slug ?? ''}
                onChange={(e) => setField('slug', e.target.value || null)}
                placeholder="Leave empty to auto-link from name"
              />
              <p className="text-xs text-gray-500 mt-1">If empty, the public site uses a slug generated from the name.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.region ?? ''}
                onChange={(e) => setField('region', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.difficulty ?? ''}
                onChange={(e) => setField('difficulty', e.target.value)}
                placeholder="Easy / Moderate / …"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Best season</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.best_season ?? ''}
                onChange={(e) => setField('best_season', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.duration ?? ''}
                onChange={(e) => setField('duration', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Altitude / terrain note</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                value={form.altitude ?? ''}
                onChange={(e) => setField('altitude', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short description (SEO / cards)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm min-h-[72px]"
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detail page copy</label>
            <p className="text-xs text-gray-500 mb-1">Use blank lines between paragraphs for spacing on the public page.</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm min-h-[220px] font-sans leading-relaxed"
              value={form.detail_body ?? ''}
              onChange={(e) => setField('detail_body', e.target.value)}
              placeholder="Longer story: route, access, seasons, how you help guests…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero image URL or path</label>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <input
                className="w-full flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.hero_image ?? ''}
                onChange={(e) => setField('hero_image', e.target.value)}
                placeholder="/Ladakh.jpeg or Supabase public URL"
              />
              <StorageUploadField
                bucket="site-media"
                folder="offbeat"
                accept="image/*"
                label="Upload"
                disabled={loading}
                onUploaded={(url) => setField('hero_image', url)}
              />
            </div>
            {form.hero_image?.trim() ? (
              <div className="mt-3 relative h-40 rounded-xl overflow-hidden border border-gray-100">
                <Image src={form.hero_image.trim()} alt="" fill className="object-cover" sizes="400px" />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {form.id ? 'Save changes' : 'Create spot'}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
