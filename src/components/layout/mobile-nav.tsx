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
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="fixed top-4 left-4 z-40 w-12 h-12 rounded-lg border-gray-200/20 hover:bg-gray-100/10 hover:border-gray-200/30"
            aria-label="Open Menu"
          >
            <Menu className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="p-0 w-72 bg-gray-900 border-r-gray-800"
          onInteractOutside={() => setIsOpen(false)}
          onEscapeKeyDown={() => setIsOpen(false)}
        >
          <Navigation />
        </SheetContent>
      </Sheet>
    </div>
  );
}
