
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-10">
        <div className="text-9xl animate-bounce">🐱</div>
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-[6px] border-primary border-t-transparent rounded-[2rem] animate-spin" />
          <div className="text-primary font-black text-3xl animate-pulse">كاري ينتظرك بشوق...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const profile = userData || {};
  const totalStages = 120;
  const completedCount = Object.values(profile.trackProgress || {}).reduce((acc: number, curr: any) => acc + (curr.completedStages?.length || 0), 0);
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-8 md:py-12 space-y-8">
        
        <header className="flex items-center justify-between bg-card p-5 rounded-[2.5rem] shadow-xl border border-border sticky top-6 z-30 mx-2">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl shrink-0 shadow-lg">
              {profile.avatar || "🐱"}
            </div>
            <div className="flex flex-col text-right">
              <p className="text-xs font-black text-muted-foreground mb-1">أهلاً بك</p>
              <p className="text-xl font-black text-primary leading-none truncate max-w-[150px] sm:max-w-none">{profile.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/streak" onClick={() => playSound('click')}>
              <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-800 transition-transform active:scale-95 shadow-sm">
                <Flame size={20} className="text-orange-600" fill="currentColor" />
                <span className="text-lg font-black text-orange-600">{profile.streak || 0}</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800 shadow-sm">
              <Star size={20} className="text-yellow-600" fill="currentColor" />
              <span className="text-lg font-black text-yellow-600">{(profile.points || 0).toLocaleString()}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mx-2">
          <Link href="/profile" className="block">
            <Card className="p-6 rounded-[2.5rem] shadow-xl border border-border flex items-center gap-5 bg-card hover:scale-[1.02] transition-transform h-full">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 shrink-0 shadow-inner">
                <HeartPulse size={40} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-muted-foreground uppercase mb-1">مؤشر الجسم (BMI)</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-primary">{bmiInfo?.value || '--'}</span>
                  <span className={cn("text-sm font-black px-3 py-1 rounded-full bg-secondary shadow-sm", bmiInfo?.color)}>
                    {bmiInfo?.status || '--'}
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/streak" className="block">
            <Card className="p-6 rounded-[2.5rem] shadow-xl border border-border flex items-center gap-5 bg-card hover:scale-[1.02] transition-transform h-full">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0 shadow-inner">
                <Activity size={40} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-muted-foreground uppercase mb-1">الإنجاز الكلي</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-primary">{progressPercent}%</span>
                  <div className="flex-1 bg-secondary h-3 rounded-full overflow-hidden hidden sm:block shadow-inner">
                    <div className="bg-accent h-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--accent),0.5)]" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <section className="bg-primary/5 rounded-[3rem] p-6 border border-primary/10 mx-2 shadow-inner cursor-pointer" onClick={() => router.push('/streak')}>
          <Mascot />
        </section>

        <section className="space-y-6 mx-2">
          <h2 className="text-2xl font-black text-primary px-4">اختر مسارك</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
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
