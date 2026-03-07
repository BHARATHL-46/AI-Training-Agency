import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

interface NotesPanelProps {
  moduleId: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ moduleId }) => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes on mount or when moduleId changes
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_module_${moduleId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }
    setStatus('idle');
  }, [moduleId]);

  // Auto-save logic
  useEffect(() => {
    if (status === 'idle') return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`notes_module_${moduleId}`, notes);
      setStatus('saved');
      
      // Reset to idle after showing "Saved" for a bit
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notes, moduleId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setStatus('saving');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all notes for this module?')) {
      setNotes('');
      localStorage.removeItem(`notes_module_${moduleId}`);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col h-[600px] shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400">
            <BookOpen size={18} />
          </div>
          <h3 className="font-bold text-white">My Notes</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
            {status === 'saving' && (
              <>
                <Loader2 size={12} className="text-white/40 animate-spin" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Auto-saving...</span>
              </>
            )}
            {status === 'saved' && (
              <>
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-medium">Saved ✓</span>
              </>
            )}
          </div>
          
          <button
            onClick={handleClear}
            className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all"
            title="Clear Notes"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative group">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Start typing your study notes here... your progress is saved automatically."
          className="w-full h-full bg-black/20 border border-white/5 rounded-2xl p-5 text-sm text-white/80 outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none transition-all placeholder:text-white/10 leading-relaxed custom-scrollbar"
        />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] text-white/20 bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
            {notes.length} characters
          </span>
        </div>
      </div>
    </div>
  );
};
