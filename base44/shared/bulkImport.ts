export function recordKey(record, fields) {
  return fields.map(field => (record?.[field] ?? '').toString().trim()).join('|');
}

async function retry(operation, attempts, delayMs) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === attempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

export async function listExistingKeys(entity, fields, filter) {
  const existing = new Set();
  let cursor = null;
  do {
    const options = { limit: 500, sort: '-created_date', fields, cursor };
    const page = await retry(() => filter
      ? entity.filter(filter, options)
      : entity.list(options), 3, 500);
    if (!Array.isArray(page.items) || (page.has_more && !page.next_cursor)) {
      throw new Error('Incomplete existing-records listing; import stopped.');
    }
    for (const record of page.items) existing.add(recordKey(record, fields));
    cursor = page.next_cursor;
    if (!page.has_more) break;
  } while (cursor);
  return existing;
}

export async function importRecords(entity, records, existing, fields, prepare) {
  // Only keys confirmed by the listing count as duplicates, never failed writes.
  const pending = records.filter(record => !existing.has(recordKey(record, fields)));
  const fetched = records.length;
  const skipped = fetched - pending.length;
  let created = 0;
  for (const record of pending) {
    try {
      const payload = prepare(record);
      await retry(() => entity.create(payload), 6, 5000);
      created++;
    } catch (error) {
      // Includes the exhausted record and remaining unprocessed records for resuming.
      return { fetched, created, skipped, failed: pending.length - created, error: error.message || String(error) };
    }
  }
  return { fetched, created, skipped };
}