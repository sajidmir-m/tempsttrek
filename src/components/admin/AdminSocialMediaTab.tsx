'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { mergeSocialPage, type SocialPageConfig, type SocialGalleryEntry, type SocialYoutubeEntry } from '@/lib/social-page';
import { Loader2, Plus, Trash2, Save, ExternalLink } from 'lucide-react';

export default function AdminSocialMediaTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState<SocialYoutubeEntry[]>([]);
  const [galleryImages, setGalleryImages] = useState<SocialGalleryEntry[]>([]);

  useEffect(() => {
    void load();
  }, []);

  const applyMerged = (cfg: SocialPageConfig) => {
    setHeroTitle(cfg.heroTitle || '');
    setHeroSubtitle(cfg.heroSubtitle || '');
    setInstagram(cfg.links?.instagram || '');
    setFacebook(cfg.links?.facebook || '');
    setYoutubeChannel(cfg.links?.youtubeChannel || '');
    setYoutubeVideos([...(cfg.youtubeVideos || [])]);
    setGalleryImages([...(cfg.galleryImages || [])]);
  };

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.from('site_settings').select('social_page').eq('id', 1).maybeSingle();
      if (error) throw error;
      applyMerged(mergeSocialPage(data?.social_page));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setMessage(
        msg.includes('site_settings') ? 'Check site_settings table and RLS, or run latest migrations.' : msg
      );
      applyMerged(mergeSocialPage(null));
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (): SocialPageConfig => ({
    heroTitle: heroTitle.trim() || undefined,
    heroSubtitle: heroSubtitle.trim() || undefined,
    links: {
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      youtubeChannel: youtubeChannel.trim(),
    },
    youtubeVideos: youtubeVideos
      .map((v) => ({ title: v.title?.trim() || 'Video', youtubeId: v.youtubeId?.trim() || '' }))
      .filter((v) => v.youtubeId.length > 0),
    galleryImages: galleryImages
      .map((g) => ({ src: g.src?.trim() || '', alt: g.alt?.trim() || 'Photo' }))
      .filter((g) => g.src.length > 0),
  });

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = buildPayload();
      const { error } = await supabase.from('site_settings').upsert(
        {
          id: 1,
          social_page: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) throw error;
      setMessage('Saved. Open /social (or refresh) to see updates.');
      router.refresh();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-600 gap-2">
        <Loader2 className="animate-spin" size={22} />
        Loading social page settings…
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Social &amp; videos</h2>
        <p className="text-sm text-gray-600 mt-1">
          Controls the public <span className="font-medium">/social</span> page: hero copy, outbound links, embedded
          YouTube clips, and the photo grid (paths under <code className="text-xs bg-gray-100 px-1 rounded">public/</code>
          or full URLs).
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.includes('Saved') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <h3 className="font-semibold text-gray-900">Hero</h3>
        <label className="block text-sm">
          <span className="text-gray-600">Title</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="Tempesttrek on social media"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Subtitle</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            rows={3}
          />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <h3 className="font-semibold text-gray-900">Social links</h3>
        <label className="block text-sm">
          <span className="text-gray-600">Instagram URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            type="url"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Facebook URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            type="url"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">YouTube channel URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={youtubeChannel}
            onChange={(e) => setYoutubeChannel(e.target.value)}
            type="url"
          />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-900">Featured YouTube embeds</h3>
          <button
            type="button"
            onClick={() => setYoutubeVideos((v) => [...v, { title: '', youtubeId: '' }])}
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            <Plus size={16} /> Add video
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Use the video ID only (the part after <code className="bg-gray-100 px-0.5 rounded">watch?v=</code> in the
          browser URL).
        </p>
        <ul className="space-y-3">
          {youtubeVideos.map((row, i) => (
            <li key={i} className="flex flex-col sm:flex-row gap-2 sm:items-end border border-gray-100 rounded-xl p-3">
              <label className="flex-1 text-sm">
                <span className="text-gray-600">Title</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={row.title}
                  onChange={(e) => {
                    const next = [...youtubeVideos];
                    next[i] = { ...next[i], title: e.target.value };
                    setYoutubeVideos(next);
                  }}
                />
              </label>
              <label className="flex-1 text-sm">
                <span className="text-gray-600">YouTube ID</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-xs"
                  value={row.youtubeId}
                  onChange={(e) => {
                    const next = [...youtubeVideos];
                    next[i] = { ...next[i], youtubeId: e.target.value };
                    setYoutubeVideos(next);
                  }}
                  placeholder="dQw4w9WgXcQ"
                />
              </label>
              <button
                type="button"
                aria-label="Remove video"
                onClick={() => setYoutubeVideos((v) => v.filter((_, j) => j !== i))}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 self-end sm:self-auto"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
        {youtubeVideos.length === 0 && (
          <p className="text-sm text-gray-500 italic">No embeds yet — add one or leave empty; the site shows a friendly empty state.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-900">Photo gallery</h3>
          <button
            type="button"
            onClick={() => setGalleryImages((g) => [...g, { src: '', alt: '' }])}
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            <Plus size={16} /> Add image
          </button>
        </div>
        <ul className="space-y-3">
          {galleryImages.map((row, i) => (
            <li key={i} className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <label className="flex-1 text-sm">
                  <span className="text-gray-600">Image path or URL</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={row.src}
                    onChange={(e) => {
                      const next = [...galleryImages];
                      next[i] = { ...next[i], src: e.target.value };
                      setGalleryImages(next);
                    }}
                    placeholder="/shikara.png"
                  />
                </label>
                <label className="flex-1 text-sm">
                  <span className="text-gray-600">Alt text</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={row.alt}
                    onChange={(e) => {
                      const next = [...galleryImages];
                      next[i] = { ...next[i], alt: e.target.value };
                      setGalleryImages(next);
                    }}
                  />
                </label>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setGalleryImages((g) => g.filter((_, j) => j !== i))}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 self-end"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save to site
        </button>
        <a
          href="/social"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 hover:underline"
        >
          Preview public page <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
