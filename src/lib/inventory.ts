import type { Car } from '../data/types';
import carsData from '../data/cars.json';
import { isSupabaseConfigured } from './supabase';

/**
 * Demo JSON inventory is for local development without Supabase only.
 * Production always starts empty and loads live stock when configured.
 */
export const allowDemoInventory =
  import.meta.env.DEV && !isSupabaseConfigured;

export const SOLD_VISIBILITY_DAYS = 14;

export function getInitialInventory(): Car[] {
  return allowDemoInventory ? getDemoInventory() : [];
}

export function getDemoInventory(): Car[] {
  return (carsData as Car[]).map(normalizeVehicle);
}

export function normalizeVehicle(vehicle: any): Car {
  const price = Number(vehicle.price);
  const mileage = Number(vehicle.mileage);
  return {
    ...vehicle,
    bodyType: vehicle.bodyType || vehicle.body_type || '',
    fuel: vehicle.fuel || vehicle.fuel_type || '',
    transmission: vehicle.transmission || vehicle.transmission_type || '',
    key_features: vehicle.key_features || vehicle.keyFeatures || [],
    price: Number.isFinite(price) && price > 0 ? price : 0,
    mileage: Number.isFinite(mileage) && mileage > 0 ? mileage : 0,
  };
}

export function isSoldExpired(vehicle: Car): boolean {
  if (!vehicle.is_sold || !vehicle.sold_at) return false;
  const soldMs = new Date(vehicle.sold_at).getTime();
  if (Number.isNaN(soldMs)) return false;
  return Date.now() - soldMs > SOLD_VISIBILITY_DAYS * 24 * 60 * 60 * 1000;
}

export function mapLiveVehicles(rows: any[] | null | undefined): Car[] {
  if (!rows?.length) return [];
  return rows.map(normalizeVehicle).filter((vehicle) => !isSoldExpired(vehicle));
}
