export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Vaccination {
  vaccine_name: string;
  date_given: string;
  expires_at?: string;
  vet_name?: string;
  verified: boolean;
}

export interface PetSpec {
  pet_type: string;
  breed?: string;
  name: string;
  weight_kg: number;
  age_months?: number;
  vaccinations?: Vaccination[];
  special_needs?: string;
  photo_url?: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  owner_id: string;
  runner_id?: string;
  status: BookingStatus;
  pet_spec: PetSpec;
  pickup_address: Address;
  dropoff_address: Address;
  estimated_price_cents: number;
  final_price_cents?: number;
  currency: string;
  scheduled_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancel_note?: string;
  notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingRequest {
  pet_spec: PetSpec;
  pickup_address: Address;
  dropoff_address: Address;
  scheduled_at?: string;
  notes?: string;
}
