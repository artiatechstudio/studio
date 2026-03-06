
"use client"

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const playLoginSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.play().catch(() => {});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      playLoginSound();
      toast({ title: "أهلاً بعودتك!", description: "جاري تحميل بياناتك..." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "تأكد من البريد الإلكتروني وكلمة المرور." });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-6" dir="rtl">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card border border-border">
        <CardHeader className="bg-primary text-white p-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-5xl">🐱</div>
          <CardTitle className="text-4xl font-black">كارينجو</CardTitle>
          <p className="opacity-80 font-bold mt-2 text-lg">رفيقك اليومي للنمو</p>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleLogin} className="space-y-6 text-right">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input 
                type="email" 
                placeholder="example@mail.com" 
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input 
                type="password" 
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-lg shadow-primary/20"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground font-bold">أو</span></div>
          </div>

          <Link href="/register">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-primary text-primary font-black hover:bg-primary/5">
              إنشاء حساب جديد
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex items-center gap-2 text-primary/40 font-black text-sm">
         Powered by Artiatech Studio
      </div>
    </div>
  );
}
