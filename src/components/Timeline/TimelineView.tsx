import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Heart,
  Calendar,
  Star,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Smile,
  Tag as TagIcon,
  X,
  BookOpen,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { formatHumanDate, calculateTotalEntryWords } from '../../utils/date';
import { DEFAULT_MOODS } from '../../utils/constants';
import { IconRenderer } from '../common/IconRenderer';

export const TimelineView: React.FC = () => {
  const {
    entries = [],
    openEditor,
    toggleFavorite,
    deleteEntry,
    setSelectedEntryDetail,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedMood,
    setSelectedMood,
    showFavoritesOnly,
    setShowFavoritesOnly,
  } = useDiary();

  const safeEntries = Array.isArray(entries) ? entries : [];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract all unique tags across entries
  const allTags = useMemo(() => {
    const set = new Set<string>();
    safeEntries.forEach((e) => {
      if (Array.isArray(e.tags)) {
        e.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [safeEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return safeEntries.filter((entry) => {
      // Favorite filter
      if (showFavoritesOnly && !entry.is_favorite) return false;

      // Tag filter
      if (selectedTag && (!Array.isArray(entry.tags) || !entry.tags.includes(selectedTag))) return false;

      // Mood filter
      if (selectedMood) {
        const moodSec = Array.isArray(entry.sections)
          ? entry.sections.find((s) => s.section_type === 'mood' || s.mood_value)
          : undefined;
        if (moodSec?.mood_value !== selectedMood) return false;
      }

      // Search query (across title, tags, section content)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = entry.title?.toLowerCase().includes(q);
        const matchesTag = Array.isArray(entry.tags) && entry.tags.some((t) => t.toLowerCase().includes(q));
        const matchesContent = Array.isArray(entry.sections) && entry.sections.some(
          (s) =>
            s.content?.toLowerCase().includes(q) ||
            (Array.isArray(s.checklist_items) && s.checklist_items.some((c) => c.text.toLowerCase().includes(q)))
        );

        if (!matchesTitle && !matchesTag && !matchesContent) return false;
      }

      return true;
    });
  }, [safeEntries, showFavoritesOnly, selectedTag, selectedMood, searchQuery]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedTag || selectedMood || showFavoritesOnly
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setSelectedMood(null);
    setShowFavoritesOnly(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Diary Timeline & Archive
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid/List switch */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openEditor()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-4 shadow-sm space-y-3">
        {/* Top Search & Favorites toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search through diary entries, thoughts, checklist tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFavoritesOnly
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} />
            <span>Favorites</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline px-2 py-1 font-medium whitespace-nowrap self-center"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Mood & Tag Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-700/60">
          <span className="text-xs font-medium text-stone-400">Mood:</span>
          {DEFAULT_MOODS.map((m) => {
            const isSelected = selectedMood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setSelectedMood(isSelected ? null : m.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="text-[11px]">{m.label.split(' ')[0]}</span>
              </button>
            );
          })}

          {allTags.length > 0 && (
            <>
              <span className="text-xs font-medium text-stone-400 ml-2">Tags:</span>
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-400 text-indigo-900 dark:text-indigo-200'
                        : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Entries Display */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700 p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200 mb-1">
            No diary entries found
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-5">
            {hasActiveFilters
              ? 'Try changing or resetting your search filters to view your entries.'
              : 'Start your personal journal journey today by creating your first entry.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200"
            >
              Clear Search Filters
            </button>
          ) : (
            <button
              onClick={() => openEditor()}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/20"
            >
              + Create First Entry
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => {
            const moodSection = entry.sections.find(
              (s) => s.section_type === 'mood' || s.mood_value
            );
            const moodObj = DEFAULT_MOODS.find((m) => m.value === moodSection?.mood_value);
            const ratingSection = entry.sections.find(
              (s) => s.section_type === 'rating' || s.rating
            );
            const photoSection = entry.sections.find(
              (s) => s.section_type === 'photo' && s.photo_paths && s.photo_paths.length > 0
            );
            const firstPhoto = photoSection?.photo_paths?.[0];
            const words = calculateTotalEntryWords(entry);

            const bodySnippet =
              entry.sections.find((s) => s.section_type === 'text' && s.content)?.content ||
              entry.title ||
              '';

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntryDetail(entry)}
                className="group cursor-pointer bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-5 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      {formatHumanDate(entry.date)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {moodObj && (
                        <span className="text-lg" title={moodObj.label}>
                          {moodObj.emoji}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(entry.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          entry.is_favorite
                            ? 'text-rose-500 fill-rose-500'
                            : 'text-stone-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${entry.is_favorite ? 'fill-rose-500' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                    {entry.title || 'Untitled Journal Entry'}
                  </h3>

                  {/* Photo thumbnail if present */}
                  {firstPhoto && (
                    <div className="relative mb-3 rounded-2xl overflow-hidden h-36 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                      <img
                        src={firstPhoto.url}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Snippet text */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed mb-4">
                    {bodySnippet}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-700/60 mt-auto flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-1.5">
                    {entry.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      >
                        #{t}
                      </span>
                    ))}
                    {entry.tags && entry.tags.length > 2 && (
                      <span className="text-[10px]">+{entry.tags.length - 2}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {ratingSection?.rating && (
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{ratingSection.rating}</span>
                      </div>
                    )}
                    <span>{words} words</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact List View */
        <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 overflow-hidden divide-y divide-stone-100 dark:divide-stone-700/60 shadow-sm">
          {filteredEntries.map((entry) => {
            const moodSection = entry.sections.find(
              (s) => s.section_type === 'mood' || s.mood_value
            );
            const moodObj = DEFAULT_MOODS.find((m) => m.value === moodSection?.mood_value);
            const words = calculateTotalEntryWords(entry);

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntryDetail(entry)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-amber-50/30 dark:hover:bg-stone-700/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="text-center min-w-[75px] shrink-0">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                      {formatHumanDate(entry.date).split(',')[0]}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {entry.date}
                    </span>
                  </div>

                  {moodObj && <span className="text-xl shrink-0">{moodObj.emoji}</span>}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate">
                      {entry.title || 'Journal Entry'}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {entry.sections.find((s) => s.content)?.content || 'No text note'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-stone-400 hidden sm:inline">
                    {words} words
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(entry.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      entry.is_favorite ? 'text-rose-500' : 'text-stone-300 hover:text-rose-400'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${entry.is_favorite ? 'fill-rose-500' : ''}`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditor(entry.date);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
