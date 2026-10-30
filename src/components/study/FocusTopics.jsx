import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, Layers } from 'lucide-react';

export default function FocusTopics({ topics, title = 'Topics to Focus On', compact = false }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className={compact ? '' : 'bg-card border border-border rounded-2xl p-5 sm:p-6'}>
      <h2 className={`font-black mb-4 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}>
        <Target size={compact ? 16 : 20} className="text-destructive" /> {title}
      </h2>
      <div className="space-y-2.5">
        {topics.map((t, i) => (
          <div key={t.topic + i} className="flex items-center justify-between gap-3 bg-destructive/5 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{t.topic}</p>
              {t.subject && <p className="text-xs text-muted-foreground">{t.subject}</p>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-destructive">{t.accuracy}%</span>
              <Link
                to={t.noteId ? `/flashcards?noteId=${t.noteId}` : '/revision'}
                className="select-none inline-flex items-center gap-1 bg-study-dark text-white text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                {t.noteId ? <><Layers size={12} /> Cards</> : <><ArrowRight size={12} /> Revise</>}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}