import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Flame, Star, ArrowRight, Brain, RotateCcw } from 'lucide-react';
import useStudent from '@/components/study/useStudent';
import { rankFor, liveStreak } from '@/components/study/ranks';
import { getRankIcon } from '@/components/study/RankIcon';
import StatCard from '@/components/study/StatCard';
import QuickLinks from '@/components/study/QuickLinks';
import SessionCountdown from '@/components/study/SessionCountdown';
import RankDecaySession from '@/components/study/RankDecaySession';
import UltimateBanner from '@/components/study/UltimateBanner';
import FocusTopics from '@/components/study/FocusTopics';
import useFocusTopics from '@/components/study/useFocusTopics';
export default function Today() {
  const { loading, user, progress, attempts, error } = useStudent();
  const [dueCount, setDueCount] = useState(0);
  const focusTopics = useFocusTopics();
  useEffect(() => {
    base44.functions.invoke('revisionEngine', { action: 'getDueCount' })
      .then(r => setDueCount(r.data?.dueCount || 0))
      .catch(() => {});
  }, []);
  if (loading) return <p className="text-muted-foreground">Loading your dashboard…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  const today = new Date().toISOString().slice(0, 10);
  const done = attempts.some(a => a.day === today && a.status !== 'in_progress');
  const rank = rankFor(progress?.stars || 0);
  return <div className="space-y-8">
    <div>
      <p className="select-none text-xs uppercase tracking-[.2em] font-extrabold text-study-accent">Your study space</p>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">Welcome back, {(progress?.name || user?.full_name || 'student').split(' ')[0]} 👋</h1>
      <p className="text-muted-foreground mt-2">A little progress every day adds up.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2"><SessionCountdown /><RankDecaySession /></div>
    </div>
    {rank.ultimate && <UltimateBanner name={progress?.name || user?.full_name} />}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard icon={Flame} label="Daily Streak" value={`${liveStreak(progress)} Days`} detail="Keep it going with today's quiz" color="bg-study-orange-bg" />
      <StatCard icon={Star} label="Current Stars" value={`${progress?.stars || 0} ★`} detail="Earn one with 3 or more correct" color="bg-study-accent-bg" />
      <StatCard icon={getRankIcon(rank.icon)} label="Current Rank" value={rank.name} detail={rank.ultimate ? 'Ultimate Scholar unlocked' : 'Your next tier is waiting'} color="bg-study-purple-bg" />
    </div>
    <div className="rounded-3xl bg-study-dark text-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div>
        <span className="select-none inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-study-lime">
          <Brain size={16} className="select-none" /> Today's Challenge
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-3">Five questions. One step forward.</h2>
        <p className="text-muted-foreground mt-2">5 questions · Mixed college subjects · 3–5 correct: +1 star · 0–2 correct: −1 star</p>
      </div>
      <Link to="/quiz" className="select-none shrink-0 inline-flex items-center justify-center gap-2 bg-study-lime text-study-accent-dark px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity">
        {done ? "View Today's Challenge" : 'Start Daily Challenge'} <ArrowRight size={18} className="select-none" />
      </Link>
    </div>
    {dueCount > 0 && (
      <Link to="/revision" className="select-none block bg-study-accent-bg border border-study-accent/30 rounded-3xl p-5 sm:p-6 hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="select-none w-12 h-12 bg-study-accent rounded-2xl flex items-center justify-center shrink-0">
            <RotateCcw size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-study-accent-dark">Review Missed Questions</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{dueCount} question{dueCount !== 1 ? 's' : ''} due for revision (spaced repetition)</p>
          </div>
          <ArrowRight size={20} className="text-study-accent select-none" />
        </div>
      </Link>
    )}
    {focusTopics.length > 0 && (
      <section>
        <h2 className="text-xl font-black mb-4">Aaj in topics pe focus karo</h2>
        <FocusTopics topics={focusTopics} compact />
      </section>
    )}
    <section>
      <h2 className="text-xl font-black mb-4">Explore StudyStreak</h2>
      <QuickLinks />
    </section>
  </div>;
}