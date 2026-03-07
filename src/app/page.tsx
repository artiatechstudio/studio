
"use client"

import React, { useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp } from 'firebase/database';
import { Activity, Sparkles, HeartPulse, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdBanner } from '@/components/ad-banner';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
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

  // منطق حارس الحماسة - خصم 150 نقطة عند التغيب
  useEffect(() => {
    if (userData && user) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
      
      const lastActive = userData.lastActiveDate;
      const lastPenaltyDate = userData.lastStreakPenaltyDate;

      // إذا لم يكن المستخدم نشطاً اليوم ولا أمس، وكان لديه سجل سابق
      if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr && lastPenaltyDate !== todayStr) {
        const penalty = 150;
        const currentPoints = userData.points || 0;
        const newPoints = Math.max(0, currentPoints - penalty);

        update(ref(database, `users/${user.uid}`), {
          points: newPoints,
          streak: 0,
          lastStreakPenaltyDate: todayStr,
          lastActiveDate: todayStr // تحديث التاريخ لمنع تكرار الخصم في نفس اليوم
        });

        if (currentPoints > 0) {
          push(ref(database, `users/${user.uid}/notifications`), {
            type: 'system',
            title: 'تنبيه كسر الحماسة 🛑',
            message: `لقد تغيبت عن التطبيق! تم تصفير حماستك وخصم ${penalty} نقطة من رصيدك.`,
            isRead: false,
            timestamp: serverTimestamp()
          });
          toast({ 
            variant: "destructive", 
            title: "كسر الحماسة!", 
            description: `تم خصم ${penalty} نقطة لغيابك بالأمس.` 
          });
        }
      }
    }
  }, [userData, user, database]);

  const profile = userData || {};

  const progressPercent = useMemo(() => {
    const totalStages = 120;
    let completedCount = 0;
    if (profile.trackProgress) {
      Object.values(profile.trackProgress).forEach((track: any) => {
        completedCount += (track.completedStages?.length || 0);
      });
    }
    return Math.round((completedCount / totalStages) * 100);
  }, [profile]);

  const bmiInfo = useMemo(() => {
    if (!profile.weight || !profile.height) return { value: "--", status: "غير محدد", color: "text-muted-foreground" };
    const bmi = profile.weight / ((profile.height / 100) * (profile.height / 100));
    const val = bmi.toFixed(1);
    if (bmi < 18.5) return { value: val, status: "نحافة", color: "text-blue-500" };
    if (bmi < 25) return { value: val, status: "مثالي", color: "text-green-500" };
    if (bmi < 30) return { value: val, status: "زيادة", color: "text-orange-500" };
    return { value: val, status: "سمنة", color: "text-red-500" };
  }, [profile]);

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
        <div className="grid grid-cols-2 gap-3 mx-2">
          <Link href="/streak" className="block">
            <Card className="p-4 rounded-[2rem] shadow-lg border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
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
            <Card className="p-4 rounded-[2rem] shadow-lg border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
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

        <section className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10 mx-2 shadow-inner">
          <Mascot />
        </section>

        <section className="space-y-4 mx-2">
          <h2 className="text-xl font-black text-primary px-2">مسارات النمو</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TrackCard type="Fitness" currentStage={profile.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
            <TrackCard type="Nutrition" currentStage={profile.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
            <TrackCard type="Behavior" currentStage={profile.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
            <TrackCard type="Study" currentStage={profile.trackProgress?.Study?.currentStage || 1} totalStages={30} />
          </div>
          
          <Link href="/track/master" onClick={() => playSound('click')} className="block mt-4">
            <Card className="p-6 rounded-[2.5rem] shadow-xl border-2 border-primary/20 bg-primary/5 flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform border-dashed">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={28} />
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-primary leading-tight">المسار العام</p>
                <p className="text-xs font-bold text-primary/60">تحديات الأساطير والتدريب الحر 🔥</p>
              </div>
            </Card>
          </Link>
        </section>

        <div className="mx-2">
          <AdBanner label="إعلان ممول" />
        </div>
      </div>
    </div>
  );
}
