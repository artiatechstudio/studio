
"use client"

import React, { useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase } from '@/firebase';
import { ref, set } from 'firebase/database';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  
  const userRef = user ? ref(database, `users/${user.uid}`) : null;
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && !isDataLoading && !userData) {
      set(userRef!, {
        name: user.displayName || 'Friend',
        id: user.uid,
        streak: 0,
        rank: 9999,
        badges: ['New Joiner'],
        trackProgress: {
          Fitness: { currentStage: 1, completedStages: [] },
          Nutrition: { currentStage: 1, completedStages: [] },
          Behavior: { currentStage: 1, completedStages: [] },
          Study: { currentStage: 1, completedStages: [] },
        }
      });
    }
  }, [user, userData, isDataLoading, userRef]);

  if (isUserLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-primary font-black text-2xl animate-pulse">Careingo is waking up...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const profile = userData || {
    name: user?.displayName || 'Friend',
    streak: 0,
    rank: '-',
    badges: [],
    trackProgress: {
      Fitness: { currentStage: 1 },
      Nutrition: { currentStage: 1 },
      Behavior: { currentStage: 1 },
      Study: { currentStage: 1 },
    }
  };

  return (
    <div className="min-h-screen">
      <NavSidebar />
      
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">Hey, {profile.name}!</h1>
            <p className="text-muted-foreground text-lg font-medium">Ready to make some progress today?</p>
          </div>
          
          <div className="flex gap-4">
            <Card className="flex items-center gap-3 px-5 py-3 rounded-2xl border-none shadow-lg bg-white group hover:scale-105 transition-transform">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Flame size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Streak</p>
                <p className="text-xl font-black text-orange-600">{profile.streak} Days</p>
              </div>
            </Card>
            
            <Card className="flex items-center gap-3 px-5 py-3 rounded-2xl border-none shadow-lg bg-white group hover:scale-105 transition-transform">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Trophy size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rank</p>
                <p className="text-xl font-black text-yellow-600">#{profile.rank}</p>
              </div>
            </Card>
          </div>
        </header>

        <section className="bg-secondary/30 rounded-[3.5rem] p-8 md:p-12 border border-border/50">
          <Mascot currentTrack="Fitness" />
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-primary">Your Tracks</h2>
            <div className="flex items-center gap-2 text-primary font-bold bg-white px-5 py-2 rounded-full shadow-md border border-border">
              <Calendar size={18} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrackCard type="Fitness" currentStage={profile.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
            <TrackCard type="Nutrition" currentStage={profile.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
            <TrackCard type="Behavior" currentStage={profile.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
            <TrackCard type="Study" currentStage={profile.trackProgress?.Study?.currentStage || 1} totalStages={30} />
          </div>
        </section>

        <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/5 space-y-8 border border-border/50">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <Trophy className="text-accent" />
            Recent Achievements
          </h2>
          <div className="flex flex-wrap gap-4">
            {profile.badges && profile.badges.map((badge: string, i: number) => (
              <div key={i} className="bg-secondary px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-primary hover:text-white transition-all shadow-sm">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  <Trophy size={16} />
                </div>
                <span className="font-bold">{badge}</span>
              </div>
            ))}
            <div className="bg-secondary/50 border-2 border-dashed border-border px-6 py-4 rounded-2xl flex items-center gap-3 text-muted-foreground italic font-medium">
              <span>Next Milestone Awaits!</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
