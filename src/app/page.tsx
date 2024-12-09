'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { checkPassword, setAuthStatus } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePasswordSubmit = async () => {
    setIsLoading(true);
    if (checkPassword(password)) {
      setAuthStatus(true);
      router.push('/tasks');
    } else {
      toast({
        title: 'Error',
        description: 'Invalid password',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleGuestAccess = () => {
    setIsLoading(true);
    setAuthStatus(true, true);
    router.push('/tasks');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-[800px] text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-64 h-64">
              <Image
                src="/logo.svg"
                alt="Fort Lauderdale 2025 Logo"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            
            
          </div>

          <Card className="w-full max-w-[400px] mx-auto">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                Enter password to continue or proceed as guest for read-only access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handlePasswordSubmit()}
                disabled={isLoading}
              />
              <div className="space-y-2">
                <Button 
                  onClick={handlePasswordSubmit} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Continue with Password'}
                </Button>
                <Button 
                  onClick={handleGuestAccess} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Continue as Guest'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
