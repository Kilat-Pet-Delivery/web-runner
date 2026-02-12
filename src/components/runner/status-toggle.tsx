'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useRunnerStore } from '@/stores/runner-store';
import { toast } from 'sonner';

export function StatusToggle() {
  const { isOnline, setOnline, setOffline } = useRunnerStore();
  const [toggling, setToggling] = useState(false);

  async function handleToggle(checked: boolean) {
    setToggling(true);
    try {
      if (checked) {
        // Get current position before going online
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          }
        );
        await setOnline(position.coords.latitude, position.coords.longitude);
        toast.success('You are now online and visible to customers');
      } else {
        await setOffline();
        toast.success('You are now offline');
      }
    } catch (error) {
      console.error('Toggle failed:', error);
      if (checked) {
        toast.error('Failed to go online. Please enable location access.');
      } else {
        toast.error('Failed to go offline. Please try again.');
      }
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isOnline}
        onCheckedChange={handleToggle}
        disabled={toggling}
      />
      {isOnline ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Online
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
          Offline
        </Badge>
      )}
      {toggling && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      )}
    </div>
  );
}
