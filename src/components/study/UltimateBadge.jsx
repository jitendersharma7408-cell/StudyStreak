import React from 'react';
import { Crown } from 'lucide-react';

export default function UltimateBadge() {
  return (
    <span className="select-none inline-flex items-center gap-1.5 bg-gradient-to-r from-study-dark to-study-dark text-study-lime px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
      <Crown size={14} className="select-none" /> Ultimate Scholar
    </span>
  );
}