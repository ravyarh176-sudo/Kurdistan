const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const SLUG_RE = /^[a-z0-9\-_]{1,64}$/;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server not configured: missing SUPABASE_URL / SUPABASE_SERVICE_KEY' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const slug = String(payload.slug || '').trim().toLowerCase();
  const targetUrl = String(payload.target_url || '').trim();

  if (!SLUG_RE.test(slug)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid slug' }) };
  }

  try {
    new URL(targetUrl);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid target_url' }) };
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify([{
      slug,
      target_url: targetUrl,
      updated_at: new Date().toISOString()
    }])
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { statusCode: 502, body: JSON.stringify({ error: 'Database error', details: text }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, slug })
  };
};
