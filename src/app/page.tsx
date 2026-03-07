
"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Flame, Star, Activity, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import { AdBanner } from '@/components/ad-banner';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [cachedProfile, setCachedProfile] = useState<any>(null);
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  useEffect(() => {
    // تحميل الكاش عند البداية
    const cache = localStorage.getItem('careingo_user_data');
    if (cache) {
      try {
        setCachedProfile(JSON.parse(cache));
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // تحديث الكاش عند جلب بيانات جديدة
    if (userData) {
      localStorage.setItem('careingo_user_data', JSON.stringify(userData));
      setCachedProfile(userData);
    }
  }, [userData]);

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
    <div className="min-h-screen bg-background pb-32 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-4 md:py-10 space-y-4">
        
        <header className="flex items-center justify-between bg-card p-3 rounded-[2rem] shadow-lg border border-border sticky top-2 z-30 mx-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl shrink-0 shadow-md">
              {profile.avatar || "🐱"}
            </div>
            <div className="flex flex-col text-right overflow-hidden">
              <p className="text-[8px] font-black text-muted-foreground">أهلاً بك</p>
              <p className="text-xs font-black text-primary leading-tight truncate max-w-[80px]">{profile.name || 'جارِ التحميل'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/streak" onClick={() => playSound('click')}>
              <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                <Flame size={14} className="text-orange-600" fill="currentColor" />
                <span className="text-xs font-black text-orange-600">{profile.streak || 0}</span>
              </div>
            </Link>
            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
              <Star size={14} className="text-yellow-600" fill="currentColor" />
              <span className="text-xs font-black text-yellow-600">{profile.points || 0}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mx-1">
          <Link href="/profile" className="block">
            <Card className="p-3 rounded-[2rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.01] transition-transform">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                <HeartPulse size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">مؤشر الجسم (BMI)</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-primary">{bmiInfo?.value || '--'}</span>
                  <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-full bg-secondary shadow-sm", bmiInfo?.color)}>
                    {bmiInfo?.status || '--'}
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/streak" className="block">
            <Card className="p-3 rounded-[2rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.01] transition-transform">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                <Activity size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">الإنجاز الكلي</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-primary">{progressPercent}%</span>
                  <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden hidden sm:block">
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
