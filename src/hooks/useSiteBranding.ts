'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mergeHomeContent, type HomeContentConfig, type SiteBrandingConfig } from '@/lib/home-content';
import { SITE_BRAND, SITE_CONTACT, companyPhonesDisplayLine } from '@/lib/site-contact';
import { resolvePdfHeroImage } from '@/lib/pdf-branding';

export type ResolvedBranding = {
  logoUrl: string;
  companyName: string;
  tagline: string;
  email: string;
  phones: string;
  address: string;
  website: string;
  pdfHeaderImageUrl: string;
  bankDetails: SiteBrandingConfig['bankDetails'];
  loading: boolean;
};


export function useSiteBranding(): ResolvedBranding {
  const [config, setConfig] = useState<HomeContentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('home_content').eq('id', 1).maybeSingle();
        if (!cancelled) setConfig(mergeHomeContent((data?.home_content as HomeContentConfig) || null));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const b = config?.branding || {};
  return {
    logoUrl: b.logoUrl || '/logo.png',
    companyName: b.companyName || SITE_BRAND.legalName,
    tagline: b.tagline || SITE_BRAND.tagline,
    email: b.contactEmail || SITE_CONTACT.email,
    phones: b.contactPhones || companyPhonesDisplayLine(),
    address: b.contactAddress || SITE_CONTACT.address,
    website: b.website || 'www.tempesttreks.in',
    pdfHeaderImageUrl: resolvePdfHeroImage(b.pdfHeaderImageUrl),
    bankDetails: b.bankDetails,
    loading,
  };
}
