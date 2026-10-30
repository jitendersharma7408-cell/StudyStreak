import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

function timeUntilMidnightUTC() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = tomorrow - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function SessionCountdown() {
  const [t, setT] = useState(timeUntilMidnightUTC());
  useEffect(() => {
    const id = setInterval(() => setT(timeUntilMidnightUTC()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
      <Clock size={14} className="text-study-accent select-none" />
      New challenge in
      <span className="tabular-nums text-study-accent-dark">
        {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </span>
    </div>
  );
}