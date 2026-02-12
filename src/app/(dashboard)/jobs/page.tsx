'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { formatMYR, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/format';
import type { PaginatedResponse } from '@/types/api';
import type { Booking } from '@/types/booking';

export default function JobsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaginatedResponse<Booking>>('/api/v1/bookings?page=1&limit=20')
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const availableJobs = bookings.filter((b) => b.status === 'requested');
  const myJobs = bookings.filter((b) =>
    ['accepted', 'picked_up', 'in_transit', 'delivered', 'completed'].includes(b.status)
  );

  function JobCard({ booking }: { booking: Booking }) {
    return (
      <Link
        href={`/jobs/${booking.id}`}
        className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-muted-foreground">
              #{booking.booking_number}
            </p>
            <Badge className={getStatusColor(booking.status)} variant="secondary">
              {getStatusLabel(booking.status)}
            </Badge>
          </div>
          <p className="mt-1 font-semibold">
            {booking.pet_spec?.name || 'Pet'}{' '}
            <span className="font-normal text-muted-foreground">
              ({booking.pet_spec?.pet_type})
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.pickup_address?.city} → {booking.dropoff_address?.city}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-blue-600">
            {formatMYR(booking.estimated_price_cents)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(booking.created_at)}
          </p>
          <ArrowRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  function EmptyState({ message }: { message: string }) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">Browse and manage delivery requests</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">
            Available Jobs ({availableJobs.length})
          </TabsTrigger>
          <TabsTrigger value="my-jobs">
            My Jobs ({myJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : availableJobs.length === 0 ? (
                <EmptyState message="No available jobs right now. Check back later!" />
              ) : (
                <div className="space-y-3">
                  {availableJobs.map((booking) => (
                    <JobCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-jobs">
          <Card>
            <CardHeader>
              <CardTitle>My Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : myJobs.length === 0 ? (
                <EmptyState message="You haven't accepted any jobs yet." />
              ) : (
                <div className="space-y-3">
                  {myJobs.map((booking) => (
                    <JobCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
