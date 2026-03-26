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
  condition: string;
  description?: string;
  key_features?: string[];
  is_sold?: boolean;
  sold_at?: string;
  created_at?: string;
  updated_at?: string;
}
