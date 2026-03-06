
"use client"

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // إذا كان المستخدم مسجلاً ومفعلاً بريده، يتم توجيهه للرئيسية
    if (!isUserLoading && user && user.emailVerified) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playSound('click');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast({ 
          variant: "destructive", 
          title: "لم يتم تفعيل البريد", 
          description: "يرجى تفعيل حسابك من خلال الرابط المرسل لبريدك الإلكتروني (تفقد مجلد Spam)." 
        });
        // لا نسمح بالبقاء مسجلاً إذا لم يفعل البريد لضمان الصرامة
        await signOut(auth);
      } else {
        playSound('login');
        toast({ title: "أهلاً بعودتك!", description: "جاري تحميل بياناتك..." });
        router.push('/');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "تأكد من البريد الإلكتروني وكلمة المرور." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال البريد وكلمة المرور أولاً لطلب رابط جديد." });
      return;
    }
    setLoading(true);
    try {
      // نحتاج لتسجيل الدخول مؤقتاً لإرسال الرابط
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      toast({ title: "تم إعادة الإرسال", description: "تفقد بريدك الإلكتروني الآن (بما في ذلك مجلد Spam)." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: "تأكد من بياناتك قبل إعادة طلب الرابط." });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
           <div className="text-8xl animate-bounce">🐱</div>
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-primary font-black text-xl animate-pulse">كاري يرحب بك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-6" dir="rtl">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card border border-border">
        <CardHeader className="bg-primary text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 p-2 shadow-2xl relative z-10">
            <Image src="/logo.png" alt="Careingo Logo" width={80} height={80} className="object-contain" />
          </div>
          <CardTitle className="text-4xl font-black relative z-10">كارينجو</CardTitle>
          <p className="opacity-80 font-bold mt-2 text-lg relative z-10">رفيقك اليومي للنمو</p>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleLogin} className="space-y-6 text-right">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input 
                type="email" 
                placeholder="example@mail.com" 
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-right"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input 
                type="password" 
                className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-right"
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

          <button onClick={handleResendVerification} className="w-full text-xs font-black text-primary/60 hover:text-primary transition-colors underline">
            لم يصلك رابط التفعيل؟ أعد الإرسال (يتطلب البريد وكلمة المرور)
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground font-bold">أو</span></div>
          </div>

          <Link href="/register">
            <Button variant="outline" onClick={() => playSound('click')} className="w-full h-14 rounded-2xl border-2 border-primary text-primary font-black hover:bg-primary/5">
              إنشاء حساب جديد
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex items-center gap-2 text-primary/40 font-black text-sm">
         Powered by Artiatech Studio 2026
      </div>
    </div>
  );
}
