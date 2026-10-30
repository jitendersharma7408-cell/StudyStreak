import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowRight, Check } from 'lucide-react';
import BackButton from '@/components/study/BackButton';
import SectionHeading from '@/components/study/SectionHeading';
import ResultReview from '@/components/study/ResultReview';

export default function Revision() {
  const [quiz, setQuiz] = useState(null), [answers, setAnswers] = useState({}), [step, setStep] = useState(0), [result, setResult] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('revisionEngine', { action: 'getDue' })
      .then(r => { setQuiz(r.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.error || e.message); setLoading(false); });
  }, []);

  function selectAnswer(qId, letter) { setAnswers(a => ({ ...a, [qId]: letter })); }

  async function submit() {
    const qIds = quiz.questions.map(q => q.id);
    if (Object.keys(answers).length < qIds.length || busy) return;
    setBusy(true); setError('');
    try {
      const payload = { action: 'submit', answers: qIds.map(id => ({ question_id: id, selected_answer: answers[id] })) };
      const r = await base44.functions.invoke('revisionEngine', payload);
      setResult(r.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setBusy(false); }
  }

  function restart() {
    setQuiz(null); setAnswers({}); setStep(0); setResult(null); setError(''); setLoading(true);
    base44.functions.invoke('revisionEngine', { action: 'getDue' })
      .then(r => { setQuiz(r.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.error || e.message); setLoading(false); });
  }

  if (loading) return <div><BackButton /><p className="text-muted-foreground">Loading revision questions…</p></div>;
  if (error && !quiz) return <div><BackButton /><p className="text-destructive">{error}</p></div>;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) return (
    <div><BackButton />
      <div className="bg-card rounded-3xl border border-border p-10 text-center max-w-xl mx-auto">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-black">No revisions due!</h1>
        <p className="text-muted-foreground mt-3">You're all caught up. Wrong answers will resurface here after 3, 7, and 15 days for spaced repetition.</p>
      </div>
    </div>
  );

  if (result) return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <BackButton />
      <div className="bg-study-dark text-white rounded-3xl p-7 sm:p-9">
        <p className="select-none text-study-lime font-bold uppercase tracking-widest text-xs">Revision Complete</p>
        <h1 className="text-3xl font-black mt-2">You scored {result.attempt.score}/{quiz.questions.length}!</h1>
        <p className="text-muted-foreground mt-2">+{result.attempt.xp_earned} XP earned</p>
        <button onClick={restart} className="select-none mt-5 inline-flex items-center gap-2 bg-study-lime px-6 py-3 rounded-xl font-bold"><RotateCcw size={18} className="select-none" /> Study Again</button>
      </div>
      <h2 className="text-xl font-black">Answer review</h2>
      <ResultReview review={result.review} />
    </motion.div>
  );

  const q = quiz.questions[step];
  const total = quiz.questions.length;
  return (
    <div className="max-w-2xl mx-auto">
      <BackButton label="Back to Today" />
      <p className="select-none inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-study-accent mb-4"><RotateCcw size={14} className="select-none" /> Revision Mode — Spaced Repetition</p>
      <div className="flex justify-between text-sm font-bold mb-3"><span>Question {step + 1} of {total}</span><span className="text-study-accent">{Object.keys(answers).length}/{total} answered</span></div>
      <div className="h-2 bg-muted rounded-full mb-7"><div className="h-full bg-study-accent rounded-full transition-all" style={{ width: `${(step + 1) * (100 / total)}%` }} /></div>
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <span className="select-none text-xs font-bold uppercase tracking-widest text-study-accent">{q.subject} · {q.topic}</span>
        <h1 className="text-xl sm:text-2xl font-black mt-3 mb-7">{q.text}</h1>
        <div className="space-y-3">
          {q.options.map((option, i) => {
            const letter = 'ABCD'[i];
            const isSelected = answers[q.id] === letter;
            return <button key={letter} onClick={() => selectAnswer(q.id, letter)} disabled={busy} aria-label={`Option ${letter}`} aria-pressed={isSelected} className={`select-none w-full text-left flex gap-3 items-center p-4 border-2 rounded-xl transition-all ${isSelected ? 'border-study-accent bg-study-accent-bg ring-2 ring-study-accent/30 scale-[0.99]' : 'border-border hover:border-muted-foreground'} ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <span className={`select-none w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${isSelected ? 'bg-study-accent text-white' : 'bg-card border border-border'}`}>{letter}</span>
              <span>{option}</span>
              {isSelected && <Check size={18} className="select-none ml-auto text-study-accent" />}
            </button>;
          })}
        </div>
        <div className="flex items-center justify-between mt-8 gap-3">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="select-none px-5 py-3 rounded-xl font-semibold disabled:opacity-30">Previous</button>
          {step < total - 1
            ? <button onClick={() => setStep(s => s + 1)} disabled={!answers[q.id]} className="select-none bg-study-dark text-white px-5 py-3 rounded-xl font-bold disabled:opacity-40 inline-flex gap-2 items-center">Next <ArrowRight size={17} className="select-none" /></button>
            : <button onClick={submit} disabled={Object.keys(answers).length < total || busy} className="select-none bg-study-lime px-5 py-3 rounded-xl font-bold disabled:opacity-40 inline-flex gap-2 items-center"><Check size={17} className="select-none" />{busy ? 'Submitting…' : 'Submit Answers'}</button>}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
      <div className="flex gap-2 justify-center mt-5">
        {quiz.questions.map((item, i) => <button key={item.id} onClick={() => setStep(i)} className={`select-none w-11 h-11 rounded-full text-xs font-bold ${step === i ? 'bg-study-dark text-white' : answers[item.id] ? 'bg-study-lime' : 'bg-muted'}`}>{i + 1}</button>)}
      </div>
    </div>
  );
}