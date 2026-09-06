/**
 * One-shot repair for corrupted `cars.year` values (Neon migration artifact).
 * Reads DATABASE_URL from env / .env.local and updates rows in place.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  query,
  resolveVehicleYear,
  isCorruptVehicleYear,
} from '../api/_db.js';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'));
loadEnvFile(resolve(process.cwd(), '.env'));

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const rows = await query(
  'SELECT id, make, model, year, description FROM cars ORDER BY created_at DESC'
);

let updated = 0;
for (const row of rows) {
  if (!isCorruptVehicleYear(row.year)) {
    console.log(`OK  ${row.year} ${row.make} ${row.model}`);
    continue;
  }

  const resolved = resolveVehicleYear(row);
  if (resolved === row.year) {
    console.log(`SKIP ${row.make} ${row.model} (could not recover year)`);
    continue;
  }

  await query('UPDATE cars SET year = $1 WHERE id = $2::uuid', [resolved, row.id]);
  updated += 1;
  console.log(`FIX ${row.make} ${row.model}: ${row.year} -> ${resolved}`);
}

console.log(`Done. Updated ${updated}/${rows.length} listings.`);
