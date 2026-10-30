import React, { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown } from 'lucide-react';

export default function SubjectPicker({ subjects, value, onChange }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleSelect = (v) => {
    onChange(v);
    setOpen(false);
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            id="note-subject"
            aria-label="Select subject"
            className="select-none w-full h-11 flex items-center justify-between px-3 rounded-xl border border-border bg-card text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{value || 'Select subject'}</span>
            <ChevronDown size={18} className="select-none text-muted-foreground" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select a subject</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1 overflow-y-auto max-h-[60vh]">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                aria-pressed={s === value}
                className={`select-none w-full text-left rounded-xl px-4 py-3.5 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${s === value ? 'bg-study-accent-bg text-study-accent-dark' : 'hover:bg-muted'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="note-subject" className="h-11 text-sm font-semibold">{value || 'Select subject'}</SelectTrigger>
      <SelectContent>
        {subjects.map(s => <SelectItem key={s} value={s} className="text-sm py-2.5">{s}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}