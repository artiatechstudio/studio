
"use client"

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      initiateEmailSignUp(auth, email, password);
      toast({ title: "Account created!", description: "Taking you to the dashboard..." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-accent text-white p-10 text-center relative">
          <Link href="/login" className="absolute left-6 top-10 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <CardTitle className="text-3xl font-black">Join Careingo</CardTitle>
          <p className="opacity-80 font-medium mt-2">Start your 30-day challenge today</p>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Alex Rivera" 
                className="h-12 rounded-xl bg-secondary border-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
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
            <Button type="submit" className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-lg font-bold shadow-lg shadow-accent/20">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Already have an account? <Link href="/login" className="text-primary font-black hover:underline">Log In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
