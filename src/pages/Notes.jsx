import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
// eslint-disable-next-line
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';
import DownloadMaterial from '@/components/study/DownloadMaterial';
import SubjectPicker from '@/components/study/SubjectPicker';
import { Layers } from 'lucide-react';
const views = [['short_notes', 'Short Notes'], ['detailed_notes', 'Detailed Notes'], ['exam_notes', 'Exam Notes'], ['important_questions', 'Important Questions']];
export default function Notes() {
  const [notes, setNotes] = useState([]), [subject, setSubject] = useState(''), [selected, setSelected] = useState(null), [view, setView] = useState('short_notes'), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    base44.entities.TopicNote.list().then(data => { setNotes(data); setSubject(data[0]?.subject || ''); setSelected(data[0] || null); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); });
  }, []);
  if (loading) return <p>Loading topic notes…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  const subjects = [...new Set(notes.map(n => n.subject))];
  const filtered = notes.filter(n => n.subject === subject);
  return <div>
    <BackButton />
    <SectionHeading eyebrow="Revision library" title="Topic Notes" description="The essentials, deeper explanations, exam takeaways and questions in one place." />
    <div className="grid md:grid-cols-[240px_1fr] gap-5">
      <aside className="bg-card rounded-2xl border border-border p-4 h-fit">
        <label htmlFor="note-subject" className="select-none block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Subject</label>
        <SubjectPicker subjects={subjects} value={subject} onChange={(v) => { setSubject(v); setSelected(notes.find(n => n.subject === v)); setView('short_notes'); }} />
        <p className="select-none text-xs uppercase tracking-widest font-bold text-muted-foreground mt-6 mb-2">Topics</p>
        {filtered.map(n => <button key={n.id} onClick={() => { setSelected(n); setView('short_notes'); }} aria-label={`View notes for topic: ${n.topic}`} aria-pressed={selected?.id === n.id} className={`select-none min-h-[44px] block w-full text-left rounded-xl px-3 py-2.5 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selected?.id === n.id ? 'bg-study-accent-bg' : 'hover:bg-muted'}`}>{n.topic}</button>)}
      </aside>
      <article className="bg-card rounded-2xl border border-border p-5 sm:p-8 min-h-80">
        {selected ? <>
          <p className="select-none text-xs uppercase tracking-widest font-bold text-study-accent">{selected.subject}</p>
          <h2 className="text-2xl font-black mt-2">{selected.topic}</h2>
          <div className="flex flex-wrap gap-2 mt-6 mb-7">
            {views.map(([key, label]) => <button key={key} onClick={() => setView(key)} aria-label={`Switch to ${label} view`} aria-pressed={view === key} className={`select-none min-h-[44px] text-sm px-3 py-2.5 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${view === key ? 'bg-study-dark text-white' : 'bg-muted'}`}>{label}</button>)}
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">{views.find(([key]) => key === view)?.[1]}</h3>
            <div className="flex items-center gap-2">
              <a href={`/flashcards?noteId=${selected.id}`} className="select-none min-h-[44px] inline-flex items-center gap-2 bg-study-accent-bg text-study-accent-dark px-4 py-2 rounded-xl font-bold text-sm hover:bg-study-accent/20 transition-colors">
                <Layers size={15} className="select-none" /> Flashcards
              </a>
              <DownloadMaterial content={`Subject: ${selected.subject}\nTopic: ${selected.topic}\nView: ${views.find(([key]) => key === view)?.[1]}\n\n${selected[view]}`} filename={`${selected.subject}_${selected.topic}_${view}`} />
            </div>
          </div>
          <p className="whitespace-pre-line text-muted-foreground leading-8">{selected[view]}</p>
        </> : <p>No notes available yet.</p>}
      </article>
    </div>
  </div>;
}