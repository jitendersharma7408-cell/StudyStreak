import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { logoutAll } from '@/lib/guest';

export default function GuestGate() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Outlet />;

  return (
    <div className="max-w-md mx-auto mt-10 bg-card border border-border rounded-3xl p-8 text-center">
      <Lock className="mx-auto text-study-accent" size={32} />
      <h2 className="text-xl font-black mt-4">Account needed</h2>
      <p className="text-sm text-muted-foreground mt-2">
        You're using guest mode. Create a free account to save your streak, stars and progress for this feature.
      </p>
      <div className="flex flex-col gap-2 mt-6">
        <button onClick={logoutAll} className="select-none touch-manipulation min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold">
          Log in / Sign up
        </button>
        <Link to="/learn" className="select-none touch-manipulation min-h-[44px] flex items-center justify-center rounded-xl border border-border font-semibold">
          Keep exploring as guest
        </Link>
      </div>
    </div>
  );
}