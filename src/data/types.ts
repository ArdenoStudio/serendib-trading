export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  image: string;
  gallery?: string[];
  condition: string;
  description?: string;
  key_features?: string[];
  is_sold?: boolean;
  sold_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  type: 'Test Drive' | 'General Inquiry';
  vehicle_id?: string;
  vehicle_model?: string;
  name: string;
  phone: string;
  date?: string;
  time?: string;
  message?: string;
  created_at: string;
  status: 'New' | 'Contacted' | 'Closed';
}
