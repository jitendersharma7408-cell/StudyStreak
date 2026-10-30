import React from 'react';
import { Flame, Star, Zap, Target, Check, X, ChartNoAxesCombined } from 'lucide-react';
import useStudent from '@/components/study/useStudent';
import { rankFor, liveStreak } from '@/components/study/ranks';
import { getRankIcon } from '@/components/study/RankIcon';
import StatCard from '@/components/study/StatCard';
import RankProgress from '@/components/study/RankProgress';
import SectionHeading from '@/components/study/SectionHeading';
import AllRanks from '@/components/study/AllRanks';
const milestones = [1, 7, 15, 30, 60, 100];
export default function Progress() {
  const { loading, progress: p, attempts, error } = useStudent();
  if (loading) return <p>Loading progress…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  const streak = liveStreak(p), total = p?.total_attempted || 0, correct = p?.total_correct || 0, wrong = p?.total_wrong || 0;
  const done = attempts.some(a => a.day === new Date().toISOString().slice(0, 10));
  return <div>
    <SectionHeading eyebrow="Your journey" title="My Progress" description="Every session counts. See where you are and what comes next." />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard icon={getRankIcon(rankFor(p?.stars || 0).icon)} label="Current Rank" value={rankFor(p?.stars || 0).name} />
      <StatCard icon={Star} label="Current Stars" value={`${p?.stars || 0} ★`} />
      <StatCard icon={Flame} label="Daily Streak" value={`${streak} Days`} />
      <StatCard icon={Zap} label="Total XP" value={p?.xp || 0} />
      <StatCard icon={Target} label="Questions Attempted" value={total} />
      <StatCard icon={Check} label="Correct Answers" value={correct} />
      <StatCard icon={X} label="Wrong Answers" value={wrong} />
      <StatCard icon={ChartNoAxesCombined} label="Quiz Accuracy" value={`${total ? Math.round(correct / total * 100) : 0}%`} />
    </div>
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="bg-card border border-border rounded-2xl p-6"><h2 className="text-lg font-black mb-5">Rank progress</h2><RankProgress stars={p?.stars || 0} /></div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-black">Daily Challenge</h2>
        <p className="mt-3 text-sm font-bold text-study-accent">{done ? 'Completed today ✓' : 'Not completed today'}</p>
        <p className="text-sm text-muted-foreground mt-1">{attempts.length} recent {attempts.length === 1 ? 'challenge' : 'challenges'} recorded</p>
      </div>
    </div>
    <div className="mt-6 bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-black mb-4">Streak milestones</h2>
      <div className="flex flex-wrap gap-2">
        {milestones.map(n => <span key={n} className={`select-none px-4 py-2 rounded-xl text-sm font-bold ${streak >= n ? 'bg-study-accent-bg text-study-accent-dark' : 'bg-muted text-muted-foreground'}`}>🔥 {n} {n === 1 ? 'Day' : 'Days'} {streak >= n ? '✓' : ''}</span>)}
      </div>
      <p className="text-xs text-muted-foreground mt-4">Complete the daily quiz on consecutive UTC days. A missed day resets the active streak.</p>
    </div>
    <div className="mt-6 bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-black mb-1">All Ranks</h2>
      <p className="text-sm text-muted-foreground mb-4">Every tier from Bronze to Ultimate Scholar. Stars accumulate as you complete daily challenges.</p>
      <AllRanks currentStars={p?.stars || 0} />
    </div>
    <section className="mt-8">
      <h2 className="text-xl font-black mb-4">Recent quiz results</h2>
      {attempts.length === 0 ? <p className="bg-card p-6 rounded-2xl text-muted-foreground">No results yet. Take your first daily challenge!</p>
        : <div className="space-y-2">{attempts.map(a => <div key={a.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-3">
          <div><p className="font-bold">{a.day}</p><p className="text-sm text-muted-foreground">{a.score} correct · {a.wrong} wrong</p></div>
          <div className="text-right"><p className="font-black">{a.score}/5</p><p className="text-xs text-muted-foreground">{a.star_change > 0 ? '+' : ''}{a.star_change} ★ · +{a.xp_earned} XP</p></div>
        </div>)}</div>}
    </section>
  </div>;
}