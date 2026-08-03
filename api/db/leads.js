import { query } from '../_db.js';
import { getSessionFromRequest } from '../auth/_session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Admin authentication required
  const session = await getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized admin request' });
  }

  if (req.method === 'GET') {
    try {
      const rows = await query('SELECT * FROM leads ORDER BY created_at DESC');
      return res.status(200).json(Array.isArray(rows) ? rows : []);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to fetch leads' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      body = body || {};

      const { id, status } = body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Lead ID and status are required' });
      }

      const rows = await query('UPDATE leads SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      return res.status(200).json(rows[0] || { id, status });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to update lead status' });
    }
  }

  res.setHeader('Allow', 'GET, PATCH');
  return res.status(405).json({ error: 'Method not allowed' });
}
