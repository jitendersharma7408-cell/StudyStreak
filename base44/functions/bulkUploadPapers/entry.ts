import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { listExistingKeys, importRecords } from '../../shared/bulkImport.ts';

const KEY_FIELDS = ['subject', 'university', 'semester', 'exam_type', 'year'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const papers_url = body?.papers_url;
    if (!papers_url || typeof papers_url !== 'string') {
      return Response.json({ error: 'papers_url is required' }, { status: 400 });
    }

    // 1) Fetch the JSON array
    const res = await fetch(papers_url);
    if (!res.ok) return Response.json({ error: `Failed to fetch papers: ${res.status}` }, { status: 502 });
    const papers = await res.json();
    if (!Array.isArray(papers)) return Response.json({ error: 'Fetched JSON is not an array' }, { status: 400 });

    // 2) Collect DISTINCT (subject, university) pairs from the file
    const pairs = new Map();
    for (const p of papers) {
      if (!p || !p.subject || !p.year || !p.exam_type || !p.paper_content) continue;
      const subject = String(p.subject).trim();
      const university = p.university ? String(p.university).trim() : '';
      const k = `${subject}||${university}`;
      if (!pairs.has(k)) pairs.set(k, { subject, university });
    }

    // 3) Build dedup set from records FILTERED to those subject+university pairs
    const entity = base44.asServiceRole.entities.QuestionPaper;
    const existing = new Set();
    for (const { subject, university } of pairs.values()) {
      const filter = university ? { subject, university } : { subject };
      const keys = await listExistingKeys(entity, KEY_FIELDS, filter);
      for (const k of keys) existing.add(k);
    }

    // Sequential writes: six attempts per record, with five seconds between failures.
    const result = await importRecords(entity, papers, existing, KEY_FIELDS, p => {
      if (!p || !p.subject || !p.year || !p.exam_type || !p.paper_content) {
        throw new Error('Paper is missing subject, year, exam_type, or paper_content.');
      }
      return {
        subject: String(p.subject),
        year: String(p.year),
        exam_type: String(p.exam_type),
        paper_content: String(p.paper_content),
        university: p.university ? String(p.university) : undefined,
        semester: p.semester ? String(p.semester) : undefined,
        duration: p.duration ? String(p.duration) : undefined,
        max_marks: typeof p.max_marks === 'number' ? p.max_marks : (p.max_marks ? Number(p.max_marks) : undefined),
        instructions: p.instructions ? String(p.instructions) : undefined,
      };
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}