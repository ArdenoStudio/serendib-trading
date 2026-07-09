/**
 * One-shot listing quality fixes for Serendib production inventory.
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from env / .env.local.
 * Never logs secret values.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

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

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function fetchCars() {
  const res = await fetch(
    `${url}/rest/v1/cars?select=id,make,model,year,fuel,bodyType,condition,mileage,key_features&order=created_at.desc`,
    { headers },
  );
  if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function patchFor(car) {
  const patch = {};
  const model = `${car.make || ''} ${car.model || ''}`.toLowerCase();

  // Invalid admin placeholder
  if (!car.fuel || String(car.fuel).trim().toLowerCase() === 'fuel') {
    patch.fuel = 'Petrol';
  }

  // Body mismatches
  if (/sorento|prado|montero|xtrail|x-trail|rav4|cr-v|crv|vezel|defender|range rover/.test(model)) {
    if (!car.bodyType || String(car.bodyType).toLowerCase() === 'sedan') {
      if (/vezel|chr|c-hr/.test(model)) patch.bodyType = 'Crossover';
      else patch.bodyType = 'SUV';
    }
  }
  if (/mini cooper|aqua|vitz|fit|swift/.test(model) && (!car.bodyType || /sedan/i.test(car.bodyType))) {
    patch.bodyType = 'Hatchback';
  }

  // Used stock marked "New"
  if (String(car.condition || '').toLowerCase() === 'new' && Number(car.year) <= 2022) {
    patch.condition = 'Registered';
  }

  // Empty feature arrays: do not invent features; leave empty for operator to fill.
  return Object.keys(patch).length ? patch : null;
}

async function applyPatch(id, patch) {
  const res = await fetch(`${url}/rest/v1/cars?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Patch ${id} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

const cars = await fetchCars();
console.log(`Loaded ${cars.length} cars`);

let updated = 0;
for (const car of cars) {
  const patch = patchFor(car);
  const label = `${car.year} ${car.make} ${car.model}`.trim();
  if (!patch) {
    console.log(`OK  ${label}`);
    continue;
  }
  await applyPatch(car.id, patch);
  updated += 1;
  console.log(`FIX ${label} -> ${JSON.stringify(patch)}`);
}

console.log(`Done. Updated ${updated}/${cars.length} listings.`);
