"use client"

import React, { useState, useEffect } from 'react';
import { useAuth, useUser, useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { ref, get, set, child } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const { database } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user && user.emailVerified) {
      if (typeof window !== 'undefined' && (window as any).CareingoApp) {
        try { (window as any).CareingoApp.postMessage(user.uid); } catch (e) {}
      }
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playSound('click');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      if (!loggedInUser.emailVerified) {
        toast({ variant: "destructive", title: "لم يتم تفعيل البريد", description: "يرجى تفعيل حسابك من خلال الرابط المرسل لبريدك الإلكتروني." });
        await signOut(auth);
      } else {
        playSound('login');
        router.push('/');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الدخول", description: "تأكد من البريد الإلكتروني وكلمة المرور." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    playSound('click');
    try {
      const result = await initiateGoogleSignIn(auth);
      const gUser = result.user;

      // التحقق هل المستخدم موجود في قاعدة البيانات؟
      const userRef = ref(database, `users/${gUser.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // إنشاء ملف شخصي جديد لمستخدم جوجل
        const dbRef = ref(database);
        const usersSnapshot = await get(child(dbRef, 'users'));
        const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
        const allUsers = Object.values(usersData);
        
        const normalizedName = (gUser.displayName || 'Hero').trim().toLowerCase();
        const isAdminUser = normalizedName === 'admin';
        
        let membershipRank = 0;
        if (!isAdminUser) {
          const ranks = allUsers.map((u: any) => u.registrationRank).filter(r => r !== undefined);
          const maxRank = ranks.length > 0 ? Math.max(...ranks) : 0;
          membershipRank = maxRank + 1;
        }

        await set(userRef, {
          id: gUser.uid,
          name: gUser.displayName || 'بطل كاري',
          email: gUser.email,
          age: 0, // يكملها لاحقاً في الإعدادات
          gender: 'male',
          height: 0,
          weight: 0,
          avatar: gUser.photoURL || "🐱",
          bio: isAdminUser ? "مدير النظام الرسمي 🛡️" : "عضو جديد طموح 🌱",
          points: 0,
          streak: 0,
          isPremium: isAdminUser ? 1 : 0,
          registrationRank: membershipRank,
          registrationDate: new Date().toISOString(),
          badges: isAdminUser ? ['المؤسس 🛡️', 'مدير النظام 👑'] : ['عضو جديد 🐱'],
          trackProgress: {
            Fitness: { currentStage: 1, completedStages: [] },
            Nutrition: { currentStage: 1, completedStages: [] },
            Behavior: { currentStage: 1, completedStages: [] },
            Study: { currentStage: 1, completedStages: [] },
          }
        });
        toast({ title: "مرحباً بك!", description: "تم إنشاء حسابك بنجاح عبر جوجل. أكمل بياناتك في الإعدادات." });
      }

      playSound('login');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ في تسجيل جوجل", description: "فشلت العملية أو تم إلغاؤها." });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال البيانات لطلب رابط تفعيل جديد." });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      toast({ title: "تم إعادة الإرسال", description: "تفقد بريدك الإلكتروني الآن." });
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
           <div className="relative w-24 h-24 animate-bounce">
             <Image src="/logo.png" alt="Loading" fill className="object-contain" />
           </div>
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
          <CardTitle className="text-4xl font-black relative z-10">Careingo</CardTitle>
          <p className="opacity-80 font-bold mt-2 text-lg relative z-10">تواصل، تحدى، تطور</p>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" placeholder="example@mail.com" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>كلمة المرور</Label>
                <Link href="/forgot-password" intrinsic="true" className="text-[10px] font-black text-primary hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <Input type="password" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-lg">
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground font-bold">أو</span></div>
          </div>

          <Button 
            onClick={handleGoogleLogin} 
            disabled={googleLoading}
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-white hover:bg-primary/5 flex items-center justify-center gap-3 font-black text-lg transition-all"
          >
            {googleLoading ? <Loader2 className="animate-spin text-primary" /> : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.83-5.166l-6.223-5.385C29.431,35.158,26.85,36,24,36c-5.22,0-9.605-3.328-11.41-8.005l-6.395,4.92C9.566,39.382,16.241,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.356C36.945,39.184,44,32,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                الدخول عبر جوجل
              </>
            )}
          </Button>

          <Link href="/register" onClick={() => playSound('click')}>
            <Button variant="ghost" className="w-full h-12 rounded-2xl text-primary font-black hover:bg-primary/5">إنشاء حساب جديد بالبريد</Button>
          </Link>
          
          <button onClick={handleResendVerification} className="w-full text-[10px] font-black text-primary/40 hover:text-primary transition-colors underline">لم يصلك رابط التفعيل؟ أعد الإرسال</button>
        </CardContent>
      </Card>
      <div className="mt-8 flex items-center gap-2 text-primary/40 font-black text-sm">Powered by Artiatech Studio 2026</div>
    </div>
  );
}
