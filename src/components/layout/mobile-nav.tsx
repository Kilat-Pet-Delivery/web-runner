'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wallet,
  Bell,
  User,
  LogOut,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Package },
  { href: '/earnings', label: 'Earnings', icon: Wallet },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    try { await api.post('/api/v1/auth/logout'); } catch { /* ignore */ }
    logout();
    router.push('/login');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Truck className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-blue-600">Kilat Runner</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <p className="truncate text-sm font-medium">{user?.full_name}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-600" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
