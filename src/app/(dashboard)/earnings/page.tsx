'use client';

import { useEffect, useState, useMemo } from 'react';
import { Wallet, TrendingUp, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { formatMYR, formatDate } from '@/lib/format';
import type { PaginatedResponse } from '@/types/api';
import type { Booking } from '@/types/booking';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyData {
  month: string;
  earnings: number;
  trips: number;
}

export default function EarningsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaginatedResponse<Booking>>('/api/v1/bookings?page=1&limit=50')
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed' || b.status === 'delivered'),
    [bookings]
  );

  const totalEarnings = useMemo(
    () => completedBookings.reduce((sum, b) => sum + (b.final_price_cents || b.estimated_price_cents), 0),
    [completedBookings]
  );

  const monthlyData = useMemo(() => {
    const months: Record<string, MonthlyData> = {};
    completedBookings.forEach((b) => {
      const date = new Date(b.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
      if (!months[key]) {
        months[key] = { month: label, earnings: 0, trips: 0 };
      }
      months[key].earnings += (b.final_price_cents || b.estimated_price_cents) / 100;
      months[key].trips += 1;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [completedBookings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your delivery earnings and payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatMYR(totalEarnings)}</p>
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
                <p className="text-sm text-muted-foreground">Completed Trips</p>
                <p className="text-2xl font-bold">{completedBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Per Trip</p>
                <p className="text-2xl font-bold">
                  {completedBookings.length > 0
                    ? formatMYR(Math.round(totalEarnings / completedBookings.length))
                    : 'RM 0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No earnings data yet. Complete deliveries to see your earnings chart.</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => `RM${value}`} />
                  <Tooltip
                    formatter={(value) => [`RM ${Number(value).toFixed(2)}`, 'Earnings']}
                  />
                  <Bar dataKey="earnings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {completedBookings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No completed deliveries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">#{booking.booking_number}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.pet_spec?.name} ({booking.pet_spec?.pet_type}) -{' '}
                      {booking.pickup_address?.city} → {booking.dropoff_address?.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(booking.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatMYR(booking.final_price_cents || booking.estimated_price_cents)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
