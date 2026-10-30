import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import NavigationGroup from '@/components/study/NavigationGroup';
import { navGroups } from '@/components/study/NavData';

export default function MobileMoreSheet({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id="mobile-more-menu" side="bottom" className="rounded-t-2xl p-3 pt-4 pb-[max(.75rem,env(safe-area-inset-bottom))] max-h-[calc(100dvh-1rem)]">
        <SheetHeader className="mb-2 text-left">
          <SheetTitle className="text-sm">All Menu</SheetTitle>
          <SheetDescription className="sr-only">Choose any page without scrolling or swiping.</SheetDescription>
        </SheetHeader>
        <nav aria-label="All navigation options" className="min-w-0 space-y-2">
          {navGroups.map(group => (
            <NavigationGroup key={group.label} group={group} grid includeLogout={group.label === 'ACCOUNT'} onNavigate={() => onOpenChange(false)} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}