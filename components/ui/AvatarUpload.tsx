'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentUrl?: string;
  fallbackInitials?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  uploadLabel: string;
  changeLabel: string;
  removeLabel: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

export default function AvatarUpload({
  currentUrl,
  fallbackInitials = '',
  onFileSelect,
  onRemove,
  uploadLabel,
  changeLabel,
  removeLabel,
  size = 'lg',
}: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl || currentUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-500',
          sizes[size]
        )}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt=""
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
            {fallbackInitials}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Camera className="mr-1.5 inline h-3.5 w-3.5" />
          {displayUrl ? changeLabel : uploadLabel}
        </button>
        {displayUrl && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <X className="h-3 w-3" />
            {removeLabel}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
