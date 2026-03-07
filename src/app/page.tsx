
"use client"

import React, { useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp } from 'firebase/database';
import { Activity, Sparkles, HeartPulse, Crown, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdBanner } from '@/components/ad-banner';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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

  const isAdmin = userData?.name === 'admin';

  useEffect(() => {
    if (userData && user && !isAdmin) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const now = Date.now();

      if (userData.isPremium === 1 && userData.premiumUntil && now > userData.premiumUntil) {
        update(ref(database, `users/${user.uid}`), {
          isPremium: 0,
          premiumUntil: null
        });
        toast({ title: "انتهى اشتراك بريميوم", description: "شكراً لثقتك، يمكنك التجديد عبر الإعدادات! 🐱" });
      }

      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
      const lastActive = userData.lastActiveDate;
      const lastPenaltyDate = userData.lastStreakPenaltyDate;

      if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr && lastPenaltyDate !== todayStr) {
        const penalty = 150;
        const currentPoints = userData.points || 0;
        update(ref(database, `users/${user.uid}`), {
          points: Math.max(0, currentPoints - penalty),
          streak: 0,
          lastStreakPenaltyDate: todayStr,
          lastActiveDate: todayStr
        });

        if (currentPoints > 0) {
          push(ref(database, `users/${user.uid}/notifications`), {
            type: 'system',
            title: 'تنبيه كسر الحماسة 🛑',
            message: `لقد تغيبت عن التطبيق! تم خصم ${penalty} نقطة.`,
            isRead: false,
            timestamp: serverTimestamp()
          });
          toast({ variant: "destructive", title: "كسر الحماسة!", description: `تم خصم ${penalty} نقطة لغيابك.` });
        }
      }
    }
  }, [userData, user, database, isAdmin]);

  const progressPercent = useMemo(() => {
    const totalStages = 120;
    let completedCount = 0;
    if (userData?.trackProgress) {
      Object.values(userData.trackProgress).forEach((track: any) => {
        completedCount += (track.completedStages?.length || 0);
      });
    }
    return Math.round((completedCount / totalStages) * 100);
  }, [userData]);

  const bmiInfo = useMemo(() => {
    if (!userData?.weight || !userData?.height) return { value: "--", status: "غير محدد", color: "text-muted-foreground" };
    const bmi = userData.weight / ((userData.height / 100) * (userData.height / 100));
    const val = bmi.toFixed(1);
    if (bmi < 18.5) return { value: val, status: "نحافة", color: "text-blue-500" };
    if (bmi < 25) return { value: val, status: "مثالي", color: "text-green-500" };
    if (bmi < 30) return { value: val, status: "زيادة", color: "text-orange-500" };
    return { value: val, status: "سمنة", color: "text-red-500" };
  }, [userData]);

  if (isUserLoading || (user && isDataLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <p className="text-primary font-black text-xl animate-pulse">كاري ينتظرك بشوق...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-3 mx-2">
            <Link href="/streak" className="block">
              <Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                  <Activity size={20} />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">الإنجاز الكلي</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-primary">{progressPercent}%</span>
                    <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/profile" className="block">
              <Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                  <HeartPulse size={20} />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">مؤشر الكتلة</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-lg font-black", bmiInfo.color)}>{bmiInfo.value}</span>
                    <span className={cn("text-[8px] font-black uppercase opacity-60", bmiInfo.color)}>{bmiInfo.status}</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {isAdmin ? (
          <section className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10 mx-2 shadow-inner space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg shrink-0">🛡️</div>
              <div className="text-right">
                <h1 className="text-xl font-black text-primary">أهلاً يا مدير كاري!</h1>
                <p className="text-[10px] font-bold text-muted-foreground leading-tight">أنت الآن في وضع الرقابة والتحكم الكامل بالنظام.</p>
              </div>
            </div>
            <Link href="/admin" onClick={() => playSound('click')} className="block">
              <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-sm font-black gap-3 shadow-lg">
                لوحة الإدارة العليا <ArrowRight className="rotate-180" size={16} />
              </Button>
            </Link>
          </section>
        ) : (
          <>
            <section className="bg-primary/5 rounded-[2rem] p-5 border border-primary/10 mx-2 shadow-inner">
              <Mascot />
            </section>

            <section className="space-y-4 mx-2">
              <h2 className="text-xl font-black text-primary px-2">مسارات النمو</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TrackCard type="Fitness" currentStage={userData?.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
                <TrackCard type="Nutrition" currentStage={userData?.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
                <TrackCard type="Behavior" currentStage={userData?.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
                <TrackCard type="Study" currentStage={userData?.trackProgress?.Study?.currentStage || 1} totalStages={30} />
              </div>
              
              <Link href="/track/master" onClick={() => playSound('click')} className="block mt-4">
                <Card className="p-5 rounded-[2rem] shadow-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform border-dashed">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary leading-tight">المسار العام</p>
                    <p className="text-[10px] font-bold text-primary/60">تحديات الأساطير والتدريب الحر 🔥</p>
                  </div>
                </Card>
              </Link>
            </>
          )}

        <div className="mx-2">
          <AdBanner label="إعلان ممول" />
        </div>
      </div>
    </div>
  );
}
