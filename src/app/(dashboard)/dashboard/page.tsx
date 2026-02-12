'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Car, Activity, Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusToggle } from '@/components/runner/status-toggle';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import { formatMYR, getStatusColor, getStatusLabel } from '@/lib/format';
import type { ApiResponse } from '@/types/api';
import type { Runner } from '@/types/runner';
import type { PaginatedResponse } from '@/types/api';
import type { Booking } from '@/types/booking';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [runner, setRunner] = useState<Runner | null>(null);
  const [runnerLoading, setRunnerLoading] = useState(true);
  const [hasRunner, setHasRunner] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Fetch runner profile
    api.get<ApiResponse<Runner>>('/api/v1/runners/me')
      .then(({ data }) => {
        setRunner(data.data);
        setHasRunner(true);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setHasRunner(false);
        }
      })
      .finally(() => setRunnerLoading(false));

    // Fetch recent bookings
    api.get<PaginatedResponse<Booking>>('/api/v1/bookings?page=1&limit=5')
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => {});
  }, []);

  const activeBooking = bookings.find((b) =>
    ['accepted', 'picked_up', 'in_transit'].includes(b.status)
  );

  if (runnerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasRunner) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Complete Your Runner Setup</CardTitle>
            <p className="text-muted-foreground">
              Set up your vehicle details and crate specifications to start accepting jobs.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/setup">
                Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">Manage your deliveries and earnings</p>
        </div>
        <div className="hidden sm:block">
          <StatusToggle />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{runner?.rating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{runner?.total_trips || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Car className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="text-2xl font-bold capitalize">{runner?.vehicle_type || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session</p>
                <p className="text-2xl font-bold capitalize">{runner?.session_status || 'offline'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/jobs">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">View Available Jobs</p>
                <p className="text-sm text-muted-foreground">Browse and accept delivery requests</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/earnings">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">View Earnings</p>
                <p className="text-sm text-muted-foreground">Check your delivery earnings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Job */}
      {activeBooking && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Activity className="h-5 w-5" />
              Active Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activeBooking.pet_spec?.name || 'Pet'}</p>
                <p className="text-sm text-muted-foreground">
                  {activeBooking.pickup_address?.city} → {activeBooking.dropoff_address?.city}
                </p>
                <Badge className={getStatusColor(activeBooking.status)} variant="secondary">
                  {getStatusLabel(activeBooking.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatMYR(activeBooking.estimated_price_cents)}</p>
                <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href={`/jobs/${activeBooking.id}/active`}>
                    Track <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
