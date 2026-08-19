import {
  query,
  sanitizeText,
  sanitizeFuel,
  sanitizeTransmission,
  sanitizeCondition,
  sanitizeYear,
  sanitizePrice,
  sanitizeMileage,
  sanitizeHttpsUrl,
  sanitizeHttpsUrlList,
  sanitizeFeatureList,
} from '../_db.js';
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

const sanitizeVehicleId = (value) => sanitizeText(value, 80);

const sanitizeVehicleWrite = (body) => ({
  make: sanitizeText(body.make, 80),
  model: sanitizeText(body.model, 80),
  year: sanitizeYear(body.year),
  price: sanitizePrice(body.price),
  mileage: sanitizeMileage(body.mileage),
  fuel: sanitizeFuel(body.fuel),
  transmission: sanitizeTransmission(body.transmission),
  bodyType: sanitizeText(body.bodyType, 40) || 'Sedan',
  color: sanitizeText(body.color, 40),
  image: sanitizeHttpsUrl(body.image),
  gallery: sanitizeHttpsUrlList(body.gallery),
  condition: sanitizeCondition(body.condition),
  description: sanitizeText(body.description, 4000),
  key_features: sanitizeFeatureList(body.key_features),
  is_sold: Boolean(body.is_sold),
  sold_at: body.is_sold ? (typeof body.sold_at === 'string' ? body.sold_at.slice(0, 40) : null) : null,
});

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
        const vehicleId = sanitizeVehicleId(id);
        if (!vehicleId) {
          return sendJson(res, 400, { error: 'Vehicle ID is required' });
        }
        const rows = await query('SELECT * FROM cars WHERE id = $1 LIMIT 1', [vehicleId]);
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
    } catch {
      return sendJson(res, 500, { error: 'Failed to fetch vehicles' });
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
      const vehicle = sanitizeVehicleWrite(body);

      if (!vehicle.make || !vehicle.model) {
        return sendJson(res, 400, { error: 'Make, model, and year are required' });
      }

      const id = sanitizeVehicleId(body.id) || `car_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.price,
        vehicle.mileage,
        vehicle.fuel,
        vehicle.transmission,
        vehicle.bodyType,
        vehicle.color,
        vehicle.image,
        JSON.stringify(vehicle.gallery),
        vehicle.condition,
        vehicle.description,
        JSON.stringify(vehicle.key_features),
        vehicle.is_sold,
        vehicle.sold_at,
      ]);

      return sendJson(res, 201, rows[0]);
    }

    if (method === 'PATCH') {
      const id = sanitizeVehicleId(body.id || (req.query && req.query.id));
      if (!id) {
        return sendJson(res, 400, { error: 'Vehicle ID is required' });
      }

      const soldOnlyKeys = new Set(['id', 'is_sold', 'sold_at', 'action']);
      const hasOtherFields = Object.keys(body).some(
        (key) => !soldOnlyKeys.has(key) && body[key] !== undefined
      );

      if (!hasOtherFields && (body.action === 'mark_sold' || body.is_sold !== undefined)) {
        const isSold = body.is_sold !== undefined ? Boolean(body.is_sold) : true;
        const soldAt = isSold
          ? (typeof body.sold_at === 'string' ? body.sold_at.slice(0, 40) : new Date().toISOString())
          : null;

        const rows = await query(
          'UPDATE cars SET is_sold = $1, sold_at = $2 WHERE id = $3 RETURNING *',
          [isSold, soldAt, id]
        );
        return sendJson(res, 200, rows[0] || { id, is_sold: isSold, sold_at: soldAt });
      }

      const sanitizers = {
        make: (value) => sanitizeText(value, 80),
        model: (value) => sanitizeText(value, 80),
        year: sanitizeYear,
        price: sanitizePrice,
        mileage: sanitizeMileage,
        fuel: sanitizeFuel,
        transmission: sanitizeTransmission,
        bodyType: (value) => sanitizeText(value, 40) || 'Sedan',
        color: (value) => sanitizeText(value, 40),
        image: sanitizeHttpsUrl,
        condition: sanitizeCondition,
        description: (value) => sanitizeText(value, 4000),
        is_sold: (value) => Boolean(value),
        sold_at: (value) => (typeof value === 'string' ? value.slice(0, 40) : null),
      };

      const fields = [];
      const values = [];
      let idx = 1;

      for (const [key, sanitize] of Object.entries(sanitizers)) {
        if (body[key] !== undefined) {
          fields.push(`"${key}" = $${idx++}`);
          values.push(sanitize(body[key]));
        }
      }

      if (body.gallery !== undefined) {
        fields.push(`gallery = $${idx++}`);
        values.push(JSON.stringify(sanitizeHttpsUrlList(body.gallery)));
      }

      if (body.key_features !== undefined) {
        fields.push(`key_features = $${idx++}`);
        values.push(JSON.stringify(sanitizeFeatureList(body.key_features)));
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
      const id = sanitizeVehicleId((req.query && req.query.id) || body.id);
      if (!id) {
        return sendJson(res, 400, { error: 'Vehicle ID is required' });
      }

      await query('DELETE FROM cars WHERE id = $1', [id]);
      return sendJson(res, 200, { ok: true, id });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch {
    return sendJson(res, 500, { error: 'Database error' });
  }
}
