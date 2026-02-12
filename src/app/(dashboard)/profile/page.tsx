'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name, phone: user.phone || '' });
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put<ApiResponse<User>>('/api/v1/auth/profile', {
        full_name: form.full_name,
        phone: form.phone || undefined,
      });
      toast.success('Profile updated successfully');
      setEditing(false);
      // Update local store
      useAuthStore.getState().hydrate();
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <CardTitle className="mt-4">{user?.full_name}</CardTitle>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground capitalize">Role: {user?.role}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+60123456789"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{user?.phone || '\u2014'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-medium">{user?.is_verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <Button className="w-full" variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
