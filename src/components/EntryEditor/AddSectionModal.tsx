import React, { useState } from 'react';
import {
  Plus,
  X,
  Smile,
  Heart,
  Briefcase,
  Activity,
  Image as ImageIcon,
  Star,
  Sparkles,
  BookOpen,
  Coffee,
  Sun,
  ListTodo,
  Check,
} from 'lucide-react';
import { SectionTemplate, SectionType } from '../../types';
import { useDiary } from '../../context/DiaryContext';
import { IconRenderer } from '../common/IconRenderer';

interface AddSectionModalProps {
  onClose: () => void;
  onAddExistingTemplate: (template: SectionTemplate) => void;
  onCreateNewSection: (template: SectionTemplate) => void;
  alreadyAddedTemplateIds: string[];
}

const AVAILABLE_COLORS = [
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
];

const AVAILABLE_ICONS = [
  'Sparkles',
  'Heart',
  'Smile',
  'Briefcase',
  'Activity',
  'Image',
  'Star',
  'BookOpen',
  'Coffee',
  'Sun',
  'ListTodo',
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  onClose,
  onAddExistingTemplate,
  onCreateNewSection,
  alreadyAddedTemplateIds,
}) => {
  const { sections, addSectionTemplate } = useDiary();
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');

  // Custom section state
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<SectionType>('text');
  const [customIcon, setCustomIcon] = useState('Sparkles');
  const [customColor, setCustomColor] = useState('#6366F1');
  const [customDescription, setCustomDescription] = useState('');

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newTemplate = addSectionTemplate({
      name: customName.trim(),
      type: customType,
      icon: customIcon,
      color: customColor,
      description: customDescription.trim() || undefined,
      sort_order: sections.length + 1,
      is_deleted: false,
    });

    onCreateNewSection(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Add Section to Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-2 border-b border-stone-100 dark:border-stone-700 flex gap-2 bg-stone-50 dark:bg-stone-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Choose from Templates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Create Custom Section
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[400px] overflow-y-auto">
          {activeTab === 'templates' ? (
            <div className="space-y-2.5">
              {sections.map((tpl) => {
                const isAdded = alreadyAddedTemplateIds.includes(tpl.id);
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={isAdded}
                    onClick={() => {
                      onAddExistingTemplate(tpl);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isAdded
                        ? 'opacity-40 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 cursor-not-allowed'
                        : 'bg-white dark:bg-stone-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                        style={{
                          backgroundColor: `${tpl.color}20`,
                          color: tpl.color,
                        }}
                      >
                        <IconRenderer name={tpl.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {tpl.name}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                          {tpl.description || `Type: ${tpl.type}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 shrink-0">
                      {isAdded ? 'Added' : '+ Add'}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ideas & Spark, What I Ate, Dreams..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Section Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'text' as const, label: 'Text / Note' },
                    { id: 'checklist' as const, label: 'Checklist' },
                    { id: 'rating' as const, label: 'Star Rating' },
                    { id: 'mood' as const, label: 'Mood Picker' },
                    { id: 'photo' as const, label: 'Photo Gallery' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCustomType(t.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        customType === t.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        customColor === c ? 'scale-125 ring-2 ring-stone-900 dark:ring-white ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {customColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCustomIcon(iconName)}
                      className={`p-2 rounded-xl border transition-all ${
                        customIcon === iconName
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-400'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <IconRenderer name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/20"
                >
                  Create & Insert Section
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
