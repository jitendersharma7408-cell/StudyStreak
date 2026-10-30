import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { mobilePrimary } from '@/components/study/NavData';
import MobileMoreSheet from '@/components/study/MobileMoreSheet';

export default function MobileNav({ activeTabRoute, onTabClick }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border grid grid-cols-5 gap-0 py-1 pb-[max(.375rem,env(safe-area-inset-bottom))]"
        style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
        aria-label="Mobile navigation"
      >
        {mobilePrimary.map(({ to, label, icon: Icon, end }) => {
          const isActive = activeTabRoute === to;
          return (
            <NavLink
              key={to}
              end={end}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => onTabClick(e, to)}
              className={`select-none flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-xs font-semibold min-h-[44px] justify-center touch-action-manipulation ${isActive ? 'text-study-accent' : 'text-muted-foreground'}`}
            >
              <Icon size={18} className="select-none" />
              {label}
            </NavLink>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          aria-label="More menu"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
          className="select-none flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-xs font-semibold min-h-[44px] justify-center text-muted-foreground touch-action-manipulation"
        >
          <MoreHorizontal size={18} className="select-none" />
          More
        </button>
      </nav>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}