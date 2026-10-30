import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Apple, Play } from 'lucide-react';
import SectionHeading from '@/components/study/SectionHeading';

export default function DownloadApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallable(false);
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Get the app"
        title="Download StudyStreak"
        description="Take your study streaks everywhere. Install on your device or download from your app store."
      />

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {/* App Store */}
        <a
          href="#"
          className="flex items-center gap-3 bg-[#202e31] text-white rounded-2xl p-5 hover:bg-[#304a11] transition-colors"
        >
          <Apple size={32} />
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">Download on the</p>
            <p className="text-lg font-bold">App Store</p>
          </div>
        </a>

        {/* Play Store */}
        <a
          href="#"
          className="flex items-center gap-3 bg-card border border-border rounded-2xl p-5 hover:border-study-accent transition-colors"
        >
          <Play size={32} className="text-[#578518]" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Get it on</p>
            <p className="text-lg font-bold text-foreground">Google Play</p>
          </div>
        </a>
      </div>

      {/* PWA Install */}
      <div className="mt-4 bg-muted rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#ccf36b] flex items-center justify-center shrink-0">
            <Smartphone size={22} className="text-[#304a11]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Install as Web App</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Add StudyStreak directly to your home screen — works offline, no app store needed.
            </p>
            {installable ? (
              <button
                onClick={handleInstall}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#202e31] text-white hover:bg-[#304a11] transition-colors"
              >
                <Download size={16} />
                Install Now
              </button>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground/70">
                Use your browser menu → <span className="font-semibold">"Add to Home Screen"</span> to install.
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground/70 mt-8">
        StudyStreak is available on iOS, Android, and the Web.
      </p>
    </div>
  );
}