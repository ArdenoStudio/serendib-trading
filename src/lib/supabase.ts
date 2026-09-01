import { prepareImageForUpload } from './images';

export const isSupabaseConfigured = true;

// Compatibility stub for any direct supabase object calls
export const supabase = {
  auth: {
    getSession: async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) return { data: { session: null }, error: null };
        const json = await res.json();
        return { data: { session: json.session }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Fetch initial session asynchronously
      fetch('/api/auth/session')
        .then((res) => (res.ok ? res.json() : { session: null }))
        .then((json) => callback('INITIAL_SESSION', json.session))
        .catch(() => callback('INITIAL_SESSION', null));

      return {
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      };
    },
    signInWithOAuth: async () => {
      window.location.href = '/api/auth/login';
      return { data: { provider: 'google', url: '/api/auth/login' }, error: null };
    },
    signOut: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      return { error: null };
    },
  },
  from: (table: string) => ({
    select: () => ({
      order: async () => {
        if (table === 'cars') {
          const vehicles = await getVehicles();
          return { data: vehicles, error: null };
        }
        return { data: [], error: null };
      },
    }),
  }),
};

// ── Vehicles ────────────────────────────────────────────────
export const getVehicles = async () => {
  try {
    const res = await fetch('/api/db/vehicles');
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return [];
  }
};

export const markAsSold = async (id: string) => {
  const res = await fetch('/api/db/vehicles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_sold: true, sold_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to mark vehicle as sold');
  }
};

// ── Image Upload ─────────────────────────────────────────────
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const uploadVehicleImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported image type. Upload a JPG, PNG, or WebP image.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Image is too large. Choose a photo under 25 MB.');
  }

  const prepared = await prepareImageForUpload(file);
  if (!ALLOWED_IMAGE_TYPES.has(prepared.type)) {
    throw new Error('Unsupported image type. Upload a JPG, PNG, or WebP image.');
  }
  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image is still too large after compression.');
  }

  // Convert compressed blob/file to Data URL and upload via /api/upload endpoint
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: dataUrl }),
        });
        if (!res.ok) {
          // Fail loudly instead of persisting a base64 blob into the database.
          const err = await res.json().catch(() => ({}));
          reject(new Error(err.error || 'Image upload failed.'));
          return;
        }
        const json = await res.json();
        resolve(json.url || dataUrl);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Image upload failed.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(prepared);
  });
};

// ── Auth Helpers ─────────────────────────────────────────────
export const signInWithGoogle = async () => {
  window.location.href = '/api/auth/login';
};

export const signOut = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
};

// ── Learning Knowledge Base ────────────────────────────────────────
export const fetchDynamicKnowledge = async (): Promise<Record<string, any>> => {
  try {
    const res = await fetch('/api/db/knowledge');
    if (!res.ok) return {};
    const data = await res.json();
    if (!Array.isArray(data)) return {};
    return data.reduce((acc: any, item: any) => {
      const modelKey = (item.topic || item.model_key || '').toLowerCase();
      if (modelKey) {
        acc[modelKey] = {
          make: item.make || item.category,
          bodyType: item.body_type,
          fuel: item.fuel,
          transmission: item.transmission,
        };
      }
      return acc;
    }, {});
  } catch (err) {
    console.error('Failed to fetch dynamic knowledge:', err);
    return {};
  }
};

export const learnFromVehicle = async (vehicle: any) => {
  if (!vehicle || !vehicle.model || !vehicle.make) return;
  try {
    await fetch('/api/db/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: vehicle.make,
        topic: vehicle.model,
        content: JSON.stringify({
          body_type: vehicle.bodyType,
          fuel: vehicle.fuel,
          transmission: vehicle.transmission,
        }),
      }),
    });
  } catch (err) {
    console.error('Failed to learn from vehicle:', err);
  }
};

// ── Advanced Analytics ────────────────────────────────────────
export const logPageView = async () => {
  try {
    await fetch('/api/db/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page_view', path: window.location.pathname, referrer: document.referrer }),
    });
  } catch (err) {
    console.error('Failed to log page view:', err);
  }
};

export const logCarView = async (carId: string) => {
  try {
    await fetch('/api/db/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'car_view', car_id: carId, path: window.location.pathname, referrer: document.referrer }),
    });
  } catch (err) {
    console.error('Failed to log car view:', err);
  }
};

export const logCtaClick = async (cta: string, meta: Record<string, any> = {}) => {
  try {
    await fetch('/api/db/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'cta_click', cta, path: window.location.pathname, referrer: document.referrer, meta }),
    });
  } catch (err) {
    console.error('Failed to log CTA:', err);
  }
};

// ── Smart Paste Parser with Heuristic Inference Engine ────────────────────────────────────────
export const parseVehicleText = (text: string, dynamicKnowledge?: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  const lower = text.toLowerCase();

  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

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

  if (/\bmercedes[\s-]?benz\b/i.test(text) || /\bmerc(?:edes)?\b/i.test(text) || /\bbenz\b/i.test(text)) {
    result.make = 'Mercedes-Benz';
  }

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
    'vessel': { make: 'Honda', bodyType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic' },
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

  const mergedKB = { ...KNOWLEDGE_BASE, ...(dynamicKnowledge || {}) };

  const yearMatch = text.match(/\b(199\d|200\d|201\d|202[0-6])\b/);
  if (yearMatch) result.year = parseInt(yearMatch[0]);

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

  if (!result.model) {
    const modelCodeMatch = text.match(/\b([ABCEGSMVX]{1,2}[-\s]?\d{2,3}[a-z]?)\b/i);
    if (modelCodeMatch) {
      result.model = modelCodeMatch[1].toUpperCase().replace(/[\s-]+/g, '');
    }
  }

  for (const [modelKey, specs] of Object.entries(mergedKB)) {
    if (lower.includes(modelKey)) {
      result.model = modelKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!result.make) result.make = specs.make;
      if (!result.bodyType) result.bodyType = specs.bodyType;
      if (!result.fuel) result.fuel = specs.fuel;
      if (!result.transmission) result.transmission = specs.transmission;
      break;
    }
  }

  if (!result.model && detectedMake) {
    const makeIdx = lower.indexOf(detectedMake.toLowerCase());
    const afterMake = text.slice(makeIdx + detectedMake.length).trim();
    const wordsAfter = afterMake.split(/\s+/).slice(0, 2).join(' ');
    if (wordsAfter && wordsAfter.length > 2) result.model = wordsAfter;
  }

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
        else if (price < 1000) price *= 1_000_000;

        result.price = Math.round(price);
        break;
      }
    }
  }

  if (!result.mileage) {
    const mileageMatch = text.match(/([\d,]+)\s*(?:km|kms|kilometers?|mileage|odo)\b/i)
      || text.match(/\b(\d{4,7})\s*km\b/i);
    if (mileageMatch) result.mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
  }

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

  if (!result.condition) {
    if (/\brecondition/i.test(lower)) result.condition = 'Reconditioned';
    else if (/\bregistered\b/i.test(lower)) result.condition = 'Registered';
    else if (/\bbrand[\s-]?new\b|\bunregistered\b/i.test(lower)) result.condition = 'New';
  }

  if (!result.color) {
    const colors = ['Pearl White','White','Black','Silver','Grey','Gray','Red','Blue','Green','Brown','Beige','Gold','Maroon','Orange','Yellow','Champagne'];
    for (const c of colors) {
      if (lower.includes(c.toLowerCase())) { result.color = c; break; }
    }
  }

  if (result.make === 'Mercedes') result.make = 'Mercedes-Benz';

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

  result.description = text.trim();

  return result;
};
