import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const body = await req.json();
    const day = new Date().toISOString().slice(0, 10);

    // ── SAVE SESSION ───────────────────────────────────────────
    if (body.action === 'save') {
      const { topic, subject, noteId, cardsKnown, cardsLearning, totalCards } = body;
      if (!topic) return Response.json({ error: 'Missing topic.' }, { status: 400 });

      const known = Math.max(0, parseInt(cardsKnown) || 0);
      const learning = Math.max(0, parseInt(cardsLearning) || 0);
      const total = Math.max(known + learning, parseInt(totalCards) || 0);
      const xpEarned = known; // 1 XP per card marked "Know it"

      const session = await base44.entities.FlashcardSession.create({
        student_id: user.id,
        topic,
        subject: subject || '',
        note_id: noteId || '',
        cards_known: known,
        cards_learning: learning,
        total_cards: total,
        xp_earned: xpEarned,
        date: day
      });

      // Update StudentProgress XP
      const previous = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
      const name = previous?.name || user.full_name || user.email.split('@')[0];
      const progress = {
        student_id: user.id,
        name,
        stars: previous?.stars || 0,
        xp: (previous?.xp || 0) + xpEarned,
        streak: previous?.streak || 0,
        last_completed_day: previous?.last_completed_day || '',
        total_attempted: previous?.total_attempted || 0,
        total_correct: previous?.total_correct || 0,
        total_wrong: previous?.total_wrong || 0
      };
      if (previous) await base44.entities.StudentProgress.update(previous.id, progress);
      else await base44.entities.StudentProgress.create(progress);

      return Response.json({ session, xpEarned, progress });
    }

    // ── GET FLASHCARD STATS ────────────────────────────────────
    if (body.action === 'getStats') {
      const sessions = await base44.entities.FlashcardSession.filter({ student_id: user.id }, '-date', 100);
      const totalSessions = sessions.length;
      const totalCardsKnown = sessions.reduce((sum, s) => sum + (s.cards_known || 0), 0);
      const totalCardsLearning = sessions.reduce((sum, s) => sum + (s.cards_learning || 0), 0);
      const totalCards = sessions.reduce((sum, s) => sum + (s.total_cards || 0), 0);
      const masteryRate = totalCards > 0 ? Math.round((totalCardsKnown / totalCards) * 100) : 0;

      return Response.json({
        totalSessions,
        totalCardsKnown,
        totalCardsLearning,
        totalCards,
        masteryRate,
        recentSessions: sessions.slice(0, 10)
      });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}