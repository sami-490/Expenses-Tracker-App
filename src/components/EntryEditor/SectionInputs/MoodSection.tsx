import React from 'react';
import { DEFAULT_MOODS } from '../../../utils/constants';
import { EntrySection } from '../../../types';

interface MoodSectionProps {
  section: EntrySection;
  onChange: (updated: EntrySection) => void;
}

export const MoodSection: React.FC<MoodSectionProps> = ({ section, onChange }) => {
  const selectedMood = section.mood_value;

  const handleSelectMood = (moodVal: string) => {
    onChange({
      ...section,
      mood_value: moodVal,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DEFAULT_MOODS.map((m) => {
          const isSelected = selectedMood === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => handleSelectMood(m.value)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700/80 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-semibold truncate ${
                    isSelected
                      ? 'text-amber-900 dark:text-amber-200'
                      : 'text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {m.label}
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {m.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Note regarding mood */}
      <input
        type="text"
        value={section.content || ''}
        onChange={(e) => onChange({ ...section, content: e.target.value })}
        placeholder="Why are you feeling this way? (Optional reflection)"
        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
      />
    </div>
  );
};
