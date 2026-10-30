import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { mapQuestion } from '../../shared/quizUtils.ts';
import { generateChallengeQuestions } from '../../shared/questionGenerator.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const body = await req.json();
    const day = new Date().toISOString().slice(0, 10);

    // ── DAILY: get ──────────────────────────────────────────────
    if (body.action === 'get') {
      const todayAttempts = await base44.entities.QuizAttempt.filter({ student_id: user.id, day, mode: 'daily' });

      // Already completed today?
      const completed = todayAttempts.filter(a => a.status !== 'in_progress');
      if (completed.length > 0) {
        return Response.json({ day, completed: true, questions: [] });
      }

      // Resume in-progress attempt?
      const inProgress = todayAttempts.filter(a => a.status === 'in_progress');
      if (inProgress.length > 0) {
        const attempt = inProgress[0];
        const questionIds = JSON.parse(attempt.question_ids || '[]');
        const savedAnswers = JSON.parse(attempt.answers || '{}');
        const questions = [];
        for (const id of questionIds) {
          const q = await base44.entities.Question.get(id);
          if (q) questions.push(mapQuestion(q));
        }
        return Response.json({ day, completed: false, in_progress: true, attempt_id: attempt.id, questions, savedAnswers });
      }

      // Start new attempt — generate questions from QuestionPapers
      const generated = await generateChallengeQuestions(base44, user, 5);
      if (generated.needsProfile) return Response.json({ needsProfile: true, error: generated.error }, { status: 400 });
      if (generated.error) return Response.json({ error: generated.error }, { status: 503 });

      const chosen = generated.questions;
      const previous = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
      const name = previous?.name || user.full_name || user.email.split('@')[0];
      const attempt = await base44.entities.QuizAttempt.create({
        student_id: user.id,
        student_name: name,
        day,
        mode: 'daily',
        status: 'in_progress',
        score: 0, wrong: 0, previous_stars: 0, star_change: 0, updated_stars: 0, xp_earned: 0,
        question_ids: JSON.stringify(chosen.map(q => q.id)),
        answers: '{}'
      });
      return Response.json({ day, completed: false, in_progress: true, attempt_id: attempt.id, questions: chosen.map(mapQuestion), savedAnswers: {} });
    }

    // ── DAILY: save_answers (for resume) ────────────────────────
    if (body.action === 'save_answers') {
      const { attempt_id, answers } = body;
      if (!attempt_id || !answers) return Response.json({ error: 'Missing attempt_id or answers.' }, { status: 400 });
      const attempt = await base44.entities.QuizAttempt.get(attempt_id);
      if (!attempt || attempt.student_id !== user.id) return Response.json({ error: 'Invalid attempt.' }, { status: 403 });
      if (attempt.status === 'completed') return Response.json({ error: 'This attempt is already completed.' }, { status: 409 });
      await base44.entities.QuizAttempt.update(attempt_id, { answers: JSON.stringify(answers) });
      return Response.json({ saved: true });
    }

    // ── DAILY: submit ───────────────────────────────────────────
    if (body.action === 'submit') {
      const todayAttempts = await base44.entities.QuizAttempt.filter({ student_id: user.id, day, mode: 'daily' });
      const inProgress = todayAttempts.filter(a => a.status === 'in_progress');
      if (inProgress.length === 0) return Response.json({ error: 'No in-progress challenge found. Start a new one.' }, { status: 404 });
      const attempt = inProgress[0];

      const answers = body.answers;
      if (!Array.isArray(answers) || answers.length !== 5 || !answers.every(a => a?.question_id && ['A','B','C','D'].includes(a?.selected_answer))) {
        return Response.json({ error: 'Answer all five questions before submitting.' }, { status: 400 });
      }

      // Load questions by ID (they were created during generation)
      const questionIds = JSON.parse(attempt.question_ids || '[]');
      const qMap = new Map();
      for (const id of questionIds) {
        const q = await base44.entities.Question.get(id);
        if (q) qMap.set(q.id, q);
      }
      const scored = answers.map(a => ({ q: qMap.get(a.question_id), a }));
      if (scored.some(s => !s.q)) return Response.json({ error: 'Invalid question set.' }, { status: 400 });

      const score = scored.filter(s => s.a.selected_answer === s.q.correct_answer).length;
      const previous = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
      const before = previous?.stars || 0;
      const change = score >= 3 ? 1 : -1;
      const stars = Math.max(0, before + change);
      const yesterday = new Date(Date.parse(day + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10);
      const streak = previous?.last_completed_day === yesterday ? (previous.streak || 0) + 1 : 1;
      const xpEarned = 10 + score * 20;
      const name = previous?.name || user.full_name || user.email.split('@')[0];

      await base44.entities.QuizAttempt.update(attempt.id, {
        score, wrong: 5 - score, previous_stars: before, star_change: change,
        updated_stars: stars, xp_earned: xpEarned, status: 'completed',
        completed_at: new Date().toISOString()
      });

      await base44.entities.QuizAnswer.bulkCreate(scored.map(s => ({
        attempt_id: attempt.id, student_id: user.id, question_id: s.q.id,
        selected_answer: s.a.selected_answer, correct_answer: s.q.correct_answer,
        is_correct: s.a.selected_answer === s.q.correct_answer
      })));

      const progress = { student_id: user.id, name, stars, xp: (previous?.xp || 0) + xpEarned, streak, last_completed_day: day, total_attempted: (previous?.total_attempted || 0) + 5, total_correct: (previous?.total_correct || 0) + score, total_wrong: (previous?.total_wrong || 0) + 5 - score };
      if (previous) await base44.entities.StudentProgress.update(previous.id, progress);
      else await base44.entities.StudentProgress.create(progress);

      return Response.json({ attempt: { ...attempt, score, wrong: 5 - score, previous_stars: before, star_change: change, updated_stars: stars, xp_earned: xpEarned, status: 'completed', completed_at: new Date().toISOString() }, progress, review: scored.map(s => ({ text: s.q.text, selected: s.a.selected_answer, correct: s.q.correct_answer, explanation: s.q.explanation, is_correct: s.a.selected_answer === s.q.correct_answer })) });
    }

    // ── PRACTICE ───────────────────────────────────────────────
    if (body.action === 'practice') {
      if (body.step === 'get') {
        const generated = await generateChallengeQuestions(base44, user, 5);
        if (generated.needsProfile) return Response.json({ needsProfile: true, error: generated.error }, { status: 400 });
        if (generated.error) return Response.json({ error: generated.error }, { status: 503 });

        const chosen = generated.questions;
        return Response.json({ day: '', completed: false, mode: 'practice', questions: chosen.map(mapQuestion) });
      }
      if (body.step === 'submit') {
        const answers = body.answers;
        if (!Array.isArray(answers) || answers.length !== 5 || !answers.every(a => a?.question_id && ['A','B','C','D'].includes(a?.selected_answer))) {
          return Response.json({ error: 'Answer all five questions before submitting.' }, { status: 400 });
        }
        // Load questions by ID
        const qMap = new Map();
        for (const a of answers) {
          if (!qMap.has(a.question_id)) {
            const q = await base44.entities.Question.get(a.question_id);
            if (q) qMap.set(q.id, q);
          }
        }
        const scored = answers.map(a => ({ q: qMap.get(a.question_id), a }));
        if (scored.some(s => !s.q)) return Response.json({ error: 'Invalid question set.' }, { status: 400 });
        const correctCount = scored.filter(s => s.a.selected_answer === s.q.correct_answer).length;
        const previous = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
        const before = previous?.stars || 0;
        const change = correctCount >= 3 ? 1 : -1;
        const stars = Math.max(0, before + change);
        const xpEarned = 5 + correctCount * 10;
        const name = previous?.name || user.full_name || user.email.split('@')[0];
        const attempt = await base44.entities.QuizAttempt.create({ student_id: user.id, student_name: name, day: '', mode: 'practice', status: 'completed', score: correctCount, wrong: 5 - correctCount, previous_stars: before, star_change: change, updated_stars: stars, xp_earned: xpEarned, question_ids: JSON.stringify(scored.map(s => s.q.id)), answers: '{}', completed_at: new Date().toISOString() });
        await base44.entities.QuizAnswer.bulkCreate(scored.map(s => ({ attempt_id: attempt.id, student_id: user.id, question_id: s.q.id, selected_answer: s.a.selected_answer, correct_answer: s.q.correct_answer, is_correct: s.a.selected_answer === s.q.correct_answer })));
        const progress = { student_id: user.id, name, stars, xp: (previous?.xp || 0) + xpEarned, streak: previous?.streak || 0, last_completed_day: previous?.last_completed_day || '', total_attempted: (previous?.total_attempted || 0) + 5, total_correct: (previous?.total_correct || 0) + correctCount, total_wrong: (previous?.total_wrong || 0) + 5 - correctCount };
        if (previous) await base44.entities.StudentProgress.update(previous.id, progress);
        else await base44.entities.StudentProgress.create(progress);
        return Response.json({ attempt, progress, review: scored.map(s => ({ text: s.q.text, selected: s.a.selected_answer, correct: s.q.correct_answer, explanation: s.q.explanation, is_correct: s.a.selected_answer === s.q.correct_answer })) });
      }
      return Response.json({ error: 'Invalid practice step.' }, { status: 400 });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}