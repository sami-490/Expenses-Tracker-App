import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  Trash2,
  Plus,
  Heart,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Tag as TagIcon,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { DiaryEntry, EntrySection, SectionTemplate } from '../../types';
import { useDiary } from '../../context/DiaryContext';
import {
  formatHumanDate,
  formatDateToYYYYMMDD,
  calculateTotalEntryWords,
} from '../../utils/date';
import { TextSection } from './SectionInputs/TextSection';
import { ChecklistSection } from './SectionInputs/ChecklistSection';
import { RatingSection } from './SectionInputs/RatingSection';
import { MoodSection } from './SectionInputs/MoodSection';
import { PhotoSection } from './SectionInputs/PhotoSection';
import { AddSectionModal } from './AddSectionModal';
import { IconRenderer } from '../common/IconRenderer';

const WEATHER_OPTIONS = [
  { icon: 'Sun', label: 'Sunny / Clear', temp: '24°C' },
  { icon: 'Cloud', label: 'Cloudy / Overcast', temp: '19°C' },
  { icon: 'CloudRain', label: 'Rainy / Cozy', temp: '16°C' },
  { icon: 'Sparkles', label: 'Starlit / Calm', temp: '20°C' },
];

export const EntryEditorModal: React.FC = () => {
  const {
    editorDate,
    closeEditor,
    getEntryForDate,
    saveEntry,
    deleteEntry,
    sections: globalTemplates,
  } = useDiary();

  const [date, setDate] = useState(editorDate || formatDateToYYYYMMDD(new Date()));
  const [title, setTitle] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [weather, setWeather] = useState<{ icon: string; label: string; temp?: string } | undefined>(
    WEATHER_OPTIONS[0]
  );
  const [sections, setSections] = useState<EntrySection[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);

  // Initialize entry state on mount or date change
  useEffect(() => {
    if (!editorDate) return;
    setDate(editorDate);
    const existing = getEntryForDate(editorDate);

    if (existing) {
      setExistingEntryId(existing.id);
      setTitle(existing.title || '');
      setIsFavorite(existing.is_favorite || false);
      setTags(existing.tags || []);
      setWeather(existing.weather || WEATHER_OPTIONS[0]);
      setSections(existing.sections || []);
    } else {
      // New entry: Seed with default active templates (e.g. Mood, Gratitude, Highlights, Tasks)
      setExistingEntryId(null);
      setTitle('');
      setIsFavorite(false);
      setTags(['reflection']);
      setWeather(WEATHER_OPTIONS[0]);

      const initialSections: EntrySection[] = globalTemplates.slice(0, 4).map((tpl, idx) => ({
        id: `sec_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
        entry_id: '',
        section_id: tpl.id,
        section_name: tpl.name,
        section_type: tpl.type,
        section_color: tpl.color,
        section_icon: tpl.icon,
        content: tpl.default_placeholder || '',
        sort_order: idx + 1,
      }));
      setSections(initialSections);
    }
  }, [editorDate, getEntryForDate, globalTemplates]);

  if (!editorDate) return null;

  const handleSave = () => {
    const entryToSave: DiaryEntry = {
      id: existingEntryId || `entry_${date.replace(/-/g, '')}`,
      date,
      title: title.trim() || undefined,
      is_favorite: isFavorite,
      tags: tags.filter(Boolean),
      weather,
      sections: sections.map((s, idx) => ({ ...s, sort_order: idx + 1 })),
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    saveEntry(entryToSave);
    closeEditor();
  };

  const handleDelete = () => {
    if (existingEntryId && window.confirm('Are you sure you want to delete this diary entry?')) {
      deleteEntry(existingEntryId);
      closeEditor();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTemplateSection = (tpl: SectionTemplate) => {
    const newSection: EntrySection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      entry_id: existingEntryId || '',
      section_id: tpl.id,
      section_name: tpl.name,
      section_type: tpl.type,
      section_color: tpl.color,
      section_icon: tpl.icon,
      content: tpl.default_placeholder || '',
      sort_order: sections.length + 1,
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSections(updated);
  };

  const handleUpdateSection = (updated: EntrySection) => {
    setSections(sections.map((s) => (s.id === updated.id ? updated : s)));
  };

  const totalWords = calculateTotalEntryWords({
    id: '',
    date,
    title,
    is_favorite: isFavorite,
    tags,
    sections,
    created_at: 0,
    updated_at: 0,
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Sticky Bar */}
        <div className="p-4 sm:p-6 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700/80 border border-stone-200 dark:border-stone-600 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-500'
                  : 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-400 hover:text-rose-400'
              }`}
              title={isFavorite ? 'Favorited Entry' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {existingEntryId && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>

            <button
              type="button"
              onClick={closeEditor}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Weather Row */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-4 border border-stone-200 dark:border-stone-700/80 space-y-4">
            <input
              type="text"
              placeholder="Entry Title / Headline (e.g. A day of breakthroughs & peaceful coffee)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 placeholder-stone-400 bg-transparent focus:outline-none border-b border-stone-100 dark:border-stone-700/60 pb-2"
            />

            {/* Weather Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
                Atmosphere:
              </span>
              {WEATHER_OPTIONS.map((w) => {
                const isSelected = weather?.label === w.label;
                return (
                  <button
                    key={w.label}
                    type="button"
                    onClick={() => setWeather(w)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <IconRenderer name={w.icon} className="w-3.5 h-3.5" />
                    <span>{w.label.split('/')[0].trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* Tags Input */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <TagIcon className="w-3.5 h-3.5 text-stone-400" />
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-stone-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ tag (press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 bg-transparent focus:outline-none px-1 py-0.5"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {sections.map((section, idx) => {
              const tpl = globalTemplates.find((t) => t.id === section.section_id);
              const sectionName = section.section_name || tpl?.name || 'Section';
              const sectionIcon = section.section_icon || tpl?.icon || 'Sparkles';
              const sectionColor = section.section_color || tpl?.color || '#F59E0B';
              const sectionType = section.section_type || tpl?.type || 'text';

              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-5 shadow-sm space-y-3"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-700/60">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-sm"
                        style={{
                          backgroundColor: `${sectionColor}20`,
                          color: sectionColor,
                        }}
                      >
                        <IconRenderer name={sectionIcon} className="w-4 h-4" />
                      </div>
                      <span className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        {sectionName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reorder Up/Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 transition-colors"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 transition-colors"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Section */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(section.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-500 transition-colors ml-1"
                        title="Remove section from this entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section Body Input */}
                  <div>
                    {sectionType === 'text' && (
                      <TextSection
                        section={section}
                        placeholder={tpl?.default_placeholder}
                        onChange={handleUpdateSection}
                      />
                    )}
                    {sectionType === 'checklist' && (
                      <ChecklistSection
                        section={section}
                        onChange={handleUpdateSection}
                      />
                    )}
                    {sectionType === 'rating' && (
                      <RatingSection
                        section={section}
                        onChange={handleUpdateSection}
                      />
                    )}
                    {sectionType === 'mood' && (
                      <MoodSection
                        section={section}
                        onChange={handleUpdateSection}
                      />
                    )}
                    {sectionType === 'photo' && (
                      <PhotoSection
                        section={section}
                        onChange={handleUpdateSection}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Section Button */}
          <button
            type="button"
            onClick={() => setShowAddSection(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 bg-white/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
          >
            <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Add Another Section (Gratitude, Work, Health, Photos, Rating...)</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Total words: <strong className="text-stone-800 dark:text-stone-200">{totalWords}</strong>
            </span>
            <span>•</span>
            <span>{sections.length} active sections</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Offline Saved
            </span>
          </div>
        </div>

        {/* Add Section Modal Popup */}
        {showAddSection && (
          <AddSectionModal
            onClose={() => setShowAddSection(false)}
            onAddExistingTemplate={handleAddTemplateSection}
            onCreateNewSection={handleAddTemplateSection}
            alreadyAddedTemplateIds={sections.map((s) => s.section_id)}
          />
        )}
      </motion.div>
    </div>
  );
};
