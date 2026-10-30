import React from 'react';
import { tiers } from '@/components/study/ranks';
import RankIcon from '@/components/study/RankIcon';
import { Star } from 'lucide-react';

export default function AllRanks({ currentStars = 0 }) {
  let cumulative = 0;
  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => {
        const start = cumulative;
        const end = cumulative + tier.size;
        cumulative = end;
        const isCurrent = currentStars >= start && currentStars < end;
        const isPassed = currentStars >= end;
        const isUltimate = i === tiers.length - 1;
        return (
          <div
            key={i}
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 border-2 transition-colors ${
              isCurrent
                ? 'border-study-accent bg-study-accent-bg'
                : isPassed
                ? 'border-border bg-muted'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`select-none w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-sm font-black ${
                  isUltimate
                    ? 'bg-study-dark text-study-lime'
                    : isPassed
                    ? 'bg-study-lime text-study-accent-dark'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isUltimate ? <RankIcon name="Sparkles" size={16} /> : <RankIcon name={tier.icon} size={16} />}
              </span>
              <span className={`font-bold ${isCurrent ? 'text-study-accent-dark' : 'text-muted-foreground'}`}>
                {tier.name}
              </span>
            </div>
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Star size={12} className="text-study-accent select-none" />
              {start}–{end - 1}
              {isCurrent && <span className="ml-2 text-study-accent">← you are here</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}