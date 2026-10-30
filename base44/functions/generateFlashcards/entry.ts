import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const body = await req.json();

    if (body.action === 'generate') {
      const { noteId } = body;
      if (!noteId) return Response.json({ error: 'Missing noteId.' }, { status: 400 });

      const note = await base44.entities.TopicNote.get(noteId);
      if (!note) return Response.json({ error: 'Topic note not found.' }, { status: 404 });

      const content = `${note.short_notes || ''}\n\n${note.detailed_notes || ''}\n\n${note.exam_notes || ''}`;
      if (!content.trim()) return Response.json({ error: 'No content available for flashcards.' }, { status: 400 });

      const prompt = `You are a study flashcard generator. Create 8-12 flashcards from the following study notes about "${note.topic}" (${note.subject}).
Each flashcard has a "term" (the concept/word) and a "definition" (a clear, concise explanation in 1-2 sentences).
Focus on key terms, definitions, formulas, and important concepts.
Return ONLY a JSON array of objects with "term" and "definition" fields. No markdown, no explanation.

Study notes:
${content.slice(0, 4000)}`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  definition: { type: "string" }
                },
                required: ["term", "definition"]
              }
            }
          },
          required: ["flashcards"]
        }
      });

      const flashcards = result?.flashcards || result || [];
      return Response.json({ flashcards, topic: note.topic, subject: note.subject });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}