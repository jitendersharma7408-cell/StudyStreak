import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

export default function UltimateBanner({ name }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-study-dark to-study-dark text-white p-7 sm:p-9 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-study-lime/10 rounded-full blur-3xl" />
      <div className="relative">
        <span className="select-none inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-study-lime">
          <Sparkles size={16} className="select-none" /> Ultimate Scholar
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-3 flex items-center gap-2">
          <Crown className="text-study-lime select-none" size={28} />
          {(name || 'Student').split(' ')[0]}, you've conquered every rank! 👑
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          You reached the highest tier — <b className="text-study-lime">Excellent Student</b>. There is nothing left to climb. Keep practicing to maintain your title!
        </p>
      </div>
    </div>
  );
}