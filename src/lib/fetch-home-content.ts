import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { mergeHomeContent, type HomeContentConfig } from '@/lib/home-content';

export async function fetchHomeContentFromDb(): Promise<HomeContentConfig> {
  noStore();
  try {
    const { data, error } = await supabase.from('site_settings').select('home_content').eq('id', 1).maybeSingle();
    if (error || !data?.home_content) {
      return mergeHomeContent(null);
    }
    return mergeHomeContent(data.home_content as HomeContentConfig);
  } catch {
    return mergeHomeContent(null);
  }
}
