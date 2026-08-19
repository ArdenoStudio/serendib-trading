import { query } from '../_db.js';
import { getSessionFromRequest } from '../auth/_session.js';

/**
 * Public list cards never need gallery JSONB or long descriptions.
 * Selecting only these columns (and CDN-caching the response) is what
 * keeps Neon egress bounded — photos themselves live in Supabase Storage.
 */
const PUBLIC_LIST_COLUMNS = `
  id, make, model, year, price, mileage, fuel, transmission,
  "bodyType", color, image, condition, key_features, is_sold, sold_at, created_at
`;

const sendJson = (res, status, data, cacheControl = 'no-store') => {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(data);
};

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
    return res.status(204).end();
  }

  // Handle GET (Public access)
  if (method === 'GET') {
    try {
      const id = req.query && req.query.id;
      if (id) {
        const rows = await query('SELECT * FROM cars WHERE id = $1 LIMIT 1', [id]);
        if (!Array.isArray(rows) || rows.length === 0) {
          return sendJson(res, 404, { error: 'Vehicle not found' });
        }
        return sendJson(res, 200, rows[0], 'public, s-maxage=30, stale-while-revalidate=120');
      }

      // Admin dashboard needs gallery/description/views. Keep that on a
      // distinct URL so the public list can be CDN-cached without mixing
      // authenticated payloads into the same cache key.
      const view = req.query && req.query.view;
      if (view === 'full') {
        const session = await getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Unauthorized admin request' });
        }
        const rows = await query('SELECT * FROM cars ORDER BY created_at DESC');
        return sendJson(res, 200, Array.isArray(rows) ? rows : []);
      }

      const rows = await query(
        `SELECT ${PUBLIC_LIST_COLUMNS} FROM cars ORDER BY created_at DESC`
      );
      return sendJson(
        res,
        200,
        Array.isArray(rows) ? rows : [],
        'public, s-maxage=60, stale-while-revalidate=300'
      );
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Failed to fetch vehicles' });
    }
  }

  // Admin authentication required for write operations
  const session = await getSessionFromRequest(req);
  if (!session) {
    return sendJson(res, 401, { error: 'Unauthorized admin request' });
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

    if (method === 'POST') {
      // Create new car
      const {
        make,
        model,
        year,
        price,
        mileage,
        fuel,
        transmission,
        bodyType,
        color,
        image,
        gallery,
        condition,
        description,
        key_features,
        is_sold,
        sold_at,
      } = body;

      if (!make || !model || !year) {
        return sendJson(res, 400, { error: 'Make, model, and year are required' });
      }

      const id = body.id || `car_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const galleryArr = Array.isArray(gallery) ? gallery : [];
      const keyFeaturesArr = Array.isArray(key_features) ? key_features : [];

      const insertSql = `
        INSERT INTO cars (
          id, make, model, year, price, mileage, fuel, transmission,
          "bodyType", color, image, gallery, condition, description,
          key_features, is_sold, sold_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, NOW()
        ) RETURNING *
      `;

      const rows = await query(insertSql, [
        id,
        make,
        model,
        Number(year),
        price !== undefined ? Number(price) : null,
        mileage !== undefined ? Number(mileage) : null,
        fuel || 'Petrol',
        transmission || 'Automatic',
        bodyType || 'Sedan',
        color || '',
        image || '',
        JSON.stringify(galleryArr),
        condition || 'Used',
        description || '',
        JSON.stringify(keyFeaturesArr),
        Boolean(is_sold),
        sold_at || null,
      ]);

      return sendJson(res, 201, rows[0]);
    }

    if (method === 'PATCH') {
      const id = body.id || (req.query && req.query.id);
      if (!id) {
        return sendJson(res, 400, { error: 'Vehicle ID is required' });
      }

      // Check if partial update or mark as sold
      if (body.action === 'mark_sold' || body.is_sold !== undefined) {
        const isSold = body.is_sold !== undefined ? Boolean(body.is_sold) : true;
        const soldAt = isSold ? (body.sold_at || new Date().toISOString()) : null;

        const rows = await query(
          'UPDATE cars SET is_sold = $1, sold_at = $2 WHERE id = $3 RETURNING *',
          [isSold, soldAt, id]
        );
        return sendJson(res, 200, rows[0] || { id, is_sold: isSold, sold_at: soldAt });
      }

      // Full/Partial update fields
      const fields = [];
      const values = [];
      let idx = 1;

      const filterableKeys = [
        'make', 'model', 'year', 'price', 'mileage', 'fuel',
        'transmission', 'bodyType', 'color', 'image', 'condition', 'description'
      ];

      for (const key of filterableKeys) {
        if (body[key] !== undefined) {
          fields.push(`"${key}" = $${idx++}`);
          values.push(key === 'year' || key === 'price' || key === 'mileage' ? Number(body[key]) : body[key]);
        }
      }

      if (body.gallery !== undefined) {
        fields.push(`gallery = $${idx++}`);
        values.push(JSON.stringify(Array.isArray(body.gallery) ? body.gallery : []));
      }

      if (body.key_features !== undefined) {
        fields.push(`key_features = $${idx++}`);
        values.push(JSON.stringify(Array.isArray(body.key_features) ? body.key_features : []));
      }

      if (fields.length === 0) {
        return sendJson(res, 400, { error: 'No fields provided to update' });
      }

      values.push(id);
      const updateSql = `UPDATE cars SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const rows = await query(updateSql, values);
      return sendJson(res, 200, rows[0]);
    }

    if (method === 'DELETE') {
      const id = (req.query && req.query.id) || body.id;
      if (!id) {
        return sendJson(res, 400, { error: 'Vehicle ID is required' });
      }

      await query('DELETE FROM cars WHERE id = $1', [id]);
      return sendJson(res, 200, { ok: true, id });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Database error' });
  }
}
