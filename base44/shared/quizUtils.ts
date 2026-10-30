// Shared utilities for quiz-related backend functions

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function mapQuestion(q) {
  return { id: q.id, text: q.text, subject: q.subject, topic: q.topic, options: [q.option_a, q.option_b, q.option_c, q.option_d] };
}

// Compute recent accuracy per subject for adaptive difficulty
export function computeSubjectAccuracy(answers, qMap) {
  const stats = {};
  for (const a of answers) {
    const q = qMap.get(a.question_id);
    if (!q) continue;
    if (!stats[q.subject]) stats[q.subject] = { total: 0, correct: 0 };
    stats[q.subject].total++;
    if (a.is_correct) stats[q.subject].correct++;
  }
  const result = {};
  for (const [subject, s] of Object.entries(stats)) {
    result[subject] = s.total > 0 ? s.correct / s.total : null;
  }
  return result;
}

// Adaptive difficulty: pick questions based on recent accuracy
// accuracy > 0.85 → prefer Hard, accuracy < 0.50 → prefer Easy, else mixed
export function pickByDifficulty(allQuestions, subjectAccuracy, count) {
  const recent = Object.entries(subjectAccuracy)
    .filter(([, acc]) => acc !== null)
    .map(([subject, acc]) => ({ subject, acc }));

  const avgAccuracy = recent.length > 0
    ? recent.reduce((sum, r) => sum + r.acc, 0) / recent.length
    : 0.5;

  let preferredDifficulty;
  if (avgAccuracy > 0.85) preferredDifficulty = 'Hard';
  else if (avgAccuracy < 0.50) preferredDifficulty = 'Easy';
  else preferredDifficulty = 'Medium';

  // Group questions by difficulty
  const byDifficulty = { Easy: [], Medium: [], Hard: [] };
  for (const q of allQuestions) {
    if (byDifficulty[q.difficulty]) byDifficulty[q.difficulty].push(q);
  }

  // Start with preferred difficulty, then fill from others
  const order = [preferredDifficulty, 'Medium', 'Easy', 'Hard'].filter((v, i, arr) => arr.indexOf(v) === i);
  const pool = [];
  for (const diff of order) {
    pool.push(...shuffle(byDifficulty[diff] || []));
  }

  return pool.slice(0, count);
}