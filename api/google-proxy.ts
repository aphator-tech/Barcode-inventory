// api/google-proxy.ts
// This handles Vercel Serverless Function deployment proxying for Google APIs.
export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query?.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target url parameter' });
  }

  if (!targetUrl.startsWith('https://www.googleapis.com/')) {
    return res.status(403).json({ error: 'Forbidden target domain. Only googleapis.com requests are proxied.' });
  }

  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  try {
    const fetchOptions: any = {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const googleRes = await fetch(targetUrl, fetchOptions);
    res.status(googleRes.status);

    const contentType = googleRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await googleRes.json();
      res.json(data);
    } else {
      const text = await googleRes.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error('[Google Proxy API Error]:', err);
    res.status(500).json({ error: 'Google API proxy request failed', details: err.message });
  }
}
