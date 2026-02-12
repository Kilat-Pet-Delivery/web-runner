'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  User,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';
import { formatMYR, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/format';
import type { ApiResponse } from '@/types/api';
import type { Booking } from '@/types/booking';
import { toast } from 'sonner';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get<ApiResponse<Booking>>(`/api/v1/bookings/${id}`)
      .then(({ data }) => setBooking(data.data))
      .catch(() => toast.error('Failed to load booking details'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(action: string, label: string) {
    setActionLoading(true);
    try {
      await api.post(`/api/v1/bookings/${id}/${action}`);
      toast.success(`${label} successful`);
      // Refresh booking
      const { data } = await api.get<ApiResponse<Booking>>(`/api/v1/bookings/${id}`);
      setBooking(data.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || `Failed to ${label.toLowerCase()}`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <p className="text-muted-foreground">Booking not found</p>
        <Button className="mt-4" onClick={() => router.push('/jobs')}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const statusTimeline = [
    { status: 'requested', label: 'Requested', time: booking.created_at },
    { status: 'accepted', label: 'Accepted', time: null },
    { status: 'picked_up', label: 'Picked Up', time: booking.picked_up_at },
    { status: 'in_transit', label: 'In Transit', time: null },
    { status: 'delivered', label: 'Delivered', time: booking.delivered_at },
    { status: 'completed', label: 'Completed', time: null },
  ];

  const statusOrder = ['requested', 'accepted', 'picked_up', 'in_transit', 'delivered', 'completed'];
  const currentIdx = statusOrder.indexOf(booking.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/jobs')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Job #{booking.booking_number}</h1>
          <Badge className={getStatusColor(booking.status)} variant="secondary">
            {getStatusLabel(booking.status)}
          </Badge>
        </div>
      </div>

      {/* Pet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pet Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{booking.pet_spec?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{booking.pet_spec?.pet_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Breed</p>
              <p className="font-medium">{booking.pet_spec?.breed || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="font-medium">{booking.pet_spec?.weight_kg || 0} kg</p>
            </div>
          </div>
          {booking.pet_spec?.special_needs && (
            <div>
              <p className="text-sm text-muted-foreground">Special Needs</p>
              <p className="font-medium">{booking.pet_spec.special_needs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="h-full w-0.5 bg-gray-200" />
            </div>
            <div>
              <p className="text-xs font-medium text-green-600">PICKUP</p>
              <p className="font-medium">{booking.pickup_address?.line1}</p>
              <p className="text-sm text-muted-foreground">
                {booking.pickup_address?.city}, {booking.pickup_address?.state}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-red-600">DROPOFF</p>
              <p className="font-medium">{booking.dropoff_address?.line1}</p>
              <p className="text-sm text-muted-foreground">
                {booking.dropoff_address?.city}, {booking.dropoff_address?.state}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price and Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Price</span>
            <span className="text-lg font-bold text-blue-600">
              {formatMYR(booking.estimated_price_cents)}
            </span>
          </div>
          {booking.final_price_cents && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Price</span>
              <span className="text-lg font-bold text-green-600">
                {formatMYR(booking.final_price_cents)}
              </span>
            </div>
          )}
          {booking.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{booking.notes}</p>
            </div>
          )}

          <Separator />

          {/* Status Timeline */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Status Timeline</p>
            {statusTimeline.map((item, idx) => {
              const isCompleted = statusOrder.indexOf(item.status) <= currentIdx;
              const isCurrent = item.status === booking.status;
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${isCurrent ? 'font-bold text-blue-600' : isCompleted ? 'font-medium' : 'text-muted-foreground'}`}>
                      {item.label}
                    </p>
                  </div>
                  {item.time && (
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(item.time)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {booking.status === 'requested' && (
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleAction('accept', 'Accept Job')}
            disabled={actionLoading}
          >
            <User className="mr-2 h-4 w-4" />
            {actionLoading ? 'Accepting...' : 'Accept Job'}
          </Button>
        )}

        {booking.status === 'accepted' && (
          <>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('pickup', 'Mark Pickup')}
              disabled={actionLoading}
            >
              <Package className="mr-2 h-4 w-4" />
              {actionLoading ? 'Processing...' : 'Mark Pickup'}
            </Button>
            <Button className="flex-1" variant="outline" asChild>
              <Link href={`/jobs/${id}/active`}>
                <Navigation className="mr-2 h-4 w-4" />
                Track Delivery
              </Link>
            </Button>
          </>
        )}

        {(booking.status === 'picked_up' || booking.status === 'in_transit') && (
          <>
            <Button className="flex-1" variant="outline" asChild>
              <Link href={`/jobs/${id}/active`}>
                <Navigation className="mr-2 h-4 w-4" />
                Track Delivery
              </Link>
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('deliver', 'Mark Delivered')}
              disabled={actionLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {actionLoading ? 'Processing...' : 'Mark Delivered'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
