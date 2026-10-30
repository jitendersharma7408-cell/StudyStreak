import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { rankFor } from '@/components/study/ranks';
import RankIcon from '@/components/study/RankIcon';
import SectionHeading from '@/components/study/SectionHeading';
import { Trophy, Award } from 'lucide-react';

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  useEffect(() => {
    base44.entities.StudentProgress.list('-stars', 500)
      .then(s => { setStudents(s); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const rows = [...students].sort((a, b) => (b.stars || 0) - (a.stars || 0) || (b.xp || 0) - (a.xp || 0));
  const weeklyRows = rows.filter(s => s.updated_date && new Date(s.updated_date) >= weekAgo);

  const displayRows = tab === 'weekly' ? weeklyRows : rows;
  return (
    <div>
      <SectionHeading eyebrow="Study together" title="Leaderboard" description="All students ranked by their stars and ability. Keep climbing to reach the top!" />
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('all')} aria-pressed={tab === 'all'} className={`select-none min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm ${tab === 'all' ? 'bg-study-dark text-white' : 'bg-card border border-border'}`}>All-Time</button>
        <button onClick={() => setTab('weekly')} aria-pressed={tab === 'weekly'} className={`select-none min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm ${tab === 'weekly' ? 'bg-study-dark text-white' : 'bg-card border border-border'}`}>This Week</button>
        <Link to="/achievements" className="select-none min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm bg-study-accent-bg text-study-accent-dark inline-flex items-center gap-2 ml-auto"><Award size={16} className="select-none" /> Badges</Link>
      </div>
      {loading ? <p className="text-muted-foreground">Loading leaderboard…</p>
        : error ? <p className="text-destructive">{error}</p>
        : rows.length === 0 ? <div className="bg-card rounded-2xl p-8 text-muted-foreground">No students yet. Be the first to play!</div>
        : displayRows.length === 0 ? <div className="bg-card rounded-2xl p-8 text-muted-foreground">No students yet for this period.</div>
        : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-[65px_1fr_90px_90px_160px] px-5 py-3 text-xs uppercase tracking-widest font-bold text-muted-foreground bg-muted">
              <span>Place</span><span>Student</span><span>Stars</span><span>XP</span><span>Tier</span>
            </div>
            {displayRows.map((s, i) => {
              const rank = rankFor(s.stars || 0);
              const isTop3 = i < 3;
              const medalColor = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground';
              return (
                <div key={s.id} className={`grid grid-cols-[38px_1fr_auto] sm:grid-cols-[65px_1fr_90px_90px_160px] items-center gap-2 px-4 sm:px-5 py-4 border-t border-border ${isTop3 ? 'bg-study-accent-bg' : ''}`}>
                  <span className={`select-none font-black ${medalColor} text-lg`}>#{i + 1}</span>
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="select-none w-9 h-9 rounded-full bg-study-accent-bg flex items-center justify-center text-sm font-bold text-study-accent shrink-0">
                      {(s.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold truncate block">{s.name || 'Unknown'}</span>
                      <span className="sm:hidden text-xs text-muted-foreground flex items-center gap-1">
                        <RankIcon name={rank.icon} size={12} className="select-none" /> {rank.name} · {s.stars || 0} ★ · {s.xp || 0} XP
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-right sm:text-left">{s.stars || 0} ★</span>
                  <span className="hidden sm:block text-muted-foreground">{s.xp || 0} XP</span>
                  <span className="hidden sm:flex items-center gap-1.5 text-sm font-semibold">
                    <RankIcon name={rank.icon} size={15} className="select-none" /> {rank.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}