import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Edit3,
  Trash2,
  Heart,
  Calendar,
  Star,
  CheckCircle2,
  Share2,
  Tag as TagIcon,
  Maximize2,
} from 'lucide-react';
import { DiaryEntry } from '../../types';
import { useDiary } from '../../context/DiaryContext';
import { formatHumanDate, calculateTotalEntryWords } from '../../utils/date';
import { DEFAULT_MOODS } from '../../utils/constants';
import { IconRenderer } from '../common/IconRenderer';

interface EntryDetailModalProps {
  entry: DiaryEntry | null;
  onClose: () => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose }) => {
  const { toggleFavorite, deleteEntry, openEditor } = useDiary();
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  if (!entry) return null;

  const moodSection = entry.sections.find((s) => s.section_type === 'mood' || s.mood_value);
  const moodObj = DEFAULT_MOODS.find((m) => m.value === moodSection?.mood_value);
  const ratingSection = entry.sections.find((s) => s.section_type === 'rating' || s.rating);
  const totalWords = calculateTotalEntryWords(entry);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteEntry(entry.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onClose();
    openEditor(entry.date);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              {formatHumanDate(entry.date)}
            </span>

            {moodObj && (
              <span className="text-2xl" title={moodObj.label}>
                {moodObj.emoji}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(entry.id)}
              className={`p-2 rounded-xl border transition-all ${
                entry.is_favorite
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-500'
                  : 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-400 hover:text-rose-400'
              }`}
              title={entry.is_favorite ? 'Favorited' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${entry.is_favorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Headline Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
              {entry.title || `Journal Entry for ${formatHumanDate(entry.date)}`}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
              {entry.weather && (
                <span className="flex items-center gap-1">
                  <IconRenderer name={entry.weather.icon} className="w-3.5 h-3.5" />
                  <span>{entry.weather.label}</span>
                </span>
              )}

              {ratingSection?.rating && (
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (ratingSection.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span>{ratingSection.rating}/5 Score</span>
                </div>
              )}

              <span>{totalWords} words</span>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {entry.sections?.map((section) => {
              const name = section.section_name || 'Section';
              const icon = section.section_icon || 'Sparkles';
              const color = section.section_color || '#F59E0B';
              const type = section.section_type || 'text';

              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-700/60">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-sm"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <IconRenderer name={icon} className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {name}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div>
                    {type === 'text' && (
                      <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                        {section.content || '(Empty)'}
                      </p>
                    )}

                    {type === 'checklist' && (
                      <div className="space-y-2">
                        {section.checklist_items && section.checklist_items.length > 0 ? (
                          section.checklist_items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-2 text-sm ${
                                item.done
                                  ? 'line-through text-stone-400 dark:text-stone-500'
                                  : 'text-stone-800 dark:text-stone-200'
                              }`}
                            >
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 ${
                                  item.done
                                    ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-500/20'
                                    : 'text-stone-300 dark:text-stone-600'
                                }`}
                              />
                              <span>{item.text}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 italic">No checklist items logged.</p>
                        )}
                      </div>
                    )}

                    {type === 'rating' && (
                      <div className="flex items-center gap-2 text-amber-500">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 ${
                                i < (section.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-200 dark:text-stone-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                          {section.rating} out of 5 stars
                        </span>
                      </div>
                    )}

                    {type === 'mood' && (
                      <div className="space-y-2">
                        {section.mood_value && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-sm font-semibold border border-amber-200 dark:border-amber-800/60">
                            <span>Mood: {section.mood_value}</span>
                          </div>
                        )}
                        {section.content && (
                          <p className="text-sm text-stone-600 dark:text-stone-300 italic">
                            "{section.content}"
                          </p>
                        )}
                      </div>
                    )}

                    {type === 'photo' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.photo_paths?.map((photo) => (
                          <div
                            key={photo.id}
                            className="rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Memory'}
                              referrerPolicy="no-referrer"
                              className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setZoomedPhoto(photo.url)}
                            />
                            {photo.caption && (
                              <p className="p-2.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
                                {photo.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Lightbox photo modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <img
            src={zoomedPhoto}
            alt="Zoomed memory"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
