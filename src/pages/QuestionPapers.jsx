import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';
import DownloadMaterial from '@/components/study/DownloadMaterial';
import SubjectPicker from '@/components/study/SubjectPicker';

export default function QuestionPapers() {
  const [papers, setPapers] = useState([]);
  const [subject, setSubject] = useState('');
  const [search, setSearch] = useState('');
  const [examType, setExamType] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    const fields = ['subject', 'year', 'exam_type', 'semester', 'university'];
    async function loadAll() {
      const all = [];
      for (let skip = 0; ; skip += 1000) {
        const batch = await base44.entities.QuestionPaper.list('-created_date', 1000, skip, fields);
        all.push(...batch);
        if (batch.length < 1000) break;
      }
      return all;
    }
    loadAll()
      .then(data => { setPapers(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  async function openPaper(p) {
    window.scrollTo(0, 0);
    setSelected({ ...p, loadingFull: true });
    const full = await base44.entities.QuestionPaper.get(p.id);
    setSelected(cur => (cur?.id === p.id ? full : cur));
  }

  if (loading) return <p>Loading question papers…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  const subjects = [...new Set(papers.map(p => p.subject))];
  const examTypes = [...new Set(papers.map(p => p.exam_type).filter(Boolean))];
  const filtered = papers.filter(p =>
    (!subject || p.subject === subject) &&
    (!examType || p.exam_type === examType) &&
    (!search || (p.subject + ' ' + p.year + ' ' + (p.university || '') + ' ' + (p.exam_type || '') + ' ' + (p.semester || '')).toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => (b.year || '').localeCompare(a.year || ''));

  return (
    <div>
      <BackButton />
      <SectionHeading
        eyebrow="Exam archive"
        title="Question Papers"
        description="Previous year question papers from 2000 to 2026. Search and filter by subject and exam type."
      />

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(null); }}
          placeholder="Search papers by subject, year, university, or semester…"
          className="select-none w-full border border-border rounded-xl p-4 outline-none focus:border-study-accent"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label className="select-none block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Subject</label>
          <SubjectPicker subjects={subjects} value={subject} onChange={(v) => { setSubject(v); setSelected(null); }} />
        </div>
        {examTypes.length > 1 && (
          <div className="sm:w-56">
            <label className="select-none block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Exam Type</label>
            <select value={examType} onChange={e => { setExamType(e.target.value); setSelected(null); }} className="select-none w-full min-h-[44px] border border-border rounded-xl px-3 bg-card outline-none focus:border-study-accent">
              <option value="">All Types</option>
              {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-5">
        <aside className={`bg-card rounded-2xl border border-border p-4 h-fit ${selected ? 'hidden md:block' : ''}`}>
          <p className="select-none text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
            {filtered.length} Paper{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No papers found for this filter.</p>}
          <div className="space-y-2">
            {filtered.slice(0, visibleCount).map(p => (
              <button
                key={p.id}
                onClick={() => openPaper(p)}
                aria-pressed={selected?.id === p.id}
                className={`select-none min-h-[44px] block w-full text-left rounded-xl px-3 py-2.5 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected?.id === p.id ? 'bg-study-accent-bg' : 'hover:bg-muted'}`}
              >
                <span className="block">{p.subject}</span>
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">{p.year} · {p.exam_type}</span>
                {p.semester && <span className="block text-xs font-normal text-muted-foreground">{p.semester}</span>}
              </button>
            ))}
          </div>
          {filtered.length > visibleCount && (
            <button
              onClick={() => setVisibleCount(c => c + 30)}
              className="select-none min-h-[44px] mt-3 w-full text-sm font-bold text-study-accent hover:opacity-80"
            >
              Load more ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </aside>

        <article className={`bg-card rounded-2xl border border-border p-5 sm:p-8 min-h-80 ${selected ? '' : 'hidden md:block'}`}>
          {selected?.loadingFull ? (
            <p className="text-muted-foreground">Loading paper…</p>
          ) : selected ? (
            <>
              <button
                onClick={() => setSelected(null)}
                className="md:hidden select-none min-h-[44px] mb-3 text-sm font-bold text-study-accent"
              >
                ← All papers
              </button>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="select-none text-xs uppercase tracking-widest font-bold text-study-accent">{selected.subject}</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs font-bold text-muted-foreground">{selected.year}</span>
                {selected.exam_type && <span className="text-xs font-bold text-muted-foreground">· {selected.exam_type}</span>}
              </div>
              <h2 className="text-2xl font-black">{selected.subject} — {selected.year}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {selected.university && <span>🏫 {selected.university}</span>}
                {selected.semester && <span>📚 {selected.semester}</span>}
                {selected.max_marks && <span>📝 {selected.max_marks} Marks</span>}
                {selected.duration && <span>⏱ {selected.duration}</span>}
              </div>
              {selected.instructions && (
                <div className="bg-muted rounded-xl p-4 mt-5">
                  <p className="select-none text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">General Instructions</p>
                  <p className="whitespace-pre-line text-sm text-muted-foreground leading-7">{selected.instructions}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-5 mb-3">
                <h3 className="font-bold text-lg">Question Paper</h3>
                <DownloadMaterial
                  content={`Subject: ${selected.subject}\nYear: ${selected.year}\n${selected.exam_type ? 'Exam: ' + selected.exam_type + '\n' : ''}${selected.university ? 'University: ' + selected.university + '\n' : ''}${selected.semester ? 'Semester: ' + selected.semester + '\n' : ''}${selected.max_marks ? 'Max Marks: ' + selected.max_marks + '\n' : ''}${selected.duration ? 'Duration: ' + selected.duration + '\n' : ''}\n${selected.instructions ? 'Instructions:\n' + selected.instructions + '\n\n' : ''}\n${selected.paper_content}`}
                  filename={`${selected.subject}_${selected.year}_QuestionPaper`}
                />
              </div>
              <p className="whitespace-pre-line text-muted-foreground leading-8">{selected.paper_content}</p>
            </>
          ) : (
            <p className="text-muted-foreground">Select a question paper from the list to view it.</p>
          )}
        </article>
      </div>
    </div>
  );
}