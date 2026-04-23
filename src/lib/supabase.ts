import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// ── Vehicles ────────────────────────────────────────────────
export const getVehicles = async () => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const markAsSold = async (id: string) => {
  const { error } = await supabase
    .from('cars')
    .update({ is_sold: true, sold_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// ── Image Upload ─────────────────────────────────────────────
const STORAGE_BUCKET = 'vehicle-images';

export const uploadVehicleImage = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `vehicles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicUrl;
};

// ── Auth Helpers ─────────────────────────────────────────────
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/admin` },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ── Smart Paste Parser ────────────────────────────────────────
export const parseVehicleText = (text: string): Record<string, any> => {
  const result: Record<string, any> = {};
  const lower = text.toLowerCase();

  // Year
  const yearMatch = text.match(/\b(199\d|200\d|201\d|202[0-6])\b/);
  if (yearMatch) result.year = parseInt(yearMatch[0]);

  // Make
  const makes = [
    'Toyota','Honda','Nissan','Suzuki','Mitsubishi','Hyundai','Kia',
    'Mercedes-Benz','Mercedes','BMW','Audi','Ford','Mazda','Subaru',
    'Isuzu','Land Rover','Jeep','Volkswagen','Lexus','Volvo','Peugeot',
    'Renault','BYD','Perodua','Daihatsu','Porsche','Jaguar','Bentley',
    'Rolls-Royce','Ferrari','Lamborghini','Maserati','Aston Martin',
  ];
  for (const make of makes) {
    if (lower.includes(make.toLowerCase())) { result.make = make; break; }
  }

  // Price
  const pricePatterns = [
    /(?:LKR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s*(?:million|M)?/i,
    /([\d,]+(?:\.\d+)?)\s*(?:million|M)\b/i,
    /(?:price|asking)[:\s]+([\d,]+)/i,
    /\b([\d]{7,})\b/,
  ];
  for (const pat of pricePatterns) {
    const m = text.match(pat);
    if (m) {
      let price = parseFloat(m[1].replace(/,/g, ''));
      if (/million|M\b/i.test(text.slice(m.index ?? 0, (m.index ?? 0) + 30))) price *= 1_000_000;
      result.price = Math.round(price);
      break;
    }
  }

  // Mileage
  const mileageMatch = text.match(/([\d,]+)\s*(?:km|kms|kilometers?)\b/i);
  if (mileageMatch) result.mileage = parseInt(mileageMatch[1].replace(/,/g, ''));

  // Fuel
  if (/\belectric\b|\bev\b/i.test(lower)) result.fuel = 'Electric';
  else if (/\bhybrid\b/i.test(lower)) result.fuel = 'Hybrid';
  else if (/\bdiesel\b/i.test(lower)) result.fuel = 'Diesel';
  else if (/\bpetrol\b|\bgasoline\b|\bgas\b/i.test(lower)) result.fuel = 'Petrol';

  // Transmission
  if (/\bautomatic\b|\bauto\b|\bCVT\b|\bDCT\b/i.test(lower)) result.transmission = 'Automatic';
  else if (/\bmanual\b|\bMT\b/i.test(lower)) result.transmission = 'Manual';

  // Body Type
  const bodyTypes: [RegExp, string][] = [
    [/\bsuv\b|\bcrossover\b/i, 'SUV'],
    [/\bsedan\b/i, 'Sedan'],
    [/\bhatchback\b|\bhatch\b/i, 'Hatchback'],
    [/\bcoupe\b/i, 'Coupe'],
    [/\bpickup\b|\btruck\b/i, 'Pickup'],
    [/\bvan\b|\bminivan\b/i, 'Van'],
    [/\bwagon\b/i, 'Wagon'],
    [/\bcab\b|\bdouble cab\b/i, 'Double Cab'],
  ];
  for (const [re, bt] of bodyTypes) {
    if (re.test(lower)) { result.bodyType = bt; break; }
  }

  // Condition
  if (/\brecondition/i.test(lower)) result.condition = 'Reconditioned';
  else if (/\bregistered\b/i.test(lower)) result.condition = 'Registered';
  else if (/\bbrand[\s-]?new\b|\bunregistered\b/i.test(lower)) result.condition = 'New';

  // Color
  const colors = ['Pearl White','White','Black','Silver','Grey','Gray','Red','Blue',
    'Green','Brown','Beige','Gold','Maroon','Orange','Yellow','Champagne'];
  for (const c of colors) {
    if (lower.includes(c.toLowerCase())) { result.color = c; break; }
  }

  // Description — use full text
  result.description = text.trim();

  // Key features (bullet-like lines)
  const featureLines = text.split(/\n/).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l.length > 3 && l.length < 60);
  if (featureLines.length > 1) result.key_features = featureLines.slice(0, 8);

  return result;
};
