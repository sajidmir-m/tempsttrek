import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { mergeSocialPage, type SocialPageConfig } from '@/lib/social-page';

export async function fetchSocialPageFromDb(): Promise<SocialPageConfig> {
  noStore();
  try {
    const { data, error } = await supabase.from('site_settings').select('social_page').eq('id', 1).maybeSingle();
    if (error || !data) return mergeSocialPage(null);
    return mergeSocialPage(data.social_page);
  } catch {
    return mergeSocialPage(null);
  }
}
