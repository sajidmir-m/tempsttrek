'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  mergeHomeContent,
  type HeroSlide,
  type HomeContentConfig,
  type SiteBrandingConfig,
  DEFAULT_SPLIT_LEFT,
  DEFAULT_SPLIT_RIGHT,
} from '@/lib/home-content';
import { SITE_BRAND, SITE_CONTACT } from '@/lib/site-contact';
import Image from 'next/image';
import { deleteStorageObjectByPublicUrl, parseSupabasePublicStorageUrl } from '@/lib/storage-upload';
import StorageUploadField from '@/components/admin/StorageUploadField';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';

const FEATURED_SLUGS = [
  { key: 'srinagar', label: 'Srinagar (slug srinagar)' },
  { key: 'gulmarg', label: 'Gulmarg' },
  { key: 'pahalgam', label: 'Pahalgam' },
];

export default function AdminHomeMediaTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    mergeHomeContent(null).heroSlides as HeroSlide[]
  );
  const [featured, setFeatured] = useState<Record<string, string>>({
    srinagar: '',
    gulmarg: '',
    pahalgam: '',
  });
  const [splitLeft, setSplitLeft] = useState({ ...DEFAULT_SPLIT_LEFT });
  const [splitRight, setSplitRight] = useState({ ...DEFAULT_SPLIT_RIGHT });
  const [branding, setBranding] = useState<SiteBrandingConfig>({
    logoUrl: '',
    companyName: SITE_BRAND.legalName,
    tagline: SITE_BRAND.tagline,
    contactEmail: SITE_CONTACT.email,
    contactPhones: SITE_CONTACT.phones.join(', '),
    contactAddress: SITE_CONTACT.address,
    aboutText: SITE_BRAND.description,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.from('site_settings').select('home_content').eq('id', 1).maybeSingle();
      if (error) throw error;
      const merged = mergeHomeContent(data?.home_content as HomeContentConfig | undefined);
      setHeroSlides([...(merged.heroSlides || [])]);
      const fp = merged.featuredPlaces || {};
      setFeatured({
        srinagar: fp.srinagar?.image || '',
        gulmarg: fp.gulmarg?.image || '',
        pahalgam: fp.pahalgam?.image || '',
      });
      setSplitLeft({ ...DEFAULT_SPLIT_LEFT, ...merged.splitPanels?.left });
      setSplitRight({ ...DEFAULT_SPLIT_RIGHT, ...merged.splitPanels?.right });
      setBranding({
        logoUrl: merged.branding?.logoUrl || '',
        companyName: merged.branding?.companyName || SITE_BRAND.legalName,
        tagline: merged.branding?.tagline || SITE_BRAND.tagline,
        contactEmail: merged.branding?.contactEmail || SITE_CONTACT.email,
        contactPhones: merged.branding?.contactPhones || SITE_CONTACT.phones.join(', '),
        contactAddress: merged.branding?.contactAddress || SITE_CONTACT.address,
        aboutText: merged.branding?.aboutText || SITE_BRAND.description,
      });
    } catch (e: any) {
      setMessage(
        e.message?.includes('site_settings')
          ? 'Create table site_settings (see supabase/migrations) or check RLS.'
          : e.message || 'Failed to load home content'
      );
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (): HomeContentConfig => {
    const fp: NonNullable<HomeContentConfig['featuredPlaces']> = {};
    FEATURED_SLUGS.forEach(({ key }) => {
      const img = featured[key]?.trim();
      if (img) fp[key] = { image: img };
    });
    return {
      heroSlides,
      branding,
      featuredPlaces: fp,
      splitPanels: {
        left: {
          badge: splitLeft.badge,
          headline: splitLeft.headline,
          body: splitLeft.body,
          image: splitLeft.image,
          bullets: splitLeft.bullets,
          ctaLabel: splitLeft.ctaLabel,
          ctaHref: splitLeft.ctaHref,
        },
        right: {
          badge: splitRight.badge,
          headline: splitRight.headline,
          body: splitRight.body,
          image: splitRight.image,
          bullets: splitRight.bullets,
          ctaLabel: splitRight.ctaLabel,
          ctaHref: splitRight.ctaHref,
        },
      },
    };
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = buildPayload();
      const { error } = await supabase.from('site_settings').upsert(
        {
          id: 1,
          home_content: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) throw error;
      setMessage('Saved. Open the homepage (or refresh it) to see new images and videos.');
      router.refresh();
    } catch (e: any) {
      setMessage(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (idx: number, field: keyof HeroSlide, val: string) => {
    setHeroSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  const addHero = () =>
    setHeroSlides((prev) => [...prev, { src: '/videos/hero-bg.mp4', title: 'Kashmir', subtitle: 'New slide' }]);

  const removeHero = async (idx: number) => {
    if (heroSlides.length <= 1) return;
    const slide = heroSlides[idx];
    const src = slide?.src?.trim();
    if (src) {
      const parsed = parseSupabasePublicStorageUrl(src);
      if (parsed?.bucket === 'site-media') {
        const alsoDelete = window.confirm(
          'Remove this slide and DELETE the file from Supabase storage?\n\nOK = delete file + remove slide\nCancel = remove slide only (file stays in bucket)'
        );
        if (alsoDelete) {
          try {
            await deleteStorageObjectByPublicUrl(src);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Could not delete file';
            alert(msg);
          }
        }
      }
    }
    setHeroSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const bulletsLines = (b?: string[]) => (b?.length ? b.join('\n') : '');

  const splitBulletsToArr = (text: string) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-600 py-16 justify-center">
        <Loader2 className="animate-spin" size={24} />
        Loading homepage media…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-4 items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Homepage media</h3>
          <div className="text-sm text-gray-600 mt-1 space-y-2 max-w-3xl">
            <p>
              <strong>Where it is saved:</strong> one row in Supabase table{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">site_settings</code> with{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">id = 1</code>. Column{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">home_content</code> stores JSON (hero slide URLs,
              featured place images, split panels). There is no separate &quot;homepage media&quot; table.
            </p>
            <p>
              <strong>Uploads:</strong> files go to the Storage bucket{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">site-media</code> (create as <strong>public</strong>{' '}
              in Dashboard). The app saves the resulting <strong>public URL</strong> into that JSON. You can also paste
              a path under <code className="text-xs bg-gray-100 px-1 rounded">public/</code> without uploading.
            </p>
          </div>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2 inline-block">
            Slug hints for featured tiles:{' '}
            {[...FEATURED_SLUGS.map((f) => f.key)].join(', ')}
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 disabled:opacity-60 font-semibold"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save all
        </button>
      </div>

      {message && (
        <div className="text-sm px-4 py-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">{message}</div>
      )}

      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="font-bold text-gray-800">Branding & contact (logo live preview)</h4>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 min-w-[200px]">
            <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Logo preview</p>
            {branding.logoUrl ? (
              <div className="relative h-16 w-40">
                <Image src={branding.logoUrl} alt="Logo" fill className="object-contain object-left" unoptimized />
              </div>
            ) : (
              <p className="text-sm font-bold text-teal-800">{branding.companyName || SITE_BRAND.shortName}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">{branding.tagline}</p>
          </div>
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap gap-2">
              <input
                className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm"
                placeholder="Logo URL"
                value={branding.logoUrl || ''}
                onChange={(e) => setBranding((b) => ({ ...b, logoUrl: e.target.value }))}
              />
              <StorageUploadField
                bucket="site-media"
                folder="branding/logo"
                accept="image/*"
                label="Upload logo"
                onUploaded={(url) => setBranding((b) => ({ ...b, logoUrl: url }))}
              />
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Company name"
              value={branding.companyName || ''}
              onChange={(e) => setBranding((b) => ({ ...b, companyName: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Tagline"
              value={branding.tagline || ''}
              onChange={(e) => setBranding((b) => ({ ...b, tagline: e.target.value }))}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[60px]"
              placeholder="About / company info"
              value={branding.aboutText || ''}
              onChange={(e) => setBranding((b) => ({ ...b, aboutText: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Contact email"
              value={branding.contactEmail || ''}
              onChange={(e) => setBranding((b) => ({ ...b, contactEmail: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Phone numbers (comma-separated)"
              value={branding.contactPhones || ''}
              onChange={(e) => setBranding((b) => ({ ...b, contactPhones: e.target.value }))}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[50px]"
              placeholder="Office address"
              value={branding.contactAddress || ''}
              onChange={(e) => setBranding((b) => ({ ...b, contactAddress: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="font-bold text-gray-800 flex items-center justify-between">
          Hero video slides
          <button
            type="button"
            onClick={addHero}
            className="inline-flex items-center gap-1 text-sm text-teal-700 font-semibold hover:underline"
          >
            <Plus size={16} /> Add slide
          </button>
        </h4>
        <div className="space-y-4">
          {heroSlides.map((slide, idx) => (
            <div key={idx} className="border border-gray-100 rounded-xl p-4 grid md:grid-cols-4 gap-3 relative">
              <button
                type="button"
                onClick={() => void removeHero(idx)}
                className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                title="Remove slide (optional: delete file from storage)"
              >
                <Trash2 size={16} />
              </button>
              <div className="col-span-full md:col-span-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <input
                  className="border rounded-lg px-3 py-2 text-sm flex-1"
                  value={slide.src}
                  placeholder="Video URL or /videos/hero-bg.mp4"
                  onChange={(e) => updateHero(idx, 'src', e.target.value)}
                />
                <StorageUploadField
                  bucket="site-media"
                  folder="home/hero"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  label="Upload video"
                  onUploaded={(url) => updateHero(idx, 'src', url)}
                />
              </div>
              <input
                className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
                value={slide.title}
                placeholder="Large title word"
                onChange={(e) => updateHero(idx, 'title', e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
                value={slide.subtitle}
                placeholder="Subtitle line"
                onChange={(e) => updateHero(idx, 'subtitle', e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="font-bold text-gray-800">Featured place cards — image paths</h4>
        {FEATURED_SLUGS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm flex-1"
                placeholder="/videos/adventure-1.png or Supabase URL"
                value={featured[key] || ''}
                onChange={(e) => setFeatured((prev) => ({ ...prev, [key]: e.target.value }))}
              />
              <StorageUploadField
                bucket="site-media"
                folder={`home/featured/${key}`}
                accept="image/*"
                label="Upload image"
                onUploaded={(url) => setFeatured((prev) => ({ ...prev, [key]: url }))}
              />
            </div>
          </div>
        ))}
      </section>

      {(['left', 'right'] as const).map((side) => {
        const pane = side === 'left' ? splitLeft : splitRight;
        const setPane = side === 'left' ? setSplitLeft : setSplitRight;
        return (
          <section key={side} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <h4 className="font-bold text-gray-800">Split homepage panel — {side}</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm flex-1"
                placeholder="Image URL or path"
                value={pane.image || ''}
                onChange={(e) => setPane((p) => ({ ...p, image: e.target.value }))}
              />
              <StorageUploadField
                bucket="site-media"
                folder={side === 'left' ? 'home/split-left' : 'home/split-right'}
                accept="image/*"
                label="Upload image"
                onUploaded={(url) => setPane((p) => ({ ...p, image: url }))}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Badge"
                value={pane.badge || ''}
                onChange={(e) => setPane((p) => ({ ...p, badge: e.target.value }))}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="CTA label"
                value={pane.ctaLabel || ''}
                onChange={(e) => setPane((p) => ({ ...p, ctaLabel: e.target.value }))}
              />
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm font-semibold"
              placeholder="Headline"
              value={pane.headline || ''}
              onChange={(e) => setPane((p) => ({ ...p, headline: e.target.value }))}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[72px]"
              placeholder="Paragraph"
              value={pane.body || ''}
              onChange={(e) => setPane((p) => ({ ...p, body: e.target.value }))}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-xs min-h-[80px]"
              placeholder="Bullet lines (one per line)"
              value={bulletsLines(pane.bullets)}
              onChange={(e) => setPane((p) => ({ ...p, bullets: splitBulletsToArr(e.target.value) }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="CTA link path e.g. /packages"
              value={pane.ctaHref || ''}
              onChange={(e) => setPane((p) => ({ ...p, ctaHref: e.target.value }))}
            />
          </section>
        );
      })}
    </div>
  );
}
