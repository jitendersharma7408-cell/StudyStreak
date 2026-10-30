import React from 'react';
import { Medal, Award, Trophy, Gem, Flame, Zap, Crown, Castle, Sparkles, Shield } from 'lucide-react';

const iconMap = { Medal, Award, Trophy, Gem, Flame, Zap, Crown, Castle, Sparkles, Shield };

export function getRankIcon(name) {
  return iconMap[name] || Medal;
}

export default function RankIcon({ name, size = 16, className = '' }) {
  const Icon = iconMap[name] || Medal;
  return <Icon size={size} className={className} />;
}