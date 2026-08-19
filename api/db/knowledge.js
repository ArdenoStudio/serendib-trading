import { query } from '../_db.js';
import { getSessionFromRequest } from '../auth/_session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET') {
    try {
      const rows = await query('SELECT * FROM vehicle_knowledge');
      return res.status(200).json(Array.isArray(rows) ? rows : []);
    } catch {
      // Optional parser aid — never fail the admin UI over a missing column.
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized admin request' });
    }

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

      const { category, topic, content } = body;
      if (!topic || !content) {
        return res.status(400).json({ error: 'Topic and content are required' });
      }

      const rows = await query(
        'INSERT INTO vehicle_knowledge (category, topic, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [category || 'General', topic, content]
      );
      return res.status(201).json(rows[0]);
    } catch {
      return res.status(500).json({ error: 'Failed to insert knowledge' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
