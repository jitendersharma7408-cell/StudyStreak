import React, { useState } from 'react';
import { Share2, Copy, MessageCircle, Check, Link2 } from 'lucide-react';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';

export default function ShareApp() {
  const [copied, setCopied] = useState(false);
  const appUrl = 'https://study-streak-copy-89d406fe.base44.app';
  const shareText = `Check out StudyStreak — build your daily study streak! ${appUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // fallback
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'StudyStreak', text: shareText, url: appUrl });
      } catch (e) {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div>
      <BackButton />
      <SectionHeading
        eyebrow="Spread the word"
        title="Share StudyStreak"
        description="Invite your friends to join your study streaks and stay motivated together."
      />

      <div className="bg-card border border-border rounded-2xl p-5 mt-6">
        <div className="flex items-center gap-3 bg-study-accent-bg rounded-xl p-4">
          <Link2 size={20} className="text-study-accent select-none" />
          <span className="text-sm font-mono text-muted-foreground truncate flex-1">{appUrl}</span>
          <button
            onClick={handleCopy}
            className="select-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-study-dark text-white hover:bg-study-accent-dark transition-colors shrink-0"
          >
            {copied ? <><Check size={14} className="select-none" /> Copied</> : <><Copy size={14} className="select-none" /> Copy</>}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <button
          onClick={handleWhatsApp}
          className="select-none flex items-center gap-3 bg-[#25D366] text-white rounded-2xl p-5 hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={28} className="select-none" />
          <div className="text-left">
            <p className="font-bold text-lg">WhatsApp</p>
            <p className="text-sm opacity-90">Share with friends</p>
          </div>
        </button>

        <button
          onClick={handleNativeShare}
          className="select-none flex items-center gap-3 bg-study-dark text-white rounded-2xl p-5 hover:bg-study-accent-dark transition-colors"
        >
          <Share2 size={28} className="select-none" />
          <div className="text-left">
            <p className="font-bold text-lg">More</p>
            <p className="text-sm opacity-90">Native share</p>
          </div>
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        More friends, more streaks, more motivation!
      </p>
    </div>
  );
}