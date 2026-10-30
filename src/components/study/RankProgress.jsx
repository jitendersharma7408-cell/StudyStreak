import React from 'react';
import { rankFor } from './ranks';
import RankIcon from './RankIcon';
export default function RankProgress({ stars }) {
  const rank = rankFor(stars);
  return <div>
    <div className="flex justify-between text-sm font-semibold mb-2">
      <span className="flex items-center gap-1.5">
        <RankIcon name={rank.icon} size={16} className="select-none" />
        {rank.name}
      </span>
      <span>{rank.ultimate ? 'Ultimate Scholar unlocked' : `${rank.into}/${rank.size} stars to next tier`}</span>
    </div>
    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full bg-study-accent" style={{ width: `${rank.into / rank.size * 100}%` }} />
    </div>
    {rank.ultimate && <p className="mt-3 text-sm font-bold text-study-accent">✦ Ultimate Scholar</p>}
  </div>;
}