
"use client"

import React, { useEffect, useState } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Flame, Star, Trophy, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  if (isUserLoading || (user && isDataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
          <div className="text-primary font-black text-xl animate-pulse">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isDataLoading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="text-8xl animate-bounce">🐱</div>
          <h1 className="text-3xl font-black text-primary">أهلاً بك! يبدو أنك جديد هنا</h1>
          <p className="text-muted-foreground font-bold text-lg">تحتاج لإكمال ملفك الشخصي لنبدأ رحلة النمو معاً.</p>
          <Link href="/register">
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
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      <NavSidebar />
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">أهلاً، {profile.name}! {profile.avatar || "🐱"}</h1>
            <p className="text-muted-foreground text-lg font-bold">رحلة النمو مستمرة، أنت اليوم أفضل من الأمس.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/streak">
              <Card className="flex items-center gap-4 px-5 py-3 rounded-2xl border-none shadow-xl bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
                  <Flame size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">الحماسة</p>
                  <p className="text-xl font-black text-orange-600">{profile.streak || 0} يوم</p>
                </div>
              </Card>
            </Link>
            
            <Card className="flex items-center gap-4 px-5 py-3 rounded-2xl border-none shadow-xl bg-card">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">النقاط</p>
                <p className="text-xl font-black text-yellow-600">{profile.points?.toLocaleString() || 0}</p>
              </div>
            </Card>
          </div>
        </header>

        <section className="bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-6 md:p-10 border border-primary/10">
          <Mascot />
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
             مساراتك الحالية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrackCard type="Fitness" currentStage={profile.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
            <TrackCard type="Nutrition" currentStage={profile.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
            <TrackCard type="Behavior" currentStage={profile.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
            <TrackCard type="Study" currentStage={profile.trackProgress?.Study?.currentStage || 1} totalStages={30} />
          </div>
        </section>

        <section className="bg-card rounded-[2.5rem] p-8 shadow-2xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
              <Trophy className="text-accent" size={32} /> إجمالي الإنجاز
            </h2>
            <div className="bg-accent/10 text-accent px-4 py-1 rounded-full font-black text-lg">{progressPercent}%</div>
          </div>
          <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
