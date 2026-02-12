'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Package, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/api';
import { toast } from 'sonner';

const VEHICLE_TYPES = ['car', 'van', 'motorcycle'];
const CRATE_SIZES = ['small', 'medium', 'large'];
const PET_TYPES = ['cat', 'dog', 'rabbit', 'bird', 'hamster', 'reptile', 'other'];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Vehicle Details
  const [vehicle, setVehicle] = useState({
    vehicle_type: 'car',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_year: '',
    air_conditioned: true,
  });

  // Step 2: Crate Specs
  const [crate, setCrate] = useState({
    size: 'medium',
    pet_types: ['cat', 'dog'] as string[],
    max_weight_kg: 15,
    width_cm: 60,
    height_cm: 50,
    depth_cm: 80,
    ventilated: true,
    temperature_controlled: false,
  });

  function togglePetType(petType: string) {
    setCrate((prev) => ({
      ...prev,
      pet_types: prev.pet_types.includes(petType)
        ? prev.pet_types.filter((p) => p !== petType)
        : [...prev.pet_types, petType],
    }));
  }

  async function handleStep1() {
    if (!vehicle.vehicle_plate || !vehicle.vehicle_model) {
      setError('Please fill in all vehicle details');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/runners', {
        vehicle_type: vehicle.vehicle_type,
        vehicle_plate: vehicle.vehicle_plate,
        vehicle_model: vehicle.vehicle_model,
        vehicle_year: vehicle.vehicle_year ? parseInt(vehicle.vehicle_year) : undefined,
        air_conditioned: vehicle.air_conditioned,
      });
      toast.success('Vehicle registered successfully');
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    if (crate.pet_types.length === 0) {
      setError('Please select at least one pet type');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/runners/me/crates', {
        size: crate.size,
        pet_types: crate.pet_types,
        max_weight_kg: crate.max_weight_kg,
        width_cm: crate.width_cm,
        height_cm: crate.height_cm,
        depth_cm: crate.depth_cm,
        ventilated: crate.ventilated,
        temperature_controlled: crate.temperature_controlled,
      });
      toast.success('Setup complete! You can now accept jobs.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to register crate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Runner Setup</h1>
        <p className="text-muted-foreground">Complete your profile to start accepting jobs</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
          step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          {step > 1 ? <Check className="h-5 w-5" /> : '1'}
        </div>
        <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
          step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          2
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Vehicle Details</CardTitle>
                <CardDescription>Tell us about your vehicle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <div className="flex gap-2">
                {VEHICLE_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={vehicle.vehicle_type === type ? 'default' : 'outline'}
                    size="sm"
                    className={vehicle.vehicle_type === type ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => setVehicle({ ...vehicle, vehicle_type: type })}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">License Plate</Label>
              <Input
                id="plate"
                placeholder="e.g. WKL 1234"
                value={vehicle.vehicle_plate}
                onChange={(e) => setVehicle({ ...vehicle, vehicle_plate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Vehicle Model</Label>
              <Input
                id="model"
                placeholder="e.g. Toyota Vios"
                value={vehicle.vehicle_model}
                onChange={(e) => setVehicle({ ...vehicle, vehicle_model: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Vehicle Year (optional)</Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g. 2022"
                value={vehicle.vehicle_year}
                onChange={(e) => setVehicle({ ...vehicle, vehicle_year: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ac">Air Conditioned</Label>
              <Switch
                id="ac"
                checked={vehicle.air_conditioned}
                onCheckedChange={(checked) => setVehicle({ ...vehicle, air_conditioned: checked })}
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleStep1}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Next: Crate Specs'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Crate Specifications</CardTitle>
                <CardDescription>Describe your pet transport crate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Crate Size</Label>
              <div className="flex gap-2">
                {CRATE_SIZES.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={crate.size === size ? 'default' : 'outline'}
                    size="sm"
                    className={crate.size === size ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => setCrate({ ...crate, size })}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accepted Pet Types</Label>
              <div className="flex flex-wrap gap-2">
                {PET_TYPES.map((petType) => (
                  <Button
                    key={petType}
                    type="button"
                    variant={crate.pet_types.includes(petType) ? 'default' : 'outline'}
                    size="sm"
                    className={crate.pet_types.includes(petType) ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => togglePetType(petType)}
                  >
                    {petType.charAt(0).toUpperCase() + petType.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWeight">Max Weight (kg)</Label>
              <Input
                id="maxWeight"
                type="number"
                value={crate.max_weight_kg}
                onChange={(e) => setCrate({ ...crate, max_weight_kg: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={crate.width_cm}
                  onChange={(e) => setCrate({ ...crate, width_cm: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={crate.height_cm}
                  onChange={(e) => setCrate({ ...crate, height_cm: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depth">Depth (cm)</Label>
                <Input
                  id="depth"
                  type="number"
                  value={crate.depth_cm}
                  onChange={(e) => setCrate({ ...crate, depth_cm: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ventilated">Ventilated</Label>
              <Switch
                id="ventilated"
                checked={crate.ventilated}
                onCheckedChange={(checked) => setCrate({ ...crate, ventilated: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tempControl">Temperature Controlled</Label>
              <Switch
                id="tempControl"
                checked={crate.temperature_controlled}
                onCheckedChange={(checked) => setCrate({ ...crate, temperature_controlled: checked })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleStep2}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
