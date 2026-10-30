import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { shuffle, mapQuestion } from '../../shared/quizUtils.ts';

// Spaced repetition intervals in days
const INTERVALS = [3, 7, 15];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const body = await req.json();

    // ── GET DUE REVISION QUESTIONS ─────────────────────────────
    if (body.action === 'getDue') {
      const allAnswers = await base44.entities.QuizAnswer.filter({ student_id: user.id, is_correct: false });
      const allQuestions = await base44.entities.Question.filter({ active: true });
      const qMap = new Map(allQuestions.map(q => [q.id, q]));

      const now = new Date();
      const due = [];
      const seenIds = new Set();

      for (const a of allAnswers) {
        if (seenIds.has(a.question_id)) continue;
        const created = new Date(a.created_date);
        const daysSince = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        // Due if any interval has passed
        const isDue = INTERVALS.some(interval => {
          const dueDate = new Date(created.getTime() + interval * 86400000);
          return daysSince >= interval && now >= dueDate;
        });
        if (isDue && qMap.has(a.question_id)) {
          seenIds.add(a.question_id);
          due.push({ ...mapQuestion(qMap.get(a.question_id)), daysSince, createdDate: a.created_date });
        }
      }

      // If no due questions, pick from recent wrong answers as fallback
      let questions = due;
      if (questions.length < 5) {
        const recentWrong = allAnswers
          .filter(a => qMap.has(a.question_id))
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 10);
        const recentIds = new Set(questions.map(q => q.id));
        for (const a of recentWrong) {
          if (!recentIds.has(a.question_id) && questions.length < 5) {
            recentIds.add(a.question_id);
            questions.push({ ...mapQuestion(qMap.get(a.question_id)), daysSince: 0, createdDate: a.created_date });
          }
        }
      }

      const chosen = shuffle(questions).slice(0, 5);
      return Response.json({ questions: chosen, dueCount: due.length });
    }

    // ── SUBMIT REVISION ANSWERS ────────────────────────────────
    if (body.action === 'submit') {
      const answers = body.answers;
      if (!Array.isArray(answers) || answers.length === 0) {
        return Response.json({ error: 'No answers provided.' }, { status: 400 });
      }
      const allQuestions = await base44.entities.Question.filter({ active: true });
      const qMap = new Map(allQuestions.map(q => [q.id, q]));
      const scored = answers.map(a => ({ q: qMap.get(a.question_id), a }));
      if (scored.some(s => !s.q)) return Response.json({ error: 'Invalid question set.' }, { status: 400 });

      const correctCount = scored.filter(s => s.a.selected_answer === s.q.correct_answer).length;
      const previous = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
      const name = previous?.name || user.full_name || user.email.split('@')[0];

      // Record revision attempt
      const attempt = await base44.entities.QuizAttempt.create({
        student_id: user.id,
        student_name: name,
        day: '',
        mode: 'practice',
        status: 'completed',
        score: correctCount,
        wrong: scored.length - correctCount,
        previous_stars: previous?.stars || 0,
        star_change: 0,
        updated_stars: previous?.stars || 0,
        xp_earned: correctCount * 5,
        question_ids: JSON.stringify(scored.map(s => s.q.id)),
        answers: '{}',
        completed_at: new Date().toISOString()
      });

      // Record answers (updates is_correct for previously wrong answers)
      await base44.entities.QuizAnswer.bulkCreate(scored.map(s => ({
        attempt_id: attempt.id,
        student_id: user.id,
        question_id: s.q.id,
        selected_answer: s.a.selected_answer,
        correct_answer: s.q.correct_answer,
        is_correct: s.a.selected_answer === s.q.correct_answer
      })));

      // Update progress
      const xpEarned = correctCount * 5;
      const progress = {
        student_id: user.id,
        name,
        stars: previous?.stars || 0,
        xp: (previous?.xp || 0) + xpEarned,
        streak: previous?.streak || 0,
        last_completed_day: previous?.last_completed_day || '',
        total_attempted: (previous?.total_attempted || 0) + scored.length,
        total_correct: (previous?.total_correct || 0) + correctCount,
        total_wrong: (previous?.total_wrong || 0) + (scored.length - correctCount)
      };
      if (previous) await base44.entities.StudentProgress.update(previous.id, progress);
      else await base44.entities.StudentProgress.create(progress);

      return Response.json({
        attempt,
        progress,
        review: scored.map(s => ({
          text: s.q.text,
          selected: s.a.selected_answer,
          correct: s.q.correct_answer,
          explanation: s.q.explanation,
          is_correct: s.a.selected_answer === s.q.correct_answer
        }))
      });
    }

    // ── GET DUE COUNT (for dashboard badge) ────────────────────
    if (body.action === 'getDueCount') {
      const allAnswers = await base44.entities.QuizAnswer.filter({ student_id: user.id, is_correct: false });
      const now = new Date();
      let count = 0;
      const seen = new Set();
      for (const a of allAnswers) {
        if (seen.has(a.question_id)) continue;
        const created = new Date(a.created_date);
        const daysSince = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        if (INTERVALS.some(interval => daysSince >= interval)) {
          seen.add(a.question_id);
          count++;
        }
      }
      return Response.json({ dueCount: count });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}