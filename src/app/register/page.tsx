
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
    if (!name.trim()) return;
    
    try {
      // تخزين الاسم مؤقتاً ليتم استخدامه في الصفحة الرئيسية عند إنشاء البروفايل
      localStorage.setItem('registered_name', name);
      initiateEmailSignUp(auth, email, password);
      toast({ title: "تم إنشاء الحساب!", description: "جاري توجيهك للوحة التحكم..." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التسجيل", description: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card">
        <CardHeader className="bg-accent text-white p-10 text-center relative">
          <Link href="/login" className="absolute left-6 top-10 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <CardTitle className="text-3xl font-black">انضم إلى كارينجو</CardTitle>
          <p className="opacity-80 font-medium mt-2">ابدأ تحدي الـ 30 يوماً اليوم</p>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4 text-right">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input 
                id="name" 
                placeholder="أحمد علي" 
                className="h-12 rounded-xl bg-secondary border-none text-right"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="alex@example.com" 
                className="h-12 rounded-xl bg-secondary border-none text-right"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 rounded-xl bg-secondary border-none text-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-lg font-bold shadow-lg shadow-accent/20">
              إنشاء حساب جديد
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-black hover:underline">سجل دخولك</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
