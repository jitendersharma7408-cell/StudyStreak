import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { Sparkles, Send, Trash2 } from 'lucide-react';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';
const examples = ['Explain Java inheritance.', 'What is a Python list?', 'Explain binary search.', 'Explain matrix multiplication.', 'Explain OOP.'];
const STORAGE_KEY = 'studystreak_chat_history';

export default function AskAI() {
  const [question, setQuestion] = useState(''), [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); setHistory(Array.isArray(saved) ? saved : []); }
    catch { setHistory([]); }
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [history, loading]);

  async function ask(e) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setLoading(true); setError('');
    const newHistory = [...history, { question: q, answer: '' }];
    setHistory(newHistory);
    setQuestion('');
    try {
      const r = await base44.functions.invoke('askStudyAI', { question: q, history: newHistory.slice(-6) });
      const updated = [...newHistory];
      updated[updated.length - 1] = { question: q, answer: r.data.answer };
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      const updated = [...newHistory];
      updated[updated.length - 1] = { question: q, answer: '⚠️ ' + (err.response?.data?.error || err.message) };
      setHistory(updated);
    } finally { setLoading(false); }
  }

  function clearHistory() {
    setHistory([]); localStorage.removeItem(STORAGE_KEY); setError('');
  }

  return <div className="max-w-3xl mx-auto">
    <BackButton />
    <SectionHeading eyebrow="Your study companion" title="Ask AI" description="No question is too small. Ask in English, Hindi, or Hinglish and get a clear explanation with relevant notes." />
    {history.length > 0 && (
      <div className="bg-card rounded-3xl border border-border p-5 sm:p-7 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold">Chat History</p>
          <button onClick={clearHistory} className="select-none text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"><Trash2 size={13} className="select-none" /> Clear</button>
        </div>
        <div ref={scrollRef} className="space-y-4 max-h-96 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-muted rounded-2xl px-4 py-2.5 ml-auto max-w-[85%]"><p className="text-sm font-semibold">{h.question}</p></div>
              {h.answer && <div className="bg-study-accent-bg rounded-2xl px-4 py-3 max-w-[85%]"><div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-sm"><ReactMarkdown>{h.answer}</ReactMarkdown></div></div>}
            </div>
          ))}
          {loading && <div className="bg-study-accent-bg rounded-2xl px-4 py-3 max-w-[85%]"><div className="flex gap-1"><span className="w-2 h-2 bg-study-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span><span className="w-2 h-2 bg-study-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span><span className="w-2 h-2 bg-study-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span></div></div>}
        </div>
      </div>
    )}
    <div className="bg-card rounded-3xl border border-border p-5 sm:p-7">
      <div className="select-none w-12 h-12 bg-study-accent-bg rounded-2xl flex items-center justify-center mb-5">
        <Sparkles className="text-study-accent select-none" />
      </div>
      <form onSubmit={ask}>
        <label htmlFor="study-question" className="font-bold">Ask a doubt</label>
        <textarea id="study-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={1000} rows={3} placeholder="Java me inheritance simple language me samjhao…" className="w-full mt-3 border border-border rounded-xl p-4 outline-none focus:border-study-accent resize-y" />
        <button type="submit" disabled={loading || question.trim().length < 3} className="select-none mt-3 inline-flex items-center gap-2 rounded-xl bg-study-dark text-white px-5 py-3 font-bold disabled:opacity-40">
          <Send size={16} className="select-none" />{loading ? 'Thinking…' : 'Ask AI'}
        </button>
      </form>
      {error && <p role="alert" className="text-destructive mt-4">{error}</p>}
    </div>
    {history.length === 0 && <div className="mt-6">
      <p className="font-bold mb-3">Try asking</p>
      <div className="flex gap-2 flex-wrap">
        {examples.map(x => <button key={x} onClick={() => setQuestion(x)} className="select-none text-sm bg-card border border-border rounded-full px-4 py-2 hover:border-study-accent">{x}</button>)}
      </div>
    </div>}
  </div>;
}