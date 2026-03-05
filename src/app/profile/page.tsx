
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Trophy, Flame, User as UserIcon, Settings as SettingsIcon, Ruler, Weight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: profile, isLoading } = useDatabase(profileRef);

  if (isUserLoading || isLoading) return null;

  const userData = profile || {};

  return (
    <div className="min-h-screen bg-background text-foreground pb-32" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex flex-col md:flex-row items-center gap-8 bg-card p-10 rounded-[2.5rem] shadow-xl border border-border">
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-8 border-secondary shadow-xl">
              <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200/200`} />
              <AvatarFallback className="bg-primary text-white text-4xl font-black">
                {userData.name?.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-accent text-white p-3 rounded-2xl shadow-lg border-4 border-card">
              <BadgeCheck size={24} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-right space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-primary">{userData.name}</h1>
            <p className="text-muted-foreground font-bold text-lg">أهلاً بك في رحلة الـ 120 يوماً 🐱</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-black flex items-center gap-2">
                <Calendar size={18} /> {userData.age} سنة
              </div>
              <div className="bg-accent/10 text-accent px-4 py-2 rounded-xl font-black flex items-center gap-2">
                <Ruler size={18} /> {userData.height} سم
              </div>
              <div className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 px-4 py-2 rounded-xl font-black flex items-center gap-2">
                <Weight size={18} /> {userData.weight} كجم
              </div>
            </div>
          </div>

          <Link href="/settings">
            <Button variant="outline" className="rounded-2xl border-2 border-primary text-primary font-black px-6 py-6 h-auto">
              <SettingsIcon className="ml-2" /> الإعدادات
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-card p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Trophy className="text-accent" /> الأوسمة والإنجازات
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-4">
              {userData.badges?.map((badge: string, i: number) => (
                <div key={i} className="bg-secondary/40 px-6 py-3 rounded-2xl font-black text-primary shadow-sm hover:bg-primary hover:text-white transition-all cursor-default">
                  {badge}
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="text-6xl">🐱</div>
            <div>
              <p className="text-4xl font-black">{userData.points || 0}</p>
              <p className="font-bold opacity-80 uppercase tracking-widest text-xs mt-1">إجمالي النقاط</p>
            </div>
            <div className="w-full h-px bg-white/20" />
            <div>
              <p className="text-3xl font-black">{userData.streak || 0} يوم</p>
              <p className="font-bold opacity-80 text-xs mt-1">سلسلة الحماسة</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
