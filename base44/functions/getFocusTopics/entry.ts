import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isProfileComplete, getProfileSubjects } from '../../shared/profileSubjects.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });

    // ── GET FOCUS TOPICS ───────────────────────────────────────
    // Combines quiz wrong answers + flashcard "still learning" cards
    // Returns top 3-5 weakest topics with accuracy %
    // Filtered by the user's course/stream/semester profile.
    // If the student has no attempts on profile subjects yet,
    // returns the profile's subjects as suggested focus topics.
    if (true) {
      // 1. Profile: explicit params override the saved StudentProgress profile
      const body = await req.json().catch(() => ({}));
      const progress = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
      const course = body.course || progress?.course;
      const stream = body.stream || progress?.stream;
      const semester = body.semester || progress?.semester;

      // 2. Subject set — exactly what the daily challenge uses
      let allowedSubjects = null;
      let profileSubjects = null;
      if (isProfileComplete(course, stream, semester)) {
        profileSubjects = await getProfileSubjects(base44, course, stream, semester);
        allowedSubjects = new Set(profileSubjects.map(s => s.toLowerCase()));
      }

      const [answers, flashcardSessions, allQuestions] = await Promise.all([
        base44.entities.QuizAnswer.filter({ student_id: user.id }),
        base44.entities.FlashcardSession.filter({ student_id: user.id }, '-date', 50),
        base44.entities.Question.list()
      ]);

      const qMap = new Map(allQuestions.map(q => [q.id, q]));

      // 3. Build topic stats from quiz answers (filtered by profile subjects)
      const topicMap = {};

      for (const a of answers) {
        const q = qMap.get(a.question_id);
        if (!q) continue;
        if (allowedSubjects && !allowedSubjects.has((q.subject || '').toLowerCase())) continue;
        const key = q.topic;
        if (!topicMap[key]) topicMap[key] = { subject: q.subject, quizTotal: 0, quizCorrect: 0, fcTotal: 0, fcLearning: 0, noteId: '' };
        topicMap[key].quizTotal++;
        if (a.is_correct) topicMap[key].quizCorrect++;
      }

      // 4. Merge flashcard session data (filtered by profile subjects)
      for (const s of flashcardSessions) {
        if (allowedSubjects && !allowedSubjects.has((s.subject || '').toLowerCase())) continue;
        const key = s.topic;
        if (!topicMap[key]) topicMap[key] = { subject: s.subject || '', quizTotal: 0, quizCorrect: 0, fcTotal: 0, fcLearning: 0, noteId: s.note_id || '' };
        topicMap[key].fcTotal += (s.total_cards || 0);
        topicMap[key].fcLearning += (s.cards_learning || 0);
        if (s.note_id) topicMap[key].noteId = s.note_id;
      }

      // 5. Compute combined accuracy per topic
      const focusTopics = Object.entries(topicMap)
        .map(([topic, s]) => {
          let accuracy = null;
          let weight = 0;

          if (s.quizTotal > 0) {
            const quizAcc = s.quizCorrect / s.quizTotal;
            accuracy = accuracy === null ? quizAcc : (accuracy + quizAcc) / 2;
            weight++;
          }
          if (s.fcTotal > 0) {
            const fcAcc = (s.fcTotal - s.fcLearning) / s.fcTotal;
            accuracy = accuracy === null ? fcAcc : (accuracy + fcAcc) / 2;
            weight++;
          }

          if (weight === 0) return null;

          const totalAttempts = s.quizTotal + s.fcTotal;
          return {
            topic,
            subject: s.subject,
            accuracy: Math.round(accuracy * 100),
            quizTotal: s.quizTotal,
            fcTotal: s.fcTotal,
            totalAttempts,
            noteId: s.noteId || ''
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.accuracy - b.accuracy || b.totalAttempts - a.totalAttempts)
        .slice(0, 5);

      // 6. If profile is set but no attempts on those subjects yet,
      //    return the profile's subjects as suggested focus topics
      if (focusTopics.length === 0 && profileSubjects && profileSubjects.length > 0) {
        const suggested = profileSubjects.slice(0, 5).map(subject => ({
          topic: subject,
          subject,
          accuracy: 0,
          quizTotal: 0,
          fcTotal: 0,
          totalAttempts: 0,
          noteId: '',
          suggested: true
        }));
        return Response.json({ focusTopics: suggested });
      }

      return Response.json({ focusTopics });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}