import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Award, Target, Check, BookOpen, Star, Zap, Trophy, Lock } from 'lucide-react';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';
import { rankFor, liveStreak } from '@/components/study/ranks';
import { getRankIcon } from '@/components/study/RankIcon';
import useStudent from '@/components/study/useStudent';

const BADGES = [
  { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: BookOpen, color: 'bg-study-accent-bg text-study-accent-dark' },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day streak', icon: Flame, color: 'bg-study-orange-bg text-orange-600' },
  { id: 'streak_30', name: 'Monthly Master', desc: '30-day streak', icon: Flame, color: 'bg-destructive/10 text-destructive' },
  { id: 'correct_100', name: 'Century', desc: '100 correct answers', icon: Target, color: 'bg-study-purple-bg text-purple-600' },
  { id: 'stars_10', name: 'Rising Star', desc: 'Reach 10 stars', icon: Star, color: 'bg-study-accent-bg text-study-accent-dark' },
  { id: 'perfect_5', name: 'Sharp Shooter', desc: 'Score 5/5 on a challenge', icon: Zap, color: 'bg-study-orange-bg text-orange-600' },
  { id: 'challenges_10', name: 'Consistent', desc: 'Complete 10 daily challenges', icon: Trophy, color: 'bg-study-purple-bg text-purple-600' },
  { id: 'subject_master', name: 'Subject Master', desc: '90%+ accuracy in a subject', icon: Award, color: 'bg-study-accent-bg text-study-accent-dark' },
];

export default function Achievements() {
  const { loading, progress, attempts, error } = useStudent();
  const [subjectAccuracy, setSubjectAccuracy] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getAnalytics', { action: 'get' })
      .then(r => setSubjectAccuracy(r.data?.subjectAccuracy || []))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  if (loading || analyticsLoading) return <p className="text-muted-foreground">Loading achievements…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  const streak = liveStreak(progress);
  const totalCorrect = progress?.total_correct || 0;
  const totalAttempted = progress?.total_attempted || 0;
  const stars = progress?.stars || 0;
  const completedChallenges = attempts.filter(a => a.status === 'completed' && a.mode === 'daily').length;
  const hasPerfect5 = attempts.some(a => a.score === 5);
  const hasSubjectMaster = subjectAccuracy.some(s => s.accuracy >= 90 && s.total >= 5);

  const earned = {
    first_quiz: totalAttempted >= 5,
    streak_7: streak >= 7,
    streak_30: streak >= 30,
    correct_100: totalCorrect >= 100,
    stars_10: stars >= 10,
    perfect_5: hasPerfect5,
    challenges_10: completedChallenges >= 10,
    subject_master: hasSubjectMaster,
  };

  const earnedCount = Object.values(earned).filter(Boolean).length;
  const rank = rankFor(stars);

  return (
    <div>
      <BackButton />
      <SectionHeading eyebrow="Your trophies" title="Achievements" description="Unlock badges as you learn. Each one marks a milestone in your journey." />

      <div className="bg-study-dark text-white rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-study-lime font-bold uppercase tracking-widest text-xs">{earnedCount} of {BADGES.length} unlocked</p>
            <h2 className="text-2xl font-black mt-2">Your Badge Collection</h2>
          </div>
          <div className="select-none w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            {React.createElement(getRankIcon(rank.icon), { size: 32, className: 'select-none' })}
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full mt-5"><div className="h-full bg-study-lime rounded-full transition-all" style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BADGES.map(badge => {
          const isEarned = earned[badge.id];
          const Icon = badge.icon;
          return (
            <div key={badge.id} className={`relative rounded-2xl border-2 p-5 text-center transition-all ${isEarned ? 'border-study-accent ' + badge.color : 'border-border bg-card opacity-60'}`}>
              <div className="relative inline-block">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${isEarned ? badge.color : 'bg-muted'}`}>
                  <Icon size={26} className={isEarned ? '' : 'text-muted-foreground'} />
                </div>
                {!isEarned && <div className="absolute inset-0 flex items-center justify-center"><Lock size={16} className="text-muted-foreground" /></div>}
              </div>
              <h3 className="font-black text-sm mt-3">{badge.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
              {isEarned && <p className="text-xs font-bold text-study-accent mt-2">✓ Unlocked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}