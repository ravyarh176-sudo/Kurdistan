const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  const slug = String(event.path || '')
    .replace(/^\/\.netlify\/functions\/go\/?/, '')
    .replace(/^\//, '')
    .trim()
    .toLowerCase();

  if (!slug) {
    return { statusCode: 404, body: notFoundPage('') };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: 'Server not configured.' };
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/links?slug=eq.${encodeURIComponent(slug)}&select=target_url`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (!res.ok) {
    return { statusCode: 502, body: 'Database error.' };
  }

  const rows = await res.json();

  if (!rows || rows.length === 0) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: notFoundPage(slug)
    };
  }

  return {
    statusCode: 302,
    headers: { Location: rows[0].target_url }
  };
};

function notFoundPage(slug) {
  return `<!DOCTYPE html>
<html lang="ckb" dir="rtl"><head><meta charset="utf-8">
<title>لینک نەدۆزرایەوە</title></head>
<body style="font-family:sans-serif;background:#0F1520;color:#F2EFE9;
display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
<div style="text-align:center;">
<h2>ئەم لینکە بوونی نییە</h2>
<p style="color:#8B95A5;">"${slug}" هیچ شوێنێکی مەبەستی نییە.</p>
</div></body></html>`;
}
