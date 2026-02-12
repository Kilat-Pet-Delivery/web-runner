export interface Runner {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  vehicle_model: string;
  air_conditioned: boolean;
  session_status: string;
  rating: number;
  total_trips: number;
  crate_specs?: CrateSpec[];
  distance_km?: number;
  created_at: string;
}

export interface CrateSpec {
  id: string;
  size: string;
  pet_types: string[];
  max_weight_kg: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  ventilated: boolean;
  temperature_controlled: boolean;
}
