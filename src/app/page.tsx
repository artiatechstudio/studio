
"use client"

import React, { useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, set, get, child } from 'firebase/database';
import { Flame, Trophy, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const initializeUser = async () => {
      if (user && !isDataLoading && !userData) {
        const registeredName = localStorage.getItem('registered_name') || user.displayName || 'صديق كاري';

        const usersSnap = await get(child(ref(database), 'users'));
        const userCount = usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0;

        await set(userRef!, {
          name: registeredName,
          id: user.uid,
          points: 0,
          streak: 0,
          registrationRank: userCount + 1,
          badges: ['بداية الرحلة'],
          dailyPoints: {},
          trackProgress: {
            Fitness: { currentStage: 1, completedStages: [] },
            Nutrition: { currentStage: 1, completedStages: [] },
            Behavior: { currentStage: 1, completedStages: [] },
            Study: { currentStage: 1, completedStages: [] },
          }
        });
        localStorage.removeItem('registered_name');
      }
    };

    initializeUser();
  }, [user, userData, isDataLoading, userRef, database]);

  if (isUserLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-[2rem] animate-spin" />
          <div className="text-primary font-black text-2xl animate-pulse">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const profile = userData || {
    name: 'صديق',
    points: 0,
    streak: 0,
    trackProgress: {
      Fitness: { currentStage: 1, completedStages: [] },
      Nutrition: { currentStage: 1, completedStages: [] },
      Behavior: { currentStage: 1, completedStages: [] },
      Study: { currentStage: 1, completedStages: [] },
    }
  };

  const totalStages = 120;
  const completedCount = Object.values(profile.trackProgress || {}).reduce((acc: number, curr: any) => acc + (curr.completedStages?.length || 0), 0);
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  return (
    <div className="min-h-screen bg-background">
      <NavSidebar />
      
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-10 pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6" dir="rtl">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight">أهلاً، {profile.name}!</h1>
            <p className="text-muted-foreground text-xl font-bold">كل يوم هو خطوة جديدة نحو نسخة أفضل منك. استمر!</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Card className="flex items-center gap-4 px-6 py-4 rounded-[2rem] border-none shadow-2xl shadow-orange-500/10 bg-card group hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <Flame size={28} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase">السلسلة</p>
                <p className="text-2xl font-black text-orange-600">{profile.streak} يوم</p>
              </div>
            </Card>
            
            <Card className="flex items-center gap-4 px-6 py-4 rounded-[2rem] border-none shadow-2xl shadow-yellow-500/10 bg-card group hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                <Star size={28} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase">النقاط</p>
                <p className="text-2xl font-black text-yellow-600">{profile.points?.toLocaleString() || 0}</p>
              </div>
            </Card>
          </div>
        </header>

        <section className="bg-primary/5 rounded-[3rem] p-8 md:p-12 border border-primary/10">
          <Mascot />
        </section>

        <section className="space-y-8" dir="rtl">
          <h2 className="text-3xl font-black text-primary">مسارات النمو</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <TrackCard type="Fitness" currentStage={profile.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
            <TrackCard type="Nutrition" currentStage={profile.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
            <TrackCard type="Behavior" currentStage={profile.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
            <TrackCard type="Study" currentStage={profile.trackProgress?.Study?.currentStage || 1} totalStages={30} />
          </div>
        </section>

        <section className="bg-card rounded-[3rem] p-10 shadow-2xl shadow-primary/5 space-y-8 border border-white/5" dir="rtl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-primary flex items-center gap-4">
              <Trophy className="text-accent w-10 h-10" />
              مستوى التقدم الإجمالي
            </h2>
            <div className="bg-accent/10 text-accent px-6 py-2 rounded-full font-black text-xl">{progressPercent}%</div>
          </div>
          <div className="w-full bg-secondary h-6 rounded-full overflow-hidden border-4 border-secondary shadow-inner">
            <div 
              className="bg-accent h-full transition-all duration-1000 ease-out rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
