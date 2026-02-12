'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth(requireAuth = true) {
  const { user, isAuthenticated, isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  return { user, isAuthenticated, isLoading };
}
