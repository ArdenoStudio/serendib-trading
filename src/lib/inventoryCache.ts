import type { Car } from '../data/types';
import { isSupabaseConfigured, supabase } from './supabase';
import { mapLiveVehicles, normalizeVehicle, isSoldExpired } from './inventory';

/** Columns needed for public list cards and filters. */
export const INVENTORY_LIST_COLUMNS =
  'id,make,model,year,price,mileage,fuel,transmission,bodyType,color,image,gallery,condition,description,key_features,is_sold,sold_at,created_at,views';

const CACHE_TTL_MS = 45_000;

let listCache: { at: number; cars: Car[] } | null = null;
let listInflight: Promise<Car[]> | null = null;

export function invalidateInventoryCache() {
  listCache = null;
  listInflight = null;
}

/**
 * Shared public inventory fetch. Dedupes concurrent callers and reuses
 * results briefly so Home + HeroSearch + Inventory don't triple-hit Supabase.
 */
export async function fetchInventoryList(options?: { force?: boolean }): Promise<Car[]> {
  if (!isSupabaseConfigured) return [];

  const force = options?.force === true;
  const now = Date.now();
  if (!force && listCache && now - listCache.at < CACHE_TTL_MS) {
    return listCache.cars;
  }
  if (!force && listInflight) return listInflight;

  listInflight = (async () => {
    const { data, error } = await supabase
      .from('cars')
      .select(INVENTORY_LIST_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const cars = mapLiveVehicles(data);
    listCache = { at: Date.now(), cars };
    return cars;
  })();

  try {
    return await listInflight;
  } finally {
    listInflight = null;
  }
}

/** Single-vehicle fetch for detail pages (avoids downloading full inventory). */
export async function fetchVehicleById(id: string): Promise<Car | null> {
  if (!isSupabaseConfigured || !id) return null;

  const { data, error } = await supabase
    .from('cars')
    .select(INVENTORY_LIST_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const car = normalizeVehicle(data);
  if (isSoldExpired(car)) return null;
  return car;
}

/** Similar vehicles from the shared list cache (avoids fragile filter strings). */
export async function fetchSimilarVehicles(car: Car, limit = 3): Promise<Car[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const all = await fetchInventoryList();
    return all
      .filter(
        (c) =>
          c.id !== car.id &&
          !c.is_sold &&
          (c.make === car.make || c.bodyType === car.bodyType),
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}
