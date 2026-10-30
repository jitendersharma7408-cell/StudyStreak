import React, { useState } from 'react';
import { UserPlus, Mail, Check, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionHeading from '@/components/study/SectionHeading';
import BackButton from '@/components/study/BackButton';

export default function AddFriends() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState([]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    const inviteEmail = email;
    setLoading(true);
    setStatus('Sending invitation…');
    setInvited(prev => [...prev, inviteEmail]);
    setEmail('');
    try {
      await base44.users.inviteUser(inviteEmail, 'user');
      setStatus('Invitation sent successfully!');
    } catch (err) {
      setInvited(prev => prev.filter(em => em !== inviteEmail));
      setStatus(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackButton />
      <SectionHeading
        eyebrow="Grow your circle"
        title="Add Friends"
        description="Invite friends to StudyStreak and compete on the leaderboard together."
      />

      <form onSubmit={handleInvite} className="bg-card border border-border rounded-2xl p-5 mt-6">
        <label htmlFor="friend-email" className="select-none block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
          Friend's Email
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none" />
            <input
              id="friend-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:border-study-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="select-none min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-study-dark text-white hover:bg-study-accent-dark transition-colors disabled:opacity-50"
          >
            <UserPlus size={16} className="select-none" />
            {loading ? 'Sending…' : 'Invite'}
          </button>
        </div>
        {status && (
          <p className={`mt-3 text-sm font-semibold ${status.includes('success') ? 'text-study-accent' : 'text-destructive'}`}>
            {status}
          </p>
        )}
      </form>

      {invited.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-study-accent select-none" />
            <h3 className="font-bold text-muted-foreground">Invited Friends ({invited.length})</h3>
          </div>
          <div className="space-y-2">
            {invited.map((em, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <div className="select-none w-9 h-9 rounded-full bg-study-lime flex items-center justify-center text-sm font-bold text-study-accent-dark">
                  {em[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{em}</span>
                <Check size={16} className="ml-auto text-study-accent select-none" />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-8">
        Friends who join will appear on your leaderboard.
      </p>
    </div>
  );
}