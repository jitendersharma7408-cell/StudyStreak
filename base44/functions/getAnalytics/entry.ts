import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const body = await req.json();

    // ── GET ANALYTICS DATA ─────────────────────────────────────
    if (body.action === 'get') {
      const [answers, attempts, progress, allQuestions] = await Promise.all([
        base44.entities.QuizAnswer.filter({ student_id: user.id }),
        base44.entities.QuizAttempt.filter({ student_id: user.id }, '-completed_at', 100),
        base44.entities.StudentProgress.filter({ student_id: user.id }),
        base44.entities.Question.list()
      ]);

      const qMap = new Map(allQuestions.map(q => [q.id, q]));

      // Subject-wise accuracy
      const subjectStats = {};
      const topicStats = {};

      for (const a of answers) {
        const q = qMap.get(a.question_id);
        if (!q) continue;
        if (!subjectStats[q.subject]) subjectStats[q.subject] = { total: 0, correct: 0 };
        subjectStats[q.subject].total++;
        if (a.is_correct) subjectStats[q.subject].correct++;

        if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0, subject: q.subject };
        topicStats[q.topic].total++;
        if (a.is_correct) topicStats[q.topic].correct++;
      }

      const subjectAccuracy = Object.entries(subjectStats).map(([subject, s]) => ({
        subject,
        total: s.total,
        correct: s.correct,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
      })).sort((a, b) => b.total - a.total);

      const topicAccuracy = Object.entries(topicStats).map(([topic, s]) => ({
        topic,
        subject: s.subject,
        total: s.total,
        correct: s.correct,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
      })).sort((a, b) => a.accuracy - b.accuracy);

      const masteredTopics = topicAccuracy.filter(t => t.accuracy >= 80 && t.total >= 3);
      const weakTopics = topicAccuracy.filter(t => t.accuracy < 50 && t.total >= 2);

      // Streak trend (last 30 days of attempts)
      const dailyAttempts = attempts
        .filter(a => a.day)
        .sort((a, b) => a.day.localeCompare(b.day))
        .slice(-30);

      const streakTrend = dailyAttempts.map(a => ({
        day: a.day,
        score: a.score,
        mode: a.mode
      }));

      const p = progress[0] || {};
      const totalAttempted = p.total_attempted || 0;
      const totalCorrect = p.total_correct || 0;
      const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      // Difficulty breakdown
      const difficultyStats = { Easy: { total: 0, correct: 0 }, Medium: { total: 0, correct: 0 }, Hard: { total: 0, correct: 0 } };
      for (const a of answers) {
        const q = qMap.get(a.question_id);
        if (!q || !difficultyStats[q.difficulty]) continue;
        difficultyStats[q.difficulty].total++;
        if (a.is_correct) difficultyStats[q.difficulty].correct++;
      }

      // Flashcard stats
      const fcSessions = await base44.entities.FlashcardSession.filter({ student_id: user.id }, '-date', 100);
      const fcTotalCardsKnown = fcSessions.reduce((sum, s) => sum + (s.cards_known || 0), 0);
      const fcTotalCardsLearning = fcSessions.reduce((sum, s) => sum + (s.cards_learning || 0), 0);
      const fcTotalCards = fcSessions.reduce((sum, s) => sum + (s.total_cards || 0), 0);
      const flashcardStats = {
        totalSessions: fcSessions.length,
        totalCardsKnown: fcTotalCardsKnown,
        totalCardsLearning: fcTotalCardsLearning,
        totalCards: fcTotalCards,
        masteryRate: fcTotalCards > 0 ? Math.round((fcTotalCardsKnown / fcTotalCards) * 100) : 0,
        recentSessions: fcSessions.slice(0, 10).map(s => ({
          topic: s.topic,
          subject: s.subject,
          cards_known: s.cards_known,
          cards_learning: s.cards_learning,
          total_cards: s.total_cards,
          xp_earned: s.xp_earned,
          date: s.date
        }))
      };

      return Response.json({
        subjectAccuracy,
        topicAccuracy,
        masteredTopics,
        weakTopics,
        streakTrend,
        difficultyStats: Object.entries(difficultyStats).map(([level, s]) => ({
          level, total: s.total, correct: s.correct,
          accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        })),
        overallAccuracy,
        totalAttempted,
        totalCorrect,
        totalWrong: p.total_wrong || 0,
        xp: p.xp || 0,
        stars: p.stars || 0,
        streak: p.streak || 0,
        flashcardStats
      });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}