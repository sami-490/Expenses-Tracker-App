import React, { useRef } from 'react';
import { Bold, Italic, List, Quote, Type } from 'lucide-react';
import { EntrySection } from '../../../types';
import { countWordsAndChars } from '../../../utils/date';

interface TextSectionProps {
  section: EntrySection;
  placeholder?: string;
  onChange: (updated: EntrySection) => void;
}

export const TextSection: React.FC<TextSectionProps> = ({
  section,
  placeholder = 'Write your thoughts here...',
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { words, chars } = countWordsAndChars(section.content || '');

  const handleFormat = (type: 'bold' | 'italic' | 'bullet' | 'quote') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = section.content || '';
    const selected = currentText.substring(start, end);

    let replacement = '';
    if (type === 'bold') {
      replacement = `**${selected || 'bold text'}**`;
    } else if (type === 'italic') {
      replacement = `*${selected || 'italic text'}*`;
    } else if (type === 'bullet') {
      replacement = `\n• ${selected || 'Bullet item'}`;
    } else if (type === 'quote') {
      replacement = `\n> ${selected || 'Quote'}`;
    }

    const updatedText =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    onChange({
      ...section,
      content: updatedText,
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between gap-1 pb-1 text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleFormat('bold')}
            className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('italic')}
            className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('bullet')}
            className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title="Bullet point"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('quote')}
            className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-stone-400">
          {words} {words === 1 ? 'word' : 'words'} • {chars} chars
        </div>
      </div>

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        rows={4}
        value={section.content || ''}
        placeholder={placeholder}
        onChange={(e) => onChange({ ...section, content: e.target.value })}
        className="w-full p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-100 text-sm leading-relaxed placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-y transition-all font-sans"
      />
    </div>
  );
};
