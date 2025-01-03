'use client';

import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Navigation } from './navigation';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <div className="block md:hidden">
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <Navigation />
      </Sheet>
    </div>
  );
}
