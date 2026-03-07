
"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { Activity, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/ad-banner';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [cachedProfile, setCachedProfile] = useState<any>(null);
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  useEffect(() => {
    const cache = localStorage.getItem('careingo_user_data');
    if (cache) {
      try {
        setCachedProfile(JSON.parse(cache));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userData && user) {
      localStorage.setItem('careingo_user_data', JSON.stringify(userData));
      setCachedProfile(userData);

      // تنبيه بونص التبكير عند فتح التطبيق في الصباح الباكر
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 5 && hour < 10) {
        const todayStr = now.toLocaleDateString('en-CA');
        const lastNotifDate = localStorage.getItem('careingo_early_bird_notif');
        if (lastNotifDate !== todayStr) {
          const notifRef = ref(database, `users/${user.uid}/notifications`);
          push(notifRef, {
            type: 'bonus',
            title: 'صباح النشاط! 🔥',
            message: 'بونص التبكير (+75 نقطة) متاح الآن. أنجز مهامك قبل الساعة 8 مساءً للحصول على أكبر قدر من النقاط!',
            isRead: false,
            timestamp: serverTimestamp()
          });
          localStorage.setItem('careingo_early_bird_notif', todayStr);
        }
      }
    }
  }, [userData, database, user]);

  const profile = userData || cachedProfile || {};

  const bmiInfo = useMemo(() => {
    if (!profile.weight || !profile.height) return null;
    const heightInMeters = profile.height / 100;
    const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    const val = parseFloat(bmi);
    
    let status = "مثالي";
    let color = "text-green-500";
    if (val < 18.5) { status = "نحافة"; color = "text-blue-500"; }
    else if (val < 25) { status = "مثالي"; color = "text-green-500"; }
    else if (val < 30) { status = "زيادة"; color = "text-orange-500"; }
    else { status = "سمنة"; color = "text-red-500"; }
    
    return { value: bmi, status, color };
  }, [profile]);

  if (isUserLoading || (user && isDataLoading && !cachedProfile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">كاري ينتظرك بشوق...</p>
      </div>
    );
  }

  if (!user) return null;

  const totalStages = 120;
  const completedCount = Object.values(profile.trackProgress || {}).reduce((acc: number, curr: any) => acc + (curr.completedStages?.length || 0), 0);
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-4">
        
        <header className="flex items-center justify-between bg-card p-3 rounded-[2rem] shadow-lg border border-border sticky top-2 z-30 mx-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl shrink-0 shadow-md">
              {profile.avatar || "🐱"}
            </div>
            <div className="flex flex-col text-right overflow-hidden">
              <p className="text-[8px] font-black text-muted-foreground">أهلاً بك</p>
              <p className="text-xs font-black text-primary leading-tight truncate max-w-[120px]">{profile.name || 'جارِ التحميل'}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-2 mx-1">
          <Link href="/profile" className="block">
            <Card className="p-2.5 rounded-[1.5rem] shadow-md border border-border flex items-center gap-2 bg-card hover:scale-[1.01] transition-transform h-full">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                <HeartPulse size={16} />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[7px] font-black text-muted-foreground uppercase leading-none mb-1 truncate">مؤشر الجسم (BMI)</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-primary">{bmiInfo?.value || '--'}</span>
                  <span className={cn("text-[6px] font-black px-1 py-0.5 rounded-full bg-secondary shadow-sm truncate", bmiInfo?.color)}>
                    {bmiInfo?.status || '--'}
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/streak" className="block">
            <Card className="p-2.5 rounded-[1.5rem] shadow-md border border-border flex items-center gap-2 bg-card hover:scale-[1.01] transition-transform h-full">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent shrink-0">
                <Activity size={16} />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[7px] font-black text-muted-foreground uppercase leading-none mb-1 truncate">الإنجاز الكلي</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-primary">{progressPercent}%</span>
                  <div className="flex-1 bg-secondary h-1 rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <section className="bg-primary/5 rounded-[2rem] p-4 border border-primary/10 mx-1 shadow-inner cursor-pointer" onClick={() => router.push('/streak')}>
          <Mascot />
        </section>

        <div className="mx-1">
          <AdBanner label="إعلان ممول" />
        </div>

        <section className="space-y-3 mx-1">
          <h2 className="text-lg font-black text-primary px-2">اختر مسارك</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-8">
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
