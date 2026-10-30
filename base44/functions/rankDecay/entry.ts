import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    const all = await base44.asServiceRole.entities.StudentProgress.filter({});
    let updated = 0;
    for (const p of all) {
      const current = p.stars || 0;
      if (current > 0) {
        await base44.asServiceRole.entities.StudentProgress.update(p.id, { stars: Math.max(0, current - 1) });
        updated++;
      }
    }
    return Response.json({ decayed: updated, total: all.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}