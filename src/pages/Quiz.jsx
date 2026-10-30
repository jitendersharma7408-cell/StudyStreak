import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, Star, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import ResultReview from '@/components/study/ResultReview';
import BackButton from '@/components/study/BackButton';
import FocusTopics from '@/components/study/FocusTopics';
export default function Quiz() {
  const [quiz, setQuiz] = useState(null), [answers, setAnswers] = useState({}), [step, setStep] = useState(0), [result, setResult] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [mode, setMode] = useState('daily'), [attemptId, setAttemptId] = useState(null);
  const [focusTopics, setFocusTopics] = useState([]);
  const [needsProfile, setNeedsProfile] = useState(false);
  useEffect(() => {
    base44.functions.invoke('dailyChallenge', { action: 'get' }).then(r => {
      setQuiz(r.data); setMode('daily');
      if (r.data.in_progress) {
        setAttemptId(r.data.attempt_id);
        if (r.data.savedAnswers) setAnswers(r.data.savedAnswers);
      }
    }).catch(e => {
      if (e.response?.data?.needsProfile) { setNeedsProfile(true); setError(e.response.data.error || 'Please set your course, stream, and semester in Profile.'); }
      else setError(e.response?.data?.error || e.message);
    });
  }, []);
  function selectAnswer(questionId, letter) {
    setAnswers(a => {
      const newAnswers = { ...a, [questionId]: letter };
      if (mode === 'daily' && attemptId) {
        base44.functions.invoke('dailyChallenge', { action: 'save_answers', attempt_id: attemptId, answers: newAnswers }).catch(() => {});
      }
      return newAnswers;
    });
  }
  function resetPractice() {
    setQuiz(null); setAnswers({}); setStep(0); setResult(null); setError(''); setNeedsProfile(false); setMode('practice'); setAttemptId(null);
    base44.functions.invoke('dailyChallenge', { action: 'practice', step: 'get' }).then(r => setQuiz(r.data)).catch(e => {
      if (e.response?.data?.needsProfile) { setNeedsProfile(true); setError(e.response.data.error || 'Please set your course, stream, and semester in Profile.'); }
      else setError(e.response?.data?.error || e.message);
    });
  }
  async function submit() {
    if (Object.keys(answers).length !== 5 || busy) return;
    setBusy(true); setError('');
    try {
      const payload = mode === 'practice'
        ? { action: 'practice', step: 'submit', answers: quiz.questions.map(q => ({ question_id: q.id, selected_answer: answers[q.id] })) }
        : { action: 'submit', answers: quiz.questions.map(q => ({ question_id: q.id, selected_answer: answers[q.id] })) };
      const r = await base44.functions.invoke('dailyChallenge', payload);
      setResult(r.data);
      base44.functions.invoke('getFocusTopics', {}).then(fr => setFocusTopics(fr.data?.focusTopics || [])).catch(() => {});
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setBusy(false); }
  }
  // Optimistic UI: selected answers show immediate visual feedback (ring, scale, checkmark)
  // and all controls are disabled during backend confirmation.
  if (needsProfile) return <div className="max-w-xl mx-auto text-center bg-card border border-border rounded-3xl p-10">
    <div className="text-5xl mb-4 select-none">🎯</div>
    <h1 className="text-2xl font-black">Set your course, stream & semester</h1>
    <p className="text-muted-foreground mt-3">{error}</p>
    <Link to="/profile" className="select-none inline-flex items-center gap-2 bg-study-dark text-white px-6 py-3 rounded-xl font-bold mt-6">Go to Profile</Link>
  </div>;
  if (error && !quiz) return <p className="text-destructive">{error}</p>;
  if (!quiz) return <p className="text-muted-foreground">Preparing {mode === 'practice' ? 'practice' : "today's"} questions…</p>;
  if (quiz.completed && !result && mode === 'daily') return <div className="max-w-xl mx-auto text-center bg-card border border-border rounded-3xl p-10">
    <div className="text-5xl mb-4 select-none">✓</div>
    <h1 className="text-2xl font-black">Challenge complete for today!</h1>
    <p className="text-muted-foreground mt-3">A new set of five questions arrives tomorrow (UTC). Your score is saved in My Progress.</p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
      <button onClick={resetPractice} className="select-none bg-study-dark text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"><Repeat size={18} className="select-none" /> Continue to Play</button>
      <Link className="select-none bg-study-lime px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center" to="/progress">See My Progress</Link>
    </div>
  </div>;
  if (result) return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto space-y-6">
    <BackButton />
    <div className="bg-study-dark text-white rounded-3xl p-7 sm:p-9">
      <p className="select-none text-study-lime font-bold uppercase tracking-widest text-xs">{mode === 'practice' ? 'Practice round' : 'Challenge completed'}</p>
      <h1 className="text-3xl font-black mt-2">You scored {result.attempt.score}/5!</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-7 text-sm">
        {[['Correct', result.attempt.score], ['Wrong', result.attempt.wrong], ['Previous Stars', `${result.attempt.previous_stars} ★`], ['Star Change', `${result.attempt.star_change > 0 ? '+' : ''}${result.attempt.star_change} ★`], ['Updated Stars', `${result.attempt.updated_stars} ★`], ['XP Earned', `+${result.attempt.xp_earned}`]].map(([label, value]) =>
          <div key={label} className="bg-white/10 rounded-xl p-3"><p className="text-muted-foreground">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button onClick={resetPractice} className="select-none bg-study-lime px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"><Repeat size={18} className="select-none" /> {mode === 'practice' ? 'Play Again' : 'Continue to Play'}</button>
        <Link to="/progress" className="text-study-lime font-bold inline-flex items-center">View updated progress →</Link>
      </div>
    </div>
    <h2 className="text-xl font-black">Answer review</h2>
    <ResultReview review={result.review} />
    {focusTopics.length > 0 && <FocusTopics topics={focusTopics} />}
  </motion.div>;
  const q = quiz.questions[step];
  return <div className="max-w-2xl mx-auto">
    <BackButton label="Back to Today" />
    {mode === 'practice' && <p className="select-none inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-study-accent mb-4"><Repeat size={14} className="select-none" /> Practice round — push your rank up</p>}
    {mode === 'daily' && attemptId && Object.keys(answers).length > 0 && <p className="select-none inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-study-accent mb-4"><Repeat size={14} className="select-none" /> Resuming in-progress challenge</p>}
    <div className="flex justify-between text-sm font-bold mb-3"><span>Question {step + 1} of 5</span><span className="text-study-accent">{Object.keys(answers).length}/5 answered</span></div>
    <div className="h-2 bg-muted rounded-full mb-7"><div className="h-full bg-study-accent rounded-full transition-all" style={{ width: `${(step + 1) * 20}%` }} /></div>
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="select-none inline-flex items-center gap-1.5 bg-study-accent text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">{q.subject}</span>
        <span className="select-none text-xs font-semibold text-muted-foreground">{q.topic}</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-black mb-7">{q.text}</h1>
      <div className="space-y-3">
        {q.options.map((option, i) => {
          const letter = 'ABCD'[i];
          const isSelected = answers[q.id] === letter;
          return <button key={letter} onClick={() => selectAnswer(q.id, letter)} disabled={busy} aria-label={`Option ${letter}: ${option}`} aria-pressed={isSelected} className={`select-none w-full text-left flex gap-3 items-center p-4 border-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? 'border-study-accent bg-study-accent-bg ring-2 ring-study-accent/30 scale-[0.99]' : 'border-border hover:border-muted-foreground'} ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <span className={`select-none w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${isSelected ? 'bg-study-accent text-white border-study-accent' : 'bg-card border border-border'}`}>{letter}</span>
            <span>{option}</span>
            {isSelected && <Check size={18} className="select-none ml-auto text-study-accent" />}
          </button>;
        })}
      </div>
      <div className="flex items-center justify-between mt-8 gap-3">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="select-none px-5 py-3 rounded-xl font-semibold disabled:opacity-30">Previous</button>
        {step < 4
          ? <button onClick={() => setStep(s => s + 1)} disabled={!answers[q.id]} className="select-none bg-study-dark text-white px-5 py-3 rounded-xl font-bold disabled:opacity-40 inline-flex gap-2 items-center">Next <ArrowRight size={17} className="select-none" /></button>
          : <button onClick={submit} disabled={Object.keys(answers).length !== 5 || busy} className="select-none bg-study-lime px-5 py-3 rounded-xl font-bold disabled:opacity-40 inline-flex gap-2 items-center"><Check size={17} className="select-none" />{busy ? 'Submitting…' : 'Submit Answers'}</button>}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
    <div className="flex gap-2 justify-center mt-5">
      {quiz.questions.map((item, i) => <button key={item.id} onClick={() => setStep(i)} aria-label={`Go to question ${i + 1}`} aria-current={step === i} className={`select-none w-11 h-11 rounded-full text-xs font-bold ${step === i ? 'bg-study-dark text-white' : answers[item.id] ? 'bg-study-lime' : 'bg-muted'}`}>{i + 1}</button>)}
    </div>
    <p className="select-none text-center text-xs text-muted-foreground mt-5"><Star size={13} className="inline select-none" /> 3–5 correct: +1 star · 0–2 correct: −1 star (minimum 0)</p>
  </div>;
}