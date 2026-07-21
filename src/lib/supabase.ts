import { createClient } from '@supabase/supabase-js';
import { prepareImageForUpload } from './images';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const enableSupabaseAnalytics = import.meta.env.VITE_ENABLE_SUPABASE_ANALYTICS === 'true';

const hasEnvValue = (value?: string) =>
  Boolean(value && !value.includes('MY_') && !value.includes('placeholder'));

export const isSupabaseConfigured = hasEnvValue(supabaseUrl) && hasEnvValue(supabaseAnonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info('Supabase env vars are missing; using static inventory data locally.');
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

const requireSupabase = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
};

// ── Vehicles ────────────────────────────────────────────────
export const getVehicles = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const markAsSold = async (id: string) => {
  requireSupabase();
  const { error } = await supabase
    .from('cars')
    .update({ is_sold: true, sold_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// ── Image Upload ─────────────────────────────────────────────
const STORAGE_BUCKET = 'vehicle-images';
/** Phone camera originals are often >5 MB; compress first, then enforce the bucket cap. */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const uploadVehicleImage = async (file: File): Promise<string> => {
  requireSupabase();
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported image type. Upload a JPG, PNG, or WebP image.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Image is too large. Choose a photo under 25 MB.');
  }

  // Compress to WebP when possible so inventory pages ship smaller files.
  const prepared = await prepareImageForUpload(file);
  const ext = ALLOWED_IMAGE_TYPES.get(prepared.type) || 'webp';
  if (!ALLOWED_IMAGE_TYPES.has(prepared.type)) {
    throw new Error('Unsupported image type. Upload a JPG, PNG, or WebP image (HEIC/HEIF is not supported).');
  }
  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image is still too large after compression. Try a smaller or lower-resolution photo.');
  }

  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `vehicles/${id}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, prepared, {
      contentType: prepared.type || 'image/webp',
      // Long-lived public cache; object path is unique per upload.
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicUrl;
};

// ── Auth Helpers ─────────────────────────────────────────────
export const signInWithGoogle = async () => {
  requireSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/admin` },
  });
  if (error) throw error;
  return data;
};

// ── Learning Knowledge Base ────────────────────────────────────────
export const fetchDynamicKnowledge = async (): Promise<Record<string, any>> => {
  if (!isSupabaseConfigured) return {};
  try {
    const { data, error } = await supabase.from('vehicle_knowledge').select('*');
    if (error || !data) return {};
    return data.reduce((acc: any, item: any) => {
      acc[item.model_key] = {
        make: item.make,
        bodyType: item.body_type,
        fuel: item.fuel,
        transmission: item.transmission
      };
      return acc;
    }, {});
  } catch (err) {
    console.error('Failed to fetch dynamic knowledge:', err);
    return {};
  }
};

export const learnFromVehicle = async (vehicle: any) => {
  if (!isSupabaseConfigured) return;
  if (!vehicle.model || !vehicle.make) return;
  const modelKey = vehicle.model.toLowerCase();
  
  try {
    const { error } = await supabase.from('vehicle_knowledge').upsert({
      model_key: modelKey,
      make: vehicle.make,
      body_type: vehicle.bodyType,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      last_updated: new Date().toISOString()
    }, { onConflict: 'model_key' });
    
    if (error) console.error('Learning error:', error);
  } catch (err) {
    console.error('Failed to learn from vehicle:', err);
  }
};

export const signOut = async () => {
  requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ── Advanced Analytics ────────────────────────────────────────
export const logPageView = async () => {
  if (!isSupabaseConfigured || !enableSupabaseAnalytics) return;
  try {
    await supabase.rpc('track_site_visit');
  } catch (err) {
    console.error('Failed to log page view:', err);
  }
};

export const logCarView = async (carId: string) => {
  if (!isSupabaseConfigured || !enableSupabaseAnalytics) return;
  try {
    await supabase.rpc('increment_car_view', { car_id: carId });
  } catch (err) {
    console.error('Failed to log car view:', err);
  }
};

// ── Smart Paste Parser with Heuristic Inference Engine ────────────────────────────────────────
export const parseVehicleText = (text: string, dynamicKnowledge?: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  const lower = text.toLowerCase();

  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  // Labeled fields (e.g. "Fuel: Petrol", "Mileage: 161,000") take priority over inference.
  const fuelLabel = text.match(/(?:fuel(?:\s*type)?|engine)\s*[:\-]\s*(petrol|diesel|hybrid|electric)/i);
  if (fuelLabel) result.fuel = cap(fuelLabel[1]);

  const transmissionLabel = text.match(/transmission\s*[:\-]\s*(automatic|manual|cvt|dct)/i);
  if (transmissionLabel) result.transmission = cap(transmissionLabel[1]);

  const mileageLabel = text.match(/(?:mileage|odometer|odo)\s*[:\-]\s*([\d,]+)/i);
  if (mileageLabel) result.mileage = parseInt(mileageLabel[1].replace(/,/g, ''), 10);

  const priceLabel = text.match(/(?:price|asking)\s*[:\-]\s*(?:LKR|Rs\.?)?\s*([\d,]+(?:\.\d+)?)\s*(million|m|lakhs?|lkh)?/i);
  if (priceLabel) {
    let price = parseFloat(priceLabel[1].replace(/,/g, ''));
    const unit = (priceLabel[2] || '').toLowerCase();
    if (unit.startsWith('million') || unit === 'm') price *= 1_000_000;
    else if (unit.startsWith('lakh') || unit === 'lkh') price *= 100_000;
    else if (price < 1000) price *= 1_000_000;
    result.price = Math.round(price);
  }

  const colorLabel = text.match(/(?:color|colour)\s*[:\-]\s*([A-Za-z][A-Za-z\s-]+)/i);
  if (colorLabel) result.color = colorLabel[1].trim();

  const conditionLabel = text.match(/condition\s*[:\-]\s*(new|registered|reconditioned)/i);
  if (conditionLabel) result.condition = cap(conditionLabel[1]);

  // Common Sri Lankan listing shorthand for Mercedes.
  if (/\bmercedes[\s-]?benz\b/i.test(text) || /\bmerc(?:edes)?\b/i.test(text) || /\bbenz\b/i.test(text)) {
    result.make = 'Mercedes-Benz';
  }

  // 1. KNOWLEDGE BASE (The "Thinking" Part)
  // Maps common models to their typical specs in the Sri Lankan market
  const KNOWLEDGE_BASE: Record<string, any> = {
    'prado': { make: 'Toyota', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic' },
    'land cruiser': { make: 'Toyota', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic' },
    'v8': { make: 'Toyota', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    'premio': { make: 'Toyota', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'allion': { make: 'Toyota', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'axio': { make: 'Toyota', bodyType: 'Sedan', fuel: 'Hybrid', transmission: 'Automatic' },
    'prius': { make: 'Toyota', bodyType: 'Hatchback', fuel: 'Hybrid', transmission: 'Automatic' },
    'aqua': { make: 'Toyota', bodyType: 'Hatchback', fuel: 'Hybrid', transmission: 'Automatic' },
    'vitz': { make: 'Toyota', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Automatic' },
    'camry': { make: 'Toyota', bodyType: 'Sedan', fuel: 'Hybrid', transmission: 'Automatic' },
    'corolla': { make: 'Toyota', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'chr': { make: 'Toyota', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' },
    'vezel': { make: 'Honda', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' },
    'vessel': { make: 'Honda', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' }, // common typo
    'fit': { make: 'Honda', bodyType: 'Hatchback', fuel: 'Hybrid', transmission: 'Automatic' },
    'grace': { make: 'Honda', bodyType: 'Sedan', fuel: 'Hybrid', transmission: 'Automatic' },
    'civic': { make: 'Honda', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'crv': { make: 'Honda', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    'wagon r': { make: 'Suzuki', bodyType: 'Hatchback', fuel: 'Hybrid', transmission: 'Automatic' },
    'stingray': { make: 'Suzuki', bodyType: 'Hatchback', fuel: 'Hybrid', transmission: 'Automatic' },
    'alto': { make: 'Suzuki', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual' },
    'swift': { make: 'Suzuki', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Automatic' },
    'spacia': { make: 'Suzuki', bodyType: 'Hatchback', fuel: 'Hybrid', transmission: 'Automatic' },
    'hustler': { make: 'Suzuki', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' },
    'defender': { make: 'Land Rover', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Manual' },
    'range rover': { make: 'Land Rover', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic' },
    'discovery': { make: 'Land Rover', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic' },
    'montero': { make: 'Mitsubishi', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic' },
    'outlander': { make: 'Mitsubishi', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' },
    'hilux': { make: 'Toyota', bodyType: 'Pickup', fuel: 'Diesel', transmission: 'Manual' },
    'l200': { make: 'Mitsubishi', bodyType: 'Pickup', fuel: 'Diesel', transmission: 'Manual' },
    'vito': { make: 'Mercedes-Benz', bodyType: 'Van', fuel: 'Diesel', transmission: 'Automatic' },
    'e-class': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'c-class': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'cla': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'gla': { make: 'Mercedes-Benz', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    'c180': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'c200': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'c250': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'c300': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'e200': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'e250': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'e300': { make: 'Mercedes-Benz', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'glc': { make: 'Mercedes-Benz', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    'gle': { make: 'Mercedes-Benz', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    'sonet': { make: 'Kia', bodyType: 'Crossover', fuel: 'Petrol', transmission: 'Automatic' },
    'sportage': { make: 'Kia', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    'seltos': { make: 'Kia', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
    '520d': { make: 'BMW', bodyType: 'Sedan', fuel: 'Diesel', transmission: 'Automatic' },
    '318i': { make: 'BMW', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Automatic' },
    'x5': { make: 'BMW', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic' },
    'tesla': { make: 'Tesla', bodyType: 'Sedan', fuel: 'Electric', transmission: 'Automatic' },
    'leaf': { make: 'Nissan', bodyType: 'Hatchback', fuel: 'Electric', transmission: 'Automatic' },
    'dayz': { make: 'Nissan', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Automatic' },
    'xtrail': { make: 'Nissan', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' },
    'qashqai': { make: 'Nissan', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Automatic' },
  };

  // Merge static knowledge with dynamic knowledge (if provided)
  const mergedKB = { ...KNOWLEDGE_BASE, ...(dynamicKnowledge || {}) };

  // 2. Year Extraction
  const yearMatch = text.match(/\b(199\d|200\d|201\d|202[0-6])\b/);
  if (yearMatch) result.year = parseInt(yearMatch[0]);

  // 3. Make & Model Extraction (with Inference)
  const makes = [
    'Toyota','Honda','Nissan','Suzuki','Mitsubishi','Hyundai','Kia',
    'Mercedes-Benz','Mercedes','BMW','Audi','Ford','Mazda','Subaru',
    'Isuzu','Land Rover','Jeep','Volkswagen','Lexus','Volvo','Peugeot',
    'Renault','BYD','Perodua','Daihatsu','Porsche','Jaguar','Bentley',
    'Rolls-Royce','Ferrari','Lamborghini','Maserati','Aston Martin','Tesla'
  ];

  let detectedMake = result.make || '';
  for (const m of makes) {
    if (lower.includes(m.toLowerCase())) {
      detectedMake = m;
      result.make = m;
      break;
    }
  }

  // Mercedes/BMW-style model codes (C180, E200, X5, etc.)
  if (!result.model) {
    const modelCodeMatch = text.match(/\b([ABCEGSMVX]{1,2}[-\s]?\d{2,3}[a-z]?)\b/i);
    if (modelCodeMatch) {
      result.model = modelCodeMatch[1].toUpperCase().replace(/[\s-]+/g, '');
    }
  }

  // Model Inference
  for (const [modelKey, specs] of Object.entries(mergedKB)) {
    if (lower.includes(modelKey)) {
      result.model = modelKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      // Inference: Fill missing fields from Knowledge Base if they weren't found in text
      if (!result.make) result.make = specs.make;
      if (!result.bodyType) result.bodyType = specs.bodyType;
      if (!result.fuel) result.fuel = specs.fuel;
      if (!result.transmission) result.transmission = specs.transmission;
      break;
    }
  }

  // Fallback: If model still missing, try to grab words after Make
  if (!result.model && detectedMake) {
    const makeIdx = lower.indexOf(detectedMake.toLowerCase());
    const afterMake = text.slice(makeIdx + detectedMake.length).trim();
    const wordsAfter = afterMake.split(/\s+/).slice(0, 2).join(' ');
    if (wordsAfter && wordsAfter.length > 2) result.model = wordsAfter;
  }

  // 4. Price Logic (Enhanced for LKR / Million / M / Lakhs)
  if (!result.price) {
  const pricePatterns = [
    /(?:LKR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s*(?:million|M)?/i,
    /([\d,]+(?:\.\d+)?)\s*(?:million|M)\b/i,
    /(?:price|asking)[:\s]+([\d,]+)/i,
    /([\d,]+(?:\.\d+)?)\s*(?:lakhs?|lkh)\b/i,
    /\b([\d]{7,})\b/,
  ];
  for (const pat of pricePatterns) {
    const m = text.match(pat);
    if (m) {
      let valStr = m[1].replace(/,/g, '');
      let price = parseFloat(valStr);
      const surrounding = text.slice(Math.max(0, (m.index ?? 0) - 10), (m.index ?? 0) + 40).toLowerCase();
      
      if (surrounding.includes('million') || surrounding.includes(' m')) price *= 1_000_000;
      else if (surrounding.includes('lakh')) price *= 100_000;
      else if (price < 1000) price *= 1_000_000; // Guessing "35" means 35M if it's a small number

      result.price = Math.round(price);
      break;
    }
  }
  }

  // 5. Mileage
  if (!result.mileage) {
  const mileageMatch = text.match(/([\d,]+)\s*(?:km|kms|kilometers?|mileage|odo)\b/i)
    || text.match(/\b(\d{4,7})\s*km\b/i);
  if (mileageMatch) result.mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
  }

  // 6. Manual Overrides (Text beats Inference)
  if (!result.fuel) {
  if (/\belectric\b|\bev\b/i.test(lower)) result.fuel = 'Electric';
  else if (/\bhybrid\b/i.test(lower)) result.fuel = 'Hybrid';
  else if (/\bdiesel\b/i.test(lower)) result.fuel = 'Diesel';
  else if (/\bpetrol\b|\bgasoline\b|\bgas\b/i.test(lower)) result.fuel = 'Petrol';
  }

  if (!result.transmission) {
  if (/\bautomatic\b|\bauto\b|\bCVT\b|\bDCT\b/i.test(lower)) result.transmission = 'Automatic';
  else if (/\bmanual\b|\bMT\b/i.test(lower)) result.transmission = 'Manual';
  }

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

  // 7. Condition
  if (!result.condition) {
  if (/\brecondition/i.test(lower)) result.condition = 'Reconditioned';
  else if (/\bregistered\b/i.test(lower)) result.condition = 'Registered';
  else if (/\bbrand[\s-]?new\b|\bunregistered\b/i.test(lower)) result.condition = 'New';
  }

  // 8. Color
  if (!result.color) {
  const colors = ['Pearl White','White','Black','Silver','Grey','Gray','Red','Blue','Green','Brown','Beige','Gold','Maroon','Orange','Yellow','Champagne'];
  for (const c of colors) {
    if (lower.includes(c.toLowerCase())) { result.color = c; break; }
  }
  }

  if (result.make === 'Mercedes') result.make = 'Mercedes-Benz';

  // 9. Key Features (Automatic Extraction from Text)
  const featuresList = [
    'Sunroof', 'Panoramic Roof', 'Leather Seats', 'Electric Seats', 'Cruise Control', 
    'Adaptive Cruise', 'Blind Spot', 'Lane Departure', '360 Camera', 'Reverse Camera', 
    'Push Start', 'Keyless entry', 'Apple CarPlay', 'Android Auto', 'Harman Kardon', 
    'Bose Audio', 'Matrix LED', 'Ambient Lighting', 'Soft Close', 'Memory Seats',
    'Heated Seats', 'Ventilated Seats', 'Dual Zone AC', 'Paddle Shift', 'Auto Braking'
  ];
  const detectedFeatures: string[] = [];
  for (const f of featuresList) {
    if (lower.includes(f.toLowerCase())) detectedFeatures.push(f);
  }
  if (detectedFeatures.length > 0) result.key_features = detectedFeatures;

  // 10. Description
  result.description = text.trim();

  return result;
};
