import { supabase } from '@/lib/supabase';

/** Parse Supabase public object URL → bucket + object path */
export function parseSupabasePublicStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const u = new URL(url.trim());
    const marker = '/storage/v1/object/public/';
    const i = u.pathname.indexOf(marker);
    if (i === -1) return null;
    const rest = u.pathname.slice(i + marker.length);
    const slash = rest.indexOf('/');
    if (slash === -1) return null;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

export async function uploadToBucket(bucket: string, folder: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder.replace(/\/$/, '')}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteStorageObjectByPublicUrl(url: string): Promise<void> {
  const parsed = parseSupabasePublicStorageUrl(url);
  if (!parsed) return;
  const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
  if (error) throw error;
}
