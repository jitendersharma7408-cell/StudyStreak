import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { listExistingKeys, importRecords } from '../../shared/bulkImport.ts';

const ENTITY_FIELDS = {
  StudyMaterial: {
    required: ['subject', 'title', 'summary', 'content', 'practice_question'],
    keyFields: ['subject', 'title'],
  },
  TopicNote: {
    required: ['subject', 'topic', 'short_notes', 'detailed_notes', 'exam_notes', 'important_questions'],
    keyFields: ['subject', 'topic'],
  },
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { records_url, entity_name } = body || {};
    if (!records_url || typeof records_url !== 'string') {
      return Response.json({ error: 'records_url is required' }, { status: 400 });
    }
    const config = ENTITY_FIELDS[entity_name];
    if (!config) {
      return Response.json({ error: 'entity_name must be "StudyMaterial" or "TopicNote"' }, { status: 400 });
    }
    const entity = base44.asServiceRole.entities[entity_name];

    // 1) Fetch the JSON array
    const res = await fetch(records_url);
    if (!res.ok) return Response.json({ error: `Failed to fetch records: ${res.status}` }, { status: 502 });
    const records = await res.json();
    if (!Array.isArray(records)) return Response.json({ error: 'Fetched JSON is not an array' }, { status: 400 });

    const existing = await listExistingKeys(entity, config.keyFields);
    const result = await importRecords(entity, records, existing, config.keyFields, record => {
      if (!record || !config.required.every(field => record[field])) {
        throw new Error(`Record is missing required ${entity_name} fields: ${config.required.join(', ')}.`);
      }
      const payload = {};
      for (const field of config.required) payload[field] = String(record[field]);
      return payload;
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}