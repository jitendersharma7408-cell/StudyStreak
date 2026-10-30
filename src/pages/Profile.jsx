import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { rankFor, liveStreak } from '@/components/study/ranks';
import useStudent from '@/components/study/useStudent';
import SectionHeading from '@/components/study/SectionHeading';
import UltimateBadge from '@/components/study/UltimateBadge';
import RankIcon from '@/components/study/RankIcon';
import BackButton from '@/components/study/BackButton';
import { COURSES, COURSE_STREAMS } from '@/components/study/courseData';
import FocusTopics from '@/components/study/FocusTopics';
import useFocusTopics from '@/components/study/useFocusTopics';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, Layers, Check, X } from 'lucide-react';
export default function Profile() {
  const { loading, user, progress, error } = useStudent();
  const [name, setName] = useState(''), [saving, setSaving] = useState(false), [message, setMessage] = useState(''), [deleting, setDeleting] = useState(false);
  const [fcStats, setFcStats] = useState(null);
  const [course, setCourse] = useState(''), [stream, setStream] = useState(''), [semester, setSemester] = useState('');
  const [prefSaving, setPrefSaving] = useState(false), [prefMessage, setPrefMessage] = useState('');
  const [focusKey, setFocusKey] = useState(0);
  const focusTopics = useFocusTopics(focusKey);
  useEffect(() => {
    base44.functions.invoke('flashcardSession', { action: 'getStats' })
      .then(r => setFcStats(r.data))
      .catch(() => {});
  }, []);
  useEffect(() => { if (!loading) { setName(progress?.name || user?.full_name || ''); setCourse(progress?.course || ''); setStream(progress?.stream || ''); setSemester(progress?.semester || ''); } }, [loading, progress, user]);
  function onCourseChange(c) {
    setCourse(c);
    const streams = COURSE_STREAMS[c] || [];
    if (stream && !streams.includes(stream)) setStream('');
  }
  async function save(e) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    const previousName = progress?.name || user?.full_name || '';
    setName(name.trim()); // optimistic: immediately reflect the new name
    setSaving(true); setMessage('Saving…');
    try { if (progress) await base44.entities.StudentProgress.update(progress.id, { name: name.trim() }); else await base44.entities.StudentProgress.create({ student_id: user.id, name: name.trim(), stars: 0, xp: 0, streak: 0, total_attempted: 0, total_correct: 0, total_wrong: 0 }); setMessage('Profile saved.'); }
    catch (err) { setName(previousName); setMessage(err.message); }
    finally { setSaving(false); }
  }
  async function submitPreferences(e) {
    e.preventDefault();
    if (prefSaving) return;
    if (!course || !semester) { setPrefMessage('Please select course and semester.'); return; }
    if ((COURSE_STREAMS[course] || []).length > 0 && !stream) { setPrefMessage('Please select a stream.'); return; }
    setPrefSaving(true); setPrefMessage('Saving…');
    try {
      if (progress) await base44.entities.StudentProgress.update(progress.id, { course, stream: stream || undefined, semester });
      else await base44.entities.StudentProgress.create({ student_id: user.id, name: name.trim() || user?.full_name || 'Student', course, stream: stream || undefined, semester, stars: 0, xp: 0, streak: 0, total_attempted: 0, total_correct: 0, total_wrong: 0 });
      setPrefMessage('Selection saved.');
      setFocusKey(k => k + 1);
    } catch (err) { setPrefMessage(err.message); }
    finally { setPrefSaving(false); }
  }
  async function deleteAccount() {
    setDeleting(true);
    try {
      if (progress) await base44.entities.StudentProgress.delete(progress.id);
      base44.auth.logout();
    } catch (err) { setMessage(err.message); }
    finally { setDeleting(false); }
  }
  if (loading) return <p>Loading profile…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  const availableStreams = COURSE_STREAMS[course] || [];
  return <div className="max-w-2xl">
    <BackButton />
    <SectionHeading eyebrow="Your account" title="Student Profile" description="Your learning identity and stats in one place." />
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
      <div className="flex gap-5 items-center">
        <div aria-label="Profile avatar" className="select-none w-20 h-20 rounded-3xl bg-study-lime flex items-center justify-center text-3xl font-black">{(name || 'S').trim().charAt(0).toUpperCase()}</div>
        <div>
          <h2 className="text-xl font-black">{name || progress?.name || user?.full_name || 'Student'}</h2>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          <p className="text-sm font-bold text-study-accent mt-1 flex items-center gap-2"><RankIcon name={rankFor(progress?.stars || 0).icon} size={14} className="select-none" />{rankFor(progress?.stars || 0).name}{rankFor(progress?.stars || 0).ultimate && <UltimateBadge />}</p>
        </div>
      </div>
      <form onSubmit={save} className="mt-8">
        <label htmlFor="profile-name" className="font-bold text-sm">Display name</label>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input id="profile-name" required maxLength={60} value={name} onChange={e => setName(e.target.value)} className="border border-border rounded-xl px-4 py-3 flex-1 outline-none focus:border-study-accent" />
          <button disabled={saving} className="select-none min-h-[44px] bg-study-dark text-white rounded-xl px-5 py-3 font-bold disabled:opacity-50">{saving ? 'Saving…' : 'Save name'}</button>
        </div>
        {message && <p role="status" className="text-sm mt-2 text-muted-foreground">{message}</p>}
      </form>
      <form onSubmit={submitPreferences} className="mt-6 border-t border-border pt-6 space-y-4">
        <p className="font-bold text-sm">Study preferences</p>
        <p className="text-xs text-muted-foreground -mt-2">Your daily challenge questions are tailored to your course, stream, and semester.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="profile-course" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Course</label>
            <select id="profile-course" value={course} onChange={e => onCourseChange(e.target.value)} className="select-none w-full min-h-[44px] border border-border rounded-xl px-3 bg-card outline-none focus:border-study-accent">
              <option value="">Select course…</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="profile-stream" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Stream / Branch</label>
            <select id="profile-stream" value={stream} onChange={e => setStream(e.target.value)} disabled={!course || availableStreams.length === 0} className="select-none w-full min-h-[44px] border border-border rounded-xl px-3 bg-card outline-none focus:border-study-accent disabled:opacity-50">
              <option value="">{course ? (availableStreams.length === 0 ? 'N/A' : 'Select stream…') : 'Pick course first'}</option>
              {availableStreams.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="profile-semester" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Semester</label>
            <select id="profile-semester" value={semester} onChange={e => setSemester(e.target.value)} className="select-none w-full min-h-[44px] border border-border rounded-xl px-3 bg-card outline-none focus:border-study-accent">
              <option value="">Select semester…</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={`Semester ${n}`}>Semester {n}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button disabled={prefSaving} className="select-none min-h-[44px] bg-study-dark text-white rounded-xl px-5 py-3 font-bold disabled:opacity-50">{prefSaving ? 'Saving…' : 'Submit'}</button>
          {prefMessage && <p role="status" className="text-sm text-muted-foreground">{prefMessage}</p>}
        </div>
        {focusTopics.length > 0 && <div className="pt-2"><FocusTopics topics={focusTopics} compact /></div>}
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 border-t border-border pt-7">
        {[['Stars', `${progress?.stars || 0} ★`], ['XP', progress?.xp || 0], ['Streak', `${liveStreak(progress)} days`], ['Accuracy', `${progress?.total_attempted ? Math.round(progress.total_correct / progress.total_attempted * 100) : 0}%`]].map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="font-black text-lg mt-1">{value}</p></div>)}
      </div>
      <p className="text-sm text-muted-foreground mt-5">{progress?.total_attempted || 0} questions attempted · {progress?.total_correct || 0} correct · {progress?.total_wrong || 0} wrong</p>
    </div>

    {fcStats && fcStats.totalSessions > 0 && (
      <div className="mt-6 bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black mb-4 flex items-center gap-2"><Layers size={18} className="text-study-accent" /> Flashcard Score</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><p className="text-xs text-muted-foreground">Sessions</p><p className="font-black text-lg mt-1">{fcStats.totalSessions}</p></div>
          <div><p className="text-xs text-muted-foreground">Cards Known</p><p className="font-black text-lg mt-1 text-study-accent">{fcStats.totalCardsKnown}</p></div>
          <div><p className="text-xs text-muted-foreground">Still Learning</p><p className="font-black text-lg mt-1 text-destructive">{fcStats.totalCardsLearning}</p></div>
          <div><p className="text-xs text-muted-foreground">Mastery Rate</p><p className="font-black text-lg mt-1">{fcStats.masteryRate}%</p></div>
        </div>
        <div className="h-2.5 bg-muted rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-study-accent rounded-full transition-all" style={{ width: `${fcStats.masteryRate}%` }} />
        </div>
      </div>
    )}

    <div className="mt-6 bg-card border border-destructive/30 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="select-none w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-destructive">Delete Account</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently delete your account and all associated data. This includes all your progress, streaks, quiz history, and leaderboard data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="select-none mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
                <Trash2 size={16} className="select-none" /> Delete My Account
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your StudentProgress data — all stars, XP, streaks, quiz attempts, and leaderboard ranking will be lost forever. This action cannot be undone. You will be logged out immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:opacity-90">
                  {deleting ? 'Deleting…' : 'Yes, delete everything'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  </div>;
}