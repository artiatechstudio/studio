
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Trophy, Flame, User, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const profileRef = user ? ref(database, `users/${user.uid}`) : null;
  const { data: profile } = useDatabase(profileRef);

  if (isUserLoading) return <div className="p-10 text-center font-black text-primary">Loading Profile...</div>;

  const userData = profile || {
    name: user?.displayName || 'Careingo Member',
    streak: 0,
    rank: '-',
    badges: ['New Starter']
  };

  return (
    <div className="min-h-screen">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        <header className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-border">
          <div className="relative">
            <Avatar className="w-40 h-40 border-8 border-secondary shadow-2xl">
              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/150/150`} />
              <AvatarFallback>{userData.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg border-4 border-white">
              <BadgeCheck size={20} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black text-primary leading-tight">{userData.name}</h1>
            <p className="text-muted-foreground text-lg font-medium">Careingo Enthusiast • Growing since 2024</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold">
                <Flame size={18} fill="currentColor" /> {userData.streak} Day Streak
              </div>
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-600 px-4 py-2 rounded-xl font-bold">
                <Trophy size={18} fill="currentColor" /> Rank #{userData.rank}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link href="/settings">
              <Button className="w-full md:w-auto rounded-2xl bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-bold shadow-lg shadow-primary/20">
                Edit Profile
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem]">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-black text-primary">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-6 flex flex-wrap gap-4">
                {userData.badges?.map((badge: string, i: number) => (
                  <div key={i} className="bg-secondary px-6 py-3 rounded-2xl flex items-center gap-3 group hover:bg-primary hover:text-white transition-all cursor-default shadow-sm">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-accent transition-colors">
                      <Trophy size={20} />
                    </div>
                    <span className="font-bold">{badge}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg rounded-3xl p-6 bg-white flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase">Joined</p>
                  <p className="text-xl font-black text-primary">March 2024</p>
                </div>
              </Card>
              <Card className="border-none shadow-lg rounded-3xl p-6 bg-white flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase">Location</p>
                  <p className="text-xl font-black text-primary">Riyadh, SA</p>
                </div>
              </Card>
            </div>
          </div>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white h-fit">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black">Growth Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm opacity-80">
                  <span>Total Progress</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[45%]" />
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                "Small steps every day lead to big changes over time. You're doing better than 65% of members this month!"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
