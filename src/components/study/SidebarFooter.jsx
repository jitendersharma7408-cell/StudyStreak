import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRound, LogOut } from 'lucide-react';
import { logoutAll } from '@/lib/guest';

export default function SidebarFooter() {
  return (
    <footer className="mt-auto shrink-0 border-t border-border px-2 py-1">
      <NavLink to="/profile" className={({ isActive }) => `select-none touch-manipulation flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-semibold ${isActive ? 'bg-study-accent-bg text-study-accent-dark' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
        <UserRound size={16} className="shrink-0" /><span>Profile</span>
      </NavLink>
      <button type="button" onClick={logoutAll} className="select-none touch-manipulation flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
        <LogOut size={16} className="shrink-0" /><span>Logout</span>
      </button>
    </footer>
  );
}