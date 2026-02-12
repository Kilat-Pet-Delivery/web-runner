'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Navigation,
  Clock,
  Gauge,
  MapPin,
  Package,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { getStatusColor, getStatusLabel } from '@/lib/format';
import type { ApiResponse } from '@/types/api';
import type { Booking } from '@/types/booking';
import type { TrackingUpdate } from '@/types/tracking';
import { toast } from 'sonner';

const TrackingMap = dynamic(
  () => import('@/components/maps/tracking-map'),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);

export default function ActiveDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<TrackingUpdate | null>(null);
  const [startTime] = useState(new Date());
  const [elapsed, setElapsed] = useState('0:00');
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get<ApiResponse<Booking>>(`/api/v1/bookings/${id}`)
      .then(({ data }) => setBooking(data.data))
      .catch(() => toast.error('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [id]);

  // Track elapsed time
  useEffect(() => {
    elapsedIntervalRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, [startTime]);

  // GPS location tracking
  const sendLocation = useCallback(async (lat: number, lng: number, speed: number) => {
    setCurrentPosition({
      booking_id: id,
      runner_id: '',
      latitude: lat,
      longitude: lng,
      speed_kmh: speed * 3.6,
      heading_degrees: 0,
      timestamp: new Date().toISOString(),
    });

    try {
      await api.post('/api/v1/runners/me/location', {
        latitude: lat,
        longitude: lng,
      });
    } catch {
      // silently fail location updates
    }
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 0),
      () => {},
      { enableHighAccuracy: true }
    );

    // Send location updates every 10 seconds
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPosition((prev) => ({
          booking_id: id,
          runner_id: prev?.runner_id || '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed_kmh: (pos.coords.speed || 0) * 3.6,
          heading_degrees: pos.coords.heading || 0,
          timestamp: new Date().toISOString(),
        }));
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 0),
        () => {},
        { enableHighAccuracy: true }
      );
    }, 10000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [id, sendLocation]);

  async function handleAction(action: string, label: string) {
    setActionLoading(true);
    try {
      await api.post(`/api/v1/bookings/${id}/${action}`);
      toast.success(`${label} successful`);
      const { data } = await api.get<ApiResponse<Booking>>(`/api/v1/bookings/${id}`);
      setBooking(data.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || `Failed to ${label.toLowerCase()}`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !booking) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/jobs/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Active Delivery</h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(booking.status)} variant="secondary">
              {getStatusLabel(booking.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              #{booking.booking_number}
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="h-[400px]">
          <TrackingMap
            pickup={booking.pickup_address}
            dropoff={booking.dropoff_address}
            currentPosition={currentPosition}
          />
        </div>
      </Card>

      {/* Status Info Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="mx-auto h-5 w-5 text-blue-600" />
            <p className="mt-1 text-lg font-bold">
              {currentPosition ? `${currentPosition.speed_kmh.toFixed(0)}` : '0'}
            </p>
            <p className="text-xs text-muted-foreground">km/h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto h-5 w-5 text-green-600" />
            <p className="mt-1 text-sm font-bold">
              {currentPosition
                ? `${currentPosition.latitude.toFixed(4)}, ${currentPosition.longitude.toFixed(4)}`
                : 'Loading...'}
            </p>
            <p className="text-xs text-muted-foreground">Current Pos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-purple-600" />
            <p className="mt-1 text-lg font-bold">{elapsed}</p>
            <p className="text-xs text-muted-foreground">Elapsed</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4 text-green-600" />
            <span className="font-medium">Pickup:</span>
            <span className="text-muted-foreground">{booking.pickup_address?.line1}, {booking.pickup_address?.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-600" />
            <span className="font-medium">Dropoff:</span>
            <span className="text-muted-foreground">{booking.dropoff_address?.line1}, {booking.dropoff_address?.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Pet:</span>
            <span className="text-muted-foreground">
              {booking.pet_spec?.name} ({booking.pet_spec?.pet_type})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {(booking.status === 'accepted') && (
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleAction('pickup', 'Mark Pickup')}
            disabled={actionLoading}
          >
            <Package className="mr-2 h-4 w-4" />
            {actionLoading ? 'Processing...' : 'Mark Pickup'}
          </Button>
        )}

        {(booking.status === 'picked_up' || booking.status === 'in_transit') && (
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleAction('deliver', 'Mark Delivered')}
            disabled={actionLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {actionLoading ? 'Processing...' : 'Mark Delivered'}
          </Button>
        )}

        {booking.status === 'delivered' && (
          <div className="flex-1 rounded-lg bg-green-50 p-4 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-2 font-semibold text-green-700">Delivery Complete!</p>
            <Button className="mt-3" variant="outline" asChild>
              <a href="/jobs">Back to Jobs</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
