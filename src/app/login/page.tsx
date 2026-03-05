
"use client"

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Ghost } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      initiateEmailSignIn(auth, email, password);
      toast({ title: "Welcome back!", description: "Logging you in..." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
  };

  const handleGuestLogin = () => {
    initiateAnonymousSignIn(auth);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-primary text-white p-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <CardTitle className="text-3xl font-black">Careingo Login</CardTitle>
          <p className="opacity-80 font-medium mt-2">Continue your growth journey</p>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="alex@example.com" 
                className="h-12 rounded-xl bg-secondary border-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 rounded-xl bg-secondary border-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20">
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl border-primary text-primary font-bold">
                <UserPlus size={18} className="mr-2" /> Register
              </Button>
            </Link>
            <Button variant="outline" onClick={handleGuestLogin} className="w-full h-12 rounded-xl border-accent text-accent font-bold">
              <Ghost size={18} className="mr-2" /> Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
