import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const { question, history } = await req.json();
    if (typeof question !== 'string' || question.trim().length < 3 || question.length > 1000) return Response.json({ error: 'Enter a question between 3 and 1000 characters.' }, { status: 400 });

    // Fetch TopicNotes to use as context when topic matches
    const topicNotes = await base44.entities.TopicNote.list();
    const questionLower = question.toLowerCase();
    const relevantNotes = topicNotes.filter(note => {
      const topic = (note.topic || '').toLowerCase();
      const subject = (note.subject || '').toLowerCase();
      const notesText = (note.short_notes || '').toLowerCase();
      return questionLower.includes(topic) || questionLower.includes(subject) ||
             topic.split(' ').some(word => word.length > 3 && questionLower.includes(word));
    }).slice(0, 2);

    let contextPrompt = '';
    if (relevantNotes.length > 0) {
      contextPrompt = '\n\nRelevant study notes for context:\n' + relevantNotes.map(n =>
        `Topic: ${n.topic} (${n.subject})\n${(n.short_notes || '').slice(0, 500)}`
      ).join('\n\n');
    }

    // Build conversation history
    let historyPrompt = '';
    if (Array.isArray(history) && history.length > 0) {
      historyPrompt = '\n\nPrevious conversation:\n' + history.slice(-6).map(h =>
        `Student: ${h.question}\nTutor: ${h.answer}`
      ).join('\n') + '\n\n';
    }

    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: `You are StudyStreak's friendly college study tutor. Answer the student's question clearly in simple language, explain difficult ideas step by step, and give one concrete example. Respond in English when the student's question is in English. Respond in Hindi/Hinglish only when their question is in Hindi/Hinglish. Do not switch languages without a cue from the student. Stay on the study topic.${historyPrompt}${contextPrompt}\n\nStudent question: ${question.trim()}` });
    return Response.json({ answer: typeof answer === 'string' ? answer : JSON.stringify(answer) });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}