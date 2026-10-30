import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Loads focus topics; re-fetches whenever refreshKey changes and drops stale responses.
export default function useFocusTopics(refreshKey = 0) {
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    let active = true;
    setTopics([]);
    base44.functions.invoke('getFocusTopics', {})
      .then(r => { if (active) setTopics(r.data?.focusTopics || []); })
      .catch(() => {});
    return () => { active = false; };
  }, [refreshKey]);
  return topics;
}