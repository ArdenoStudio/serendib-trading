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
  return await sql(text, params);
};
