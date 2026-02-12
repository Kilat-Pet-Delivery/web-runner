'use client';

import Link from 'next/link';
import { Bell, Menu, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MobileNav } from './mobile-nav';
import { StatusToggle } from '@/components/runner/status-toggle';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <MobileNav />
          </SheetContent>
        </Sheet>
        <Truck className="h-5 w-5 text-blue-600" />
        <span className="text-lg font-bold text-blue-600">Kilat Runner</span>
      </div>

      <div className="hidden md:flex md:items-center md:gap-3">
        <StatusToggle />
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <StatusToggle />
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
