'use client';

import { create } from 'zustand';
import api from '@/lib/api';

interface RunnerState {
  isOnline: boolean;
  isUpdatingLocation: boolean;
  watchId: number | null;
  setOnline: (lat: number, lng: number) => Promise<void>;
  setOffline: () => Promise<void>;
  startLocationUpdates: () => void;
  stopLocationUpdates: () => void;
}

let locationInterval: ReturnType<typeof setInterval> | null = null;
let lastLat = 0;
let lastLng = 0;

export const useRunnerStore = create<RunnerState>((set, get) => ({
  isOnline: false,
  isUpdatingLocation: false,
  watchId: null,

  setOnline: async (lat: number, lng: number) => {
    try {
      await api.post('/api/v1/runners/me/online', {
        latitude: lat,
        longitude: lng,
      });
      set({ isOnline: true });
      get().startLocationUpdates();
    } catch (error) {
      console.error('Failed to go online:', error);
      throw error;
    }
  },

  setOffline: async () => {
    try {
      get().stopLocationUpdates();
      await api.post('/api/v1/runners/me/offline');
      set({ isOnline: false });
    } catch (error) {
      console.error('Failed to go offline:', error);
      throw error;
    }
  },

  startLocationUpdates: () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        lastLat = position.coords.latitude;
        lastLng = position.coords.longitude;
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    set({ watchId });

    // Send location updates every 10 seconds
    if (locationInterval) clearInterval(locationInterval);
    locationInterval = setInterval(async () => {
      if (lastLat === 0 && lastLng === 0) return;
      try {
        set({ isUpdatingLocation: true });
        await api.post('/api/v1/runners/me/location', {
          latitude: lastLat,
          longitude: lastLng,
        });
      } catch (error) {
        console.error('Failed to update location:', error);
      } finally {
        set({ isUpdatingLocation: false });
      }
    }, 10000);
  },

  stopLocationUpdates: () => {
    const { watchId } = get();
    if (watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchId);
    }
    if (locationInterval) {
      clearInterval(locationInterval);
      locationInterval = null;
    }
    set({ watchId: null, isUpdatingLocation: false });
  },
}));
