'use client';

import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { uploadToBucket } from '@/lib/storage-upload';

type Props = {
  bucket: string;
  folder: string;
  accept: string;
  label: string;
  disabled?: boolean;
  onUploaded: (publicUrl: string) => void;
  onError?: (msg: string) => void;
};

export default function StorageUploadField({
  bucket,
  folder,
  accept,
  label,
  disabled,
  onUploaded,
  onError,
}: Props) {
  const [uploading, setUploading] = useState(false);

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2 text-xs font-semibold cursor-pointer ${
        disabled || uploading ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      {uploading ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />}
      {uploading ? 'Uploading…' : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.currentTarget.value = '';
          if (!file) return;
          setUploading(true);
          try {
            const url = await uploadToBucket(bucket, folder, file);
            onUploaded(url);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            onError?.(msg);
            alert(msg);
          } finally {
            setUploading(false);
          }
        }}
      />
    </label>
  );
}
