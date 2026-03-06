
"use client"

import React, { useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Flame, Star, Activity, HeartPulse, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // نظام التذكير الداخلي (In-App Reminder)
  useEffect(() => {
    if (userData) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const lastActiveDate = userData.lastActiveDate;
      
      // إذا كان الوقت بعد السابعة مساءً ولم يكمل مهمة اليوم
      const hour = new Date().getHours();
      if (lastActiveDate !== todayStr && hour >= 19) {
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "كاري يناديك! 🐱",
            description: "لقد اقترب اليوم من النهاية ولم تنجز أي مهمة. أسرع للحفاظ على حماستك!",
          });
          playSound('click');
        }, 3000);
      }
    }
  }, [userData]);

  const bmiInfo = useMemo(() => {
    if (!userData || !userData.weight || !userData.height) return null;
    const heightInMeters = userData.height / 100;
    const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    const val = parseFloat(bmi);
    
    let status = "مثالي";
    let color = "text-green-500";
    if (val < 18.5) { status = "نحافة"; color = "text-blue-500"; }
    else if (val < 25) { status = "مثالي"; color = "text-green-500"; }
    else if (val < 30) { status = "زيادة"; color = "text-orange-500"; }
    else { status = "سمنة"; color = "text-red-500"; }
    
    return { value: bmi, status, color };
  }, [userData]);

  if (isUserLoading || (user && isDataLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8">
        <div className="text-9xl animate-bounce">🐱</div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
          <div className="text-primary font-black text-2xl animate-pulse">كاري ينتظرك بشوق...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // التحقق من تفعيل البريد
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center" dir="rtl">
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
            <AlertTriangle size={56} />
          </div>
          <h1 className="text-3xl font-black text-primary italic">بريدك غير مفعل!</h1>
          <p className="text-muted-foreground font-bold text-lg">يرجى الضغط على الرابط المرسل لبريدك الإلكتروني لتتمكن من استخدام التطبيق.</p>
          <Button onClick={() => router.replace('/login')} className="w-full h-14 rounded-2xl bg-accent text-xl font-black shadow-lg">العودة لتسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  if (!isDataLoading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center" dir="rtl">
        <div className="max-w-md space-y-6">
          <div className="text-8xl animate-bounce">🐱</div>
          <h1 className="text-3xl font-black text-primary">أهلاً بك! يبدو أنك جديد هنا</h1>
          <p className="text-muted-foreground font-bold text-lg">تحتاج لإكمال ملفك الشخصي لنبدأ رحلة النمو معاً.</p>
          <Link href="/register" onClick={() => playSound('click')}>
            <Button className="w-full h-14 rounded-2xl bg-accent text-xl font-black shadow-lg">إكمال البيانات 🐱</Button>
          </Link>
        </div>
      </div>
    );
  }

  const profile = userData;
  const totalStages = 120;
  const completedCount = Object.values(profile.trackProgress || {}).reduce((acc: number, curr: any) => acc + (curr.completedStages?.length || 0), 0);
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6">
        
        <header className="flex items-center justify-between bg-card p-4 rounded-[2rem] shadow-lg border border-border sticky top-4 z-30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl shrink-0">
              {profile.avatar || "🐱"}
            </div>
            <div className="flex flex-col text-right">
              <p className="text-[10px] font-black text-muted-foreground leading-none mb-0.5">أهلاً بك</p>
              <p className="text-sm font-black text-primary leading-none truncate max-w-[120px] sm:max-w-none">{profile.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/streak" onClick={() => playSound('click')}>
              <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 transition-transform active:scale-95">
                <Flame size={16} className="text-orange-600" fill="currentColor" />
                <span className="text-sm font-black text-orange-600">{profile.streak || 0}</span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
              <Star size={16} className="text-yellow-600" fill="currentColor" />
              <span className="text-sm font-black text-yellow-600">{(profile.points || 0).toLocaleString()}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 shrink-0">
              <HeartPulse size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-muted-foreground uppercase">مؤشر الجسم</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-primary">{bmiInfo?.value || '--'}</span>
                <span className={cn("text-[9px] font-black px-1.5 rounded-md bg-secondary", bmiInfo?.color)}>
                  {bmiInfo?.status || '--'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
              <Activity size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black text-muted-foreground uppercase">الإنجاز الكلي</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-primary">{progressPercent}%</span>
                <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <section className="bg-primary/5 rounded-[2rem] p-4 border border-primary/10">
          <Mascot />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-primary px-2">اختر مسارك</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TrackCard type="Fitness" currentStage={profile.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
            <TrackCard type="Nutrition" currentStage={profile.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
            <TrackCard type="Behavior" currentStage={profile.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
            <TrackCard type="Study" currentStage={profile.trackProgress?.Study?.currentStage || 1} totalStages={30} />
          </div>
        </section>

      </div>
    </div>
  );
}
