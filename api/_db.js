/**
 * System of record: Neon Postgres (DATABASE_URL).
 * Photos: Supabase Storage URLs stored as text on `cars.image` / `cars.gallery`.
 * Do not move records back to Supabase Postgres, and never store image bytes
 * in Postgres — that is what blew egress on both providers.
 */
import { neon } from '@neondatabase/serverless';

export const getDb = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }
  return neon(connectionString);
};

export const query = async (text, params = []) => {
  const sql = getDb();
  return await sql.query(text, params);
};
