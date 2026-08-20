export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send(JSON.stringify({ ok: false, error: 'Method not allowed' }));
  }
  return res.status(200).send(JSON.stringify({ ok: true, service: 'serendib-trading', timestamp: new Date().toISOString() }));
}
