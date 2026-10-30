import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logoutAll } from '@/lib/guest';

export default function NavigationGroup({ group, grid = false, onNavigate, includeLogout = false }) {
  const itemClass = `select-none touch-manipulation flex min-w-0 items-center gap-2 rounded-md px-2 font-semibold ${grid ? 'h-9 text-xs' : 'h-8 text-[13px]'}`;
  return (
    <section className="min-w-0" aria-label={group.label}>
      <h2 className="px-2 text-[11px] leading-4 font-bold uppercase tracking-wider text-muted-foreground">{group.label}</h2>
      <div className={grid ? 'grid grid-cols-2 gap-1 mt-1' : 'flex flex-col gap-0.5'}>
        {group.items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) => `${itemClass} ${isActive ? 'bg-study-accent-bg text-study-accent-dark' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <Icon size={16} className="shrink-0" />
            <span className="min-w-0 whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
        {includeLogout && (
          <button type="button" onClick={logoutAll} className={`${itemClass} text-muted-foreground hover:bg-muted hover:text-foreground`}>
            <LogOut size={16} className="shrink-0" /><span>Logout</span>
          </button>
        )}
      </div>
    </section>
  );
}