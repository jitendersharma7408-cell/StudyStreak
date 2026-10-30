import React from 'react';
import { GraduationCap } from 'lucide-react';
import { navGroups } from '@/components/study/NavData';
import NavigationGroup from '@/components/study/NavigationGroup';
import SidebarFooter from '@/components/study/SidebarFooter';

const mainGroups = navGroups.map(group => ({ ...group, items: group.items.filter(item => item.to !== '/profile') }));

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 min-w-0 shrink-0 h-dvh sticky top-0 bg-card border-r border-border select-none">
      {/* Compact logo header */}
      <div className="px-3.5 h-10 flex items-center gap-2 border-b border-border shrink-0">
        <span className="w-6 h-6 bg-study-lime rounded-md flex items-center justify-center">
          <GraduationCap size={16} className="select-none" />
        </span>
        <span className="text-sm font-black tracking-tight">StudyStreak<span className="text-study-accent">.</span></span>
      </div>

      <nav className="min-h-0 min-w-0 px-2 py-1 space-y-1" aria-label="Desktop navigation">
        {mainGroups.map(group => <NavigationGroup key={group.label} group={group} />)}
      </nav>
      <SidebarFooter />
    </aside>
  );
}