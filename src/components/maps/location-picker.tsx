'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const icon = L.divIcon({
      html: '<div style="background:#2563eb;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    markerRef.current = marker;

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  return <div ref={mapRef} className="h-full w-full" />;
}
