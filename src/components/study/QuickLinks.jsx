import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, NotebookTabs, BookOpen, Flame, Star, Trophy, ChartNoAxesCombined, ArrowUpRight, FileText, BarChart3, Layers, Award, RotateCcw } from 'lucide-react';
const items = [
  { label: 'Daily Challenge', to: '/quiz', icon: Brain },
  { label: 'Ask AI', to: '/ask-ai', icon: Sparkles },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Flashcards', to: '/flashcards', icon: Layers },
  { label: 'Topic Notes', to: '/notes', icon: NotebookTabs },
  { label: 'Study Material', to: '/material', icon: BookOpen },
  { label: 'Question Papers', to: '/papers', icon: FileText },
  { label: 'Achievements', to: '/achievements', icon: Award },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
  { label: 'My Progress', to: '/progress', icon: ChartNoAxesCombined }
];
export default function QuickLinks() {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {items.map(({ label, to, icon: Icon }) =>
      <Link
        key={label}
        to={to}
        className="select-none group bg-card border border-border rounded-2xl p-4 min-h-28 flex flex-col justify-between hover:border-study-accent hover:shadow-md transition-all"
      >
        <div className="flex justify-between">
          <Icon size={22} className="text-study-accent select-none" />
          <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground select-none" />
        </div>
        <span className="font-bold text-sm">{label}</span>
      </Link>
    )}
  </div>;
}