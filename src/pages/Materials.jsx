import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';
import DownloadMaterial from '@/components/study/DownloadMaterial';
export default function Materials() {
  const [items, setItems] = useState([]), [subject, setSubject] = useState(''), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => { base44.entities.StudyMaterial.list().then(data => { setItems(data); setSubject(data[0]?.subject || ''); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); }); }, []);
  if (loading) return <p>Loading study material…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  return <div>
    <BackButton />
    <SectionHeading eyebrow="Subject library" title="Study Material" description="A focused starting point for every subject, with a practice question to test yourself." />
    <div className="flex flex-wrap gap-2 mb-6">
      {[...new Set(items.map(i => i.subject))].map(s => <button key={s} onClick={() => setSubject(s)} aria-label={`Filter study materials by ${s}`} aria-pressed={s === subject} className={`select-none min-h-[44px] px-4 py-2 rounded-xl font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${s === subject ? 'bg-study-dark text-white' : 'bg-card border border-border hover:border-study-accent'}`}>{s}</button>)}
    </div>
    <div className="space-y-4">
      {items.filter(i => i.subject === subject).map(i => <article key={i.id} className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <span className="select-none text-xs uppercase tracking-widest font-bold text-study-accent">{i.subject}</span>
        <h2 className="text-2xl font-black mt-2">{i.title}</h2>
        <p className="text-muted-foreground mt-1">{i.summary}</p>
        <div className="border-t border-border mt-5 pt-5 whitespace-pre-line leading-8 text-muted-foreground">{i.content}</div>
        <div className="bg-study-accent-bg rounded-2xl p-5 mt-6">
          <p className="select-none text-xs uppercase tracking-widest font-bold text-study-accent">Check your understanding</p>
          <p className="font-semibold mt-2">{i.practice_question}</p>
        </div>
        <div className="mt-5"><DownloadMaterial content={`Subject: ${i.subject}\nTitle: ${i.title}\n\n${i.summary}\n\n${i.content}\n\nPractice Question:\n${i.practice_question}`} filename={`${i.subject}_${i.title}`} /></div>
      </article>)}
    </div>
  </div>;
}