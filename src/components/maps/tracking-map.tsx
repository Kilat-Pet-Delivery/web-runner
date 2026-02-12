'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Address } from '@/types/booking';
import type { TrackingUpdate } from '@/types/tracking';

interface TrackingMapProps {
  pickup: Address;
  dropoff: Address;
  currentPosition?: TrackingUpdate | null;
}

export default function TrackingMap({ pickup, dropoff, currentPosition }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const runnerMarker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView(
      [pickup.latitude, pickup.longitude],
      13
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Pickup marker (green)
    const pickupIcon = L.divIcon({
      html: '<div style="background:#16a34a;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: '',
    });
    L.marker([pickup.latitude, pickup.longitude], { icon: pickupIcon })
      .bindPopup('Pickup')
      .addTo(map);

    // Dropoff marker (red)
    const dropoffIcon = L.divIcon({
      html: '<div style="background:#dc2626;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: '',
    });
    L.marker([dropoff.latitude, dropoff.longitude], { icon: dropoffIcon })
      .bindPopup('Dropoff')
      .addTo(map);

    // Route line
    L.polyline(
      [
        [pickup.latitude, pickup.longitude],
        [dropoff.latitude, dropoff.longitude],
      ],
      { color: '#2563eb', weight: 3, dashArray: '8 8' }
    ).addTo(map);

    // Runner marker (blue, animated)
    const runnerIcon = L.divIcon({
      html: '<div style="background:#2563eb;width:28px;height:28px;border-radius:50%;border:4px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px">&#128663;</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      className: '',
    });
    runnerMarker.current = L.marker([pickup.latitude, pickup.longitude], { icon: runnerIcon }).addTo(map);

    // Fit bounds
    map.fitBounds([
      [pickup.latitude, pickup.longitude],
      [dropoff.latitude, dropoff.longitude],
    ], { padding: [50, 50] });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update runner position
  useEffect(() => {
    if (currentPosition && runnerMarker.current) {
      runnerMarker.current.setLatLng([currentPosition.latitude, currentPosition.longitude]);
    }
  }, [currentPosition]);

  return <div ref={mapRef} className="h-full w-full" />;
}
