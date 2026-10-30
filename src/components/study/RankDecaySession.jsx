import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function RankDecaySession() {
  const [remaining, setRemaining] = useState('');
  const [sessionNum, setSessionNum] = useState(0);
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const interval = 3 * 60 * 1000;
      const currentSession = Math.floor(now / interval);
      const nextSession = (currentSession + 1) * interval;
      const ms = nextSession - now;
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${m}:${String(s).padStart(2, '0')}`);
      setSessionNum(currentSession);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted rounded-full px-3 py-1.5">
      <Activity size={13} className="text-study-accent animate-pulse select-none" />
      Rank decay · Session #{sessionNum} · next in {remaining}
    </div>
  );
}