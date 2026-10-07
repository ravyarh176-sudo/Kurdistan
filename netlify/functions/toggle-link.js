const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const slug = String(payload.slug || '').trim().toLowerCase();
  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug' }) };
  }
  if (typeof payload.paused !== 'boolean') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing paused' }) };
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/links?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ paused: payload.paused })
    }
  );

  if (!res.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Database error' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, paused: payload.paused })
  };
};
