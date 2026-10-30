import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Check, X, ChevronRight, Layers, Zap } from 'lucide-react';
import BackButton from '@/components/study/BackButton';
import SectionHeading from '@/components/study/SectionHeading';
import FocusTopics from '@/components/study/FocusTopics';

export default function Flashcards() {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState([]), [selected, setSelected] = useState(null);
  const [cards, setCards] = useState([]), [loading, setLoading] = useState(false);
  const [error, setError] = useState(''), [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [unknown, setUnknown] = useState(new Set());
  const [phase, setPhase] = useState('select'); // select | study | done
  const [sessionResult, setSessionResult] = useState(null);
  const [focusTopics, setFocusTopics] = useState([]);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    base44.entities.TopicNote.list().then(setNotes).catch(e => setError(e.message));
  }, []);

  // Auto-load flashcards if noteId is in URL
  useEffect(() => {
    const noteId = searchParams.get('noteId');
    if (noteId && notes.length > 0 && phase === 'select') {
      const note = notes.find(n => n.id === noteId);
      if (note) generate(note);
    }
  }, [searchParams, notes, phase]);

  // Save session when done
  useEffect(() => {
    if (phase === 'done' && !saved && cards.length > 0 && selected) {
      setSaved(true);
      const knownCount = known.size;
      const learningCount = cards.filter((_, idx) => !known.has(idx)).length;
      base44.functions.invoke('flashcardSession', {
        action: 'save',
        topic: selected.topic,
        subject: selected.subject,
        noteId: selected.id,
        cardsKnown: knownCount,
        cardsLearning: learningCount,
        totalCards: cards.length
      }).then(r => {
        setSessionResult(r.data);
        return base44.functions.invoke('getFocusTopics', {});
      }).then(r => setFocusTopics(r.data?.focusTopics || []))
        .catch(e => console.error(e));
    }
  }, [phase, saved, cards, selected, known, unknown]);

  const generate = useCallback(async (note) => {
    setLoading(true); setError(''); setSelected(note); setCards([]); setPhase('study');
    setSaved(false); setSessionResult(null); setFocusTopics([]);
    try {
      const r = await base44.functions.invoke('generateFlashcards', { action: 'generate', noteId: note.id });
      setCards(r.data.flashcards || []);
      setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set());
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  }, []);

  const markKnown = () => {
    if (!cards[index]) return;
    setKnown(prev => new Set([...prev, index]));
    setUnknown(prev => { const s = new Set(prev); s.delete(index); return s; });
    nextCard();
  };
  const markUnknown = () => {
    if (!cards[index]) return;
    setUnknown(prev => new Set([...prev, index]));
    nextCard();
  };
  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setIndex(i => {
        if (i + 1 < cards.length) return i + 1;
        const unknownIndices = cards.map((_, idx) => idx).filter(idx => unknown.has(idx) && !known.has(idx));
        if (unknownIndices.length > 0) {
          return unknownIndices[0];
        }
        setPhase('done');
        return i;
      });
    }, 200);
  };

  const restart = () => {
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set());
    setPhase('study'); setSaved(false); setSessionResult(null); setFocusTopics([]);
  };

  // SELECT PHASE
  if (phase === 'select' || (!selected && !loading)) {
    const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))];
    const filteredNotes = notes.filter(n =>
      (!subject || n.subject === subject) &&
      (!search || (n.topic + ' ' + n.subject).toLowerCase().includes(search.toLowerCase()))
    );
    return (
      <div>
        <BackButton />
        <SectionHeading eyebrow="Memorize faster" title="Flashcards" description="Pick a topic to auto-generate flashcards from its notes. Flip, learn, repeat until mastered." />
        <div className="bg-study-accent-bg border border-study-accent/20 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="select-none w-8 h-8 bg-study-accent rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Layers size={16} className="text-white" /></div>
            <div>
              <p className="font-bold text-study-accent-dark text-sm">How Flashcards Work</p>
              <p className="text-sm text-muted-foreground mt-0.5">AI automatically creates term-and-definition cards from your topic notes. Tap a card to flip it, then mark whether you knew the answer.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-card rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Step 1</p>
              <p className="text-sm font-bold mt-1">Pick Topic</p>
            </div>
            <div className="bg-card rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Step 2</p>
              <p className="text-sm font-bold mt-1">Flip & Learn</p>
            </div>
            <div className="bg-card rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Step 3</p>
              <p className="text-sm font-bold mt-1">Earn XP</p>
            </div>
          </div>
        </div>
        {error && <p className="text-destructive mb-4">{error}</p>}
        <div className="mb-5 space-y-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic or subject…"
            className="select-none w-full border border-border rounded-xl p-4 outline-none focus:border-study-accent"
          />
          {subjects.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSubject('')} className={`select-none px-3 py-1.5 rounded-full text-xs font-bold ${!subject ? 'bg-study-accent text-white' : 'bg-muted text-muted-foreground'}`}>All</button>
              {subjects.map(s => (
                <button key={s} onClick={() => setSubject(s)} className={`select-none px-3 py-1.5 rounded-full text-xs font-bold ${subject === s ? 'bg-study-accent text-white' : 'bg-muted text-muted-foreground'}`}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNotes.map(n => (
            <button key={n.id} onClick={() => generate(n)} disabled={loading}
              className="select-none text-left bg-card border border-border rounded-2xl p-5 hover:border-study-accent hover:shadow-md transition-all disabled:opacity-50">
              <div className="flex items-center justify-between mb-2">
                <Layers size={20} className="text-study-accent" />
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <p className="text-xs uppercase tracking-widest font-bold text-study-accent">{n.subject}</p>
              <h3 className="font-black mt-1">{n.topic}</h3>
            </button>
          ))}
        </div>
        {notes.length === 0 && <p className="text-muted-foreground">No topic notes available yet.</p>}
      </div>
    );
  }

  if (loading) return (
    <div>
      <BackButton />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        <p className="ml-3 text-muted-foreground">Generating flashcards…</p>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <BackButton />
      <p className="text-destructive">{error}</p>
    </div>
  );

  // DONE PHASE
  if (phase === 'done') {
    const knownCount = known.size;
    const learningCount = cards.filter((_, idx) => !known.has(idx)).length;
    const pct = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;
    const xpEarned = sessionResult?.xpEarned ?? knownCount;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <BackButton />
        <div className="bg-card border border-border rounded-3xl p-7 sm:p-9 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black">Session Complete!</h1>
          <p className="text-muted-foreground mt-3">You reviewed {cards.length} flashcards about {selected.topic}.</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-study-accent-bg rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Known</p>
              <p className="text-2xl font-black text-study-accent-dark mt-1">{knownCount}</p>
            </div>
            <div className="bg-destructive/5 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Still Learning</p>
              <p className="text-2xl font-black text-destructive mt-1">{learningCount}</p>
            </div>
            <div className="bg-study-purple-bg rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Mastery</p>
              <p className="text-2xl font-black mt-1">{pct}%</p>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-study-accent-bg text-study-accent-dark px-4 py-2 rounded-xl font-bold text-sm">
            <Zap size={16} /> +{xpEarned} XP earned
          </div>

          <div className="h-3 bg-muted rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-study-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>

          <div className="flex gap-3 justify-center mt-6">
            <button onClick={restart} className="select-none bg-study-dark text-white px-6 py-3 rounded-xl font-bold">Study Again</button>
            <button onClick={() => setPhase('select')} className="select-none bg-muted px-6 py-3 rounded-xl font-bold">Pick Another Topic</button>
          </div>
        </div>

        {focusTopics.length > 0 && <FocusTopics topics={focusTopics} />}
      </div>
    );
  }

  // STUDY PHASE
  const card = cards[index];
  if (!card) return null;
  const progress = ((known.size) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />
      <p className="select-none text-xs uppercase tracking-widest font-bold text-study-accent mb-2">{selected.subject} · {selected.topic}</p>
      <div className="flex justify-between text-sm font-bold mb-3">
        <span>Card {index + 1} of {cards.length}</span>
        <span className="text-study-accent">{known.size} known</span>
      </div>
      <div className="h-2 bg-muted rounded-full mb-6"><div className="h-full bg-study-accent rounded-full transition-all" style={{ width: `${progress}%` }} /></div>

      {/* Flashcard */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <motion.div
          onClick={() => setFlipped(!flipped)}
          className="relative w-full cursor-pointer select-none"
          style={{ transformStyle: 'preserve-3d', minHeight: '300px' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Front (term) */}
          <div className="absolute inset-0 bg-card border-2 border-border rounded-3xl p-8 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">Term</p>
            <h2 className="text-2xl sm:text-3xl font-black text-center">{card.term}</h2>
            <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1"><RotateCw size={12} /> Tap to flip</p>
          </div>
          {/* Back (definition) */}
          <div className="absolute inset-0 bg-study-dark text-white border-2 border-study-dark rounded-3xl p-8 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-xs uppercase tracking-widest font-bold text-study-lime mb-3">Definition</p>
            <p className="text-lg sm:text-xl font-semibold text-center leading-relaxed">{card.definition}</p>
          </div>
        </motion.div>
      </div>

      {/* Know / Don't Know buttons */}
      <div className="flex gap-3 mt-6">
        <button onClick={markUnknown} className="select-none flex-1 bg-destructive/10 text-destructive border-2 border-destructive/20 rounded-xl py-3.5 font-bold inline-flex items-center justify-center gap-2 hover:bg-destructive/15 transition-colors">
          <X size={18} /> Don't Know
        </button>
        <button onClick={markKnown} className="select-none flex-1 bg-study-accent-bg text-study-accent-dark border-2 border-study-accent/20 rounded-xl py-3.5 font-bold inline-flex items-center justify-center gap-2 hover:bg-study-accent/20 transition-colors">
          <Check size={18} /> Know It
        </button>
      </div>
    </div>
  );
}