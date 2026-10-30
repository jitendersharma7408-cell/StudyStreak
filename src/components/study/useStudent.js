import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function useStudent() {
  const [data, setData] = useState({ loading: true, user: null, progress: null, attempts: [], error: '' });
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        const [progress, attempts] = await Promise.all([
          base44.entities.StudentProgress.filter({ student_id: user.id }),
          base44.entities.QuizAttempt.filter({ student_id: user.id }, '-completed_at', 30)
        ]);
        if (active) setData({ loading: false, user, progress: progress[0] || null, attempts, error: '' });
      } catch (e) { if (active) setData(d => ({ ...d, loading: false, error: e.message })); }
    })();
    return () => { active = false; };
  }, []);
  return data;
}