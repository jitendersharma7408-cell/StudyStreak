import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Target, TrendingUp, Zap, Star, Check, X, Brain, Layers } from 'lucide-react';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';
import StatCard from '@/components/study/StatCard';

const COLORS = ['#65a30d', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export default function Analytics() {
  const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    base44.functions.invoke('getAnalytics', { action: 'get' })
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading analytics…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <BackButton />
      <SectionHeading eyebrow="Your insights" title="Analytics" description="Track your strengths, spot weak areas, and watch your progress grow." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Zap} label="Total XP" value={data.xp} color="bg-study-accent-bg" />
        <StatCard icon={Star} label="Stars" value={`${data.stars} ★`} color="bg-study-purple-bg" />
        <StatCard icon={Target} label="Overall Accuracy" value={`${data.overallAccuracy}%`} color="bg-study-orange-bg" />
        <StatCard icon={Brain} label="Questions" value={data.totalAttempted} color="bg-study-accent-bg" />
      </div>

      {/* Subject Accuracy */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-study-accent" /> Subject Accuracy</h2>
        {data.subjectAccuracy.length === 0 ? (
          <p className="text-muted-foreground text-sm">Answer some quiz questions to see your subject-wise accuracy.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.subjectAccuracy} margin={{ top: 5, right: 10, left: -15, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="subject" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                {data.subjectAccuracy.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mastered vs Weak Topics */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h3 className="font-black mb-4 flex items-center gap-2"><Check size={18} className="text-study-accent" /> Mastered Topics</h3>
          {data.masteredTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mastered topics yet. Aim for 80%+ accuracy in a topic with 3+ attempts.</p>
          ) : (
            <div className="space-y-2">
              {data.masteredTopics.map(t => (
                <div key={t.topic} className="flex items-center justify-between bg-study-accent-bg rounded-xl px-4 py-2.5">
                  <span className="font-semibold text-sm">{t.topic}</span>
                  <span className="text-sm font-bold text-study-accent">{t.accuracy}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h3 className="font-black mb-4 flex items-center gap-2"><X size={18} className="text-destructive" /> Weak Topics</h3>
          {data.weakTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weak topics detected. Keep practicing!</p>
          ) : (
            <div className="space-y-2">
              {data.weakTopics.map(t => (
                <div key={t.topic} className="flex items-center justify-between bg-destructive/5 rounded-xl px-4 py-2.5">
                  <span className="font-semibold text-sm">{t.topic}</span>
                  <span className="text-sm font-bold text-destructive">{t.accuracy}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streak Trend */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-black mb-4">Daily Challenge Trend</h2>
        {data.streakTrend.length === 0 ? (
          <p className="text-muted-foreground text-sm">Complete daily challenges to see your trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.streakTrend} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="score" stroke="#65a30d" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Difficulty Radar */}
      {data.difficultyStats.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-black mb-4">Accuracy by Difficulty</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={data.difficultyStats}>
              <PolarGrid />
              <PolarAngleAxis dataKey="level" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Radar dataKey="accuracy" stroke="#65a30d" fill="#65a30d" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Flashcard Performance */}
      {data.flashcardStats && data.flashcardStats.totalSessions > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Layers size={20} className="text-study-accent" /> Flashcard Performance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-study-accent-bg rounded-xl p-3"><p className="text-xs text-muted-foreground">Sessions</p><p className="text-xl font-black mt-1">{data.flashcardStats.totalSessions}</p></div>
            <div className="bg-study-purple-bg rounded-xl p-3"><p className="text-xs text-muted-foreground">Cards Known</p><p className="text-xl font-black mt-1 text-study-accent">{data.flashcardStats.totalCardsKnown}</p></div>
            <div className="bg-destructive/5 rounded-xl p-3"><p className="text-xs text-muted-foreground">Still Learning</p><p className="text-xl font-black mt-1 text-destructive">{data.flashcardStats.totalCardsLearning}</p></div>
            <div className="bg-study-orange-bg rounded-xl p-3"><p className="text-xs text-muted-foreground">Mastery</p><p className="text-xl font-black mt-1">{data.flashcardStats.masteryRate}%</p></div>
          </div>
          {data.flashcardStats.recentSessions && data.flashcardStats.recentSessions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-muted-foreground mb-2">Recent Sessions</p>
              {data.flashcardStats.recentSessions.slice(0, 5).map((s, i) => {
                const pct = s.total_cards > 0 ? Math.round((s.cards_known / s.total_cards) * 100) : 0;
                return (
                  <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="font-semibold text-sm">{s.topic}</p>
                      <p className="text-xs text-muted-foreground">{s.date} · {s.cards_known}/{s.total_cards} known · +{s.xp_earned} XP</p>
                    </div>
                    <span className={`text-sm font-bold ${pct >= 80 ? 'text-study-accent' : pct >= 50 ? 'text-muted-foreground' : 'text-destructive'}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}