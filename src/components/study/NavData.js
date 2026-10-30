import {
  Flame, BookOpen, Trophy, BarChart3, ChartNoAxesCombined,
  Layers, Award, Share2, UserPlus, Sparkles, UserRound,
  GraduationCap, Repeat, FileText, ClipboardList
} from 'lucide-react';

export const navGroups = [
  {
    label: 'STUDY',
    items: [
      { to: '/', label: 'Dashboard', icon: Flame, end: true },
      { to: '/quiz', label: 'Daily Challenge', icon: GraduationCap },
      { to: '/revision', label: 'Revision', icon: Repeat },
      { to: '/flashcards', label: 'Flashcards', icon: Layers },
    ]
  },
  {
    label: 'LEARN',
    items: [
      { to: '/learn', label: 'Learn', icon: BookOpen },
      { to: '/notes', label: 'Notes', icon: FileText },
      { to: '/ask-ai', label: 'Doubt AI', icon: Sparkles },
      { to: '/papers', label: 'PYQ Papers', icon: ClipboardList },
    ]
  },
  {
    label: 'PROGRESS',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      { to: '/achievements', label: 'Achievements', icon: Award },
      { to: '/progress', label: 'Progress', icon: ChartNoAxesCombined },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/profile', label: 'Profile', icon: UserRound },
      { to: '/share', label: 'Share App', icon: Share2 },
      { to: '/friends', label: 'Add Friends', icon: UserPlus },
    ]
  }
];

export const allNavItems = navGroups.flatMap(g => g.items);
export const allNavRoutes = allNavItems.map(i => i.to);

export const mobilePrimary = [
  { to: '/', label: 'Home', icon: Flame, end: true },
  { to: '/quiz', label: 'Quiz', icon: GraduationCap },
  { to: '/flashcards', label: 'Cards', icon: Layers },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
];

export const mobileTabRoutes = mobilePrimary.map(i => i.to);