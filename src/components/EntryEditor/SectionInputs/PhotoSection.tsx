import React, { useRef } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2, Plus } from 'lucide-react';
import { EntrySection, PhotoAttachment } from '../../../types';

interface PhotoSectionProps {
  section: EntrySection;
  onChange: (updated: EntrySection) => void;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({ section, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photos: PhotoAttachment[] = section.photo_paths || [];

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newPhoto: PhotoAttachment = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            url: result,
            caption: '',
            created_at: Date.now(),
          };
          onChange({
            ...section,
            photo_paths: [...photos, newPhoto],
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    onChange({
      ...section,
      photo_paths: photos.filter((p) => p.id !== id),
    });
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange({
      ...section,
      photo_paths: photos.map((p) => (p.id === id ? { ...p, caption } : p)),
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        className="cursor-pointer border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-5 text-center bg-stone-50/50 dark:bg-stone-800/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
          Click or Drag & Drop photos from your device
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Photos are saved locally in your private offline diary
        </p>
      </div>

      {/* Uploaded Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-2xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm group"
            >
              <div className="relative h-44 bg-stone-100 dark:bg-stone-900">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Diary moment'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={photo.caption || ''}
                  onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
