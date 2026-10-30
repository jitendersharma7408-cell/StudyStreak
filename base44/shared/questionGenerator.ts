// Shared question generation logic for daily challenges and practice rounds.
// Generates MCQs from QuestionPaper records matching the student's course/stream/semester,
// avoiding previously seen questions (tracked per-user in UserSeenQuestions).

import { shuffle } from './quizUtils.ts';
import { isProfileComplete, getProfilePapers } from './profileSubjects.ts';
import { getSemesterSubjects } from './courseConfig.ts';

/**
 * Generates `count` MCQ questions from QuestionPaper records matching the
 * student's course, stream, and semester.  Avoids previously seen questions;
 * resets the seen list when the unseen pool is exhausted.
 *
 * Returns { needsProfile: true } if the student hasn't set course/stream/semester.
 * Returns { error: string } on failure.
 * Returns { questions: Question[] } on success (Question records with IDs).
 */
export async function generateChallengeQuestions(base44, user, count = 5) {
  // 1. Load course/stream/semester from StudentProgress
  const progress = (await base44.entities.StudentProgress.filter({ student_id: user.id }))[0];
  const course = progress?.course;
  const stream = progress?.stream;
  const semester = progress?.semester;

  // Course + semester always required; stream required only when the course has streams
  if (!isProfileComplete(course, stream, semester)) {
    return { needsProfile: true, error: 'Please set your course, stream, and semester in Profile before starting a challenge.' };
  }

  // 2-3. QuestionPapers for this semester, restricted to stream-relevant subjects
  const papers = await getProfilePapers(base44, course, stream, semester);
  const mappedSubjects = getSemesterSubjects(course, stream, semester);

  if (papers.length === 0 && !mappedSubjects) {
    return { error: 'No question papers found for your course, stream, and semester. Please try a different combination.' };
  }

  // 4. Get user's previously seen question texts
  const seenRecords = await base44.entities.UserSeenQuestions.filter({ student_id: user.id, course, stream, semester });
  const seenTexts = seenRecords.map(r => r.question_text);

  // 5. Pick random papers and combine their content
  const selectedPapers = shuffle(papers).slice(0, Math.min(3, papers.length));
  const paperContent = selectedPapers.length > 0
    ? selectedPapers.map(p => `[Subject: ${p.subject} — ${p.exam_type} ${p.year}]\n${p.paper_content}`).join('\n\n---\n\n')
    : `No paper available. Generate questions from the standard university syllabus of ONLY these subjects: ${mappedSubjects.join(', ')}. The "subject" field must be exactly one of these names.`;

  // 6. Build LLM prompt
  const seenList = seenTexts.length > 0
    ? `\n\nIMPORTANT: Do NOT repeat any of these previously asked questions (or trivial rephrasings of them):\n${seenTexts.map(t => `- ${t}`).join('\n')}`
    : '';

  const courseStreamLabel = stream ? `${course} — ${stream}` : course;

  const prompt = `You are an exam question generator for ${courseStreamLabel} students in ${semester}.

Based on the following university question paper content, generate exactly ${count} multiple-choice questions.

For each question, provide:
- "text": the question text
- "subject": the subject (use the subject from the paper)
- "topic": a short topic name (2-4 words)
- "option_a", "option_b", "option_c", "option_d": four distinct answer options
- "correct_answer": the letter (A, B, C, or D) of the correct option
- "explanation": a brief explanation of why the answer is correct (1-2 sentences)
- "difficulty": "Easy", "Medium", or "Hard"

Requirements:
- Each question must have exactly 4 options with exactly one correct answer.
- Questions should test understanding, not just memorization.
- Vary the difficulty across the ${count} questions.
- Make sure all options are plausible but only one is correct.
${seenList}

Question Paper Content:
${paperContent.slice(0, 8000)}`;

  // 7. Call LLM
  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              subject: { type: 'string' },
              topic: { type: 'string' },
              option_a: { type: 'string' },
              option_b: { type: 'string' },
              option_c: { type: 'string' },
              option_d: { type: 'string' },
              correct_answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
              explanation: { type: 'string' },
              difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] }
            },
            required: ['text', 'subject', 'topic', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'difficulty']
          }
        }
      },
      required: ['questions']
    }
  });

  let questions = response?.questions || [];

  if (questions.length < count) {
    return { error: 'Could not generate enough questions. Please try again.' };
  }

  // 8. Filter out questions that exactly match seen texts
  const newQuestions = questions.filter(q => !seenTexts.includes(q.text));

  // 9. If unseen pool exhausted, reset seen list and use generated questions
  if (newQuestions.length < count) {
    await base44.entities.UserSeenQuestions.deleteMany({ student_id: user.id, course, stream, semester });
    questions = questions.slice(0, count);
  } else {
    questions = newQuestions.slice(0, count);
  }

  // 10. Create Question records (so they have IDs for QuizAttempt)
  const created = await base44.entities.Question.bulkCreate(questions.map(q => ({
    text: q.text,
    subject: q.subject,
    topic: q.topic,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    active: true
  })));

  if (!created || created.length < count) {
    return { error: 'Failed to save generated questions.' };
  }

  // 11. Record seen question texts
  await base44.entities.UserSeenQuestions.bulkCreate(created.map(q => ({
    student_id: user.id,
    question_text: q.text,
    course,
    stream,
    semester,
    date: new Date().toISOString().slice(0, 10)
  })));

  return { questions: created };
}