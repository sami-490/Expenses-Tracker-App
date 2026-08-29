import React from 'react';
import { Star } from 'lucide-react';
import { EntrySection } from '../../../types';

interface RatingSectionProps {
  section: EntrySection;
  onChange: (updated: EntrySection) => void;
}

export const RatingSection: React.FC<RatingSectionProps> = ({ section, onChange }) => {
  const currentRating = section.rating || 0;

  const labels: Record<number, string> = {
    1: '1 Star — Challenging day',
    2: '2 Stars — Below average',
    3: '3 Stars — Balanced & decent',
    4: '4 Stars — Very fulfilling day',
    5: '5 Stars — Wonderful & extraordinary!',
  };

  const handleSelectRating = (score: number) => {
    onChange({
      ...section,
      rating: score,
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleSelectRating(star)}
              className="p-1 rounded-xl hover:scale-125 transition-transform"
              title={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= currentRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300 dark:text-stone-600 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
          {labels[currentRating] || 'Click a star to rate your day'}
        </div>
      </div>
    </div>
  );
};
