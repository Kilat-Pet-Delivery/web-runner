export interface TrackingUpdate {
  booking_id: string;
  runner_id: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_degrees: number;
  timestamp: string;
}

export interface TrackingData {
  booking_id: string;
  runner_id: string;
  status: string;
  current_latitude: number;
  current_longitude: number;
  waypoints: TrackingUpdate[];
}
