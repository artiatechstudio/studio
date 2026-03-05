
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { BadgeCheck, Trophy, Flame, Settings as SettingsIcon, Ruler, Weight, Calendar as CalendarIcon, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: profile, isLoading } = useDatabase(profileRef);

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج" });
    router.replace('/login');
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
      </div>
    );
  }

  const userData = profile || {};

  const getRankName = (points: number = 0) => {
    if (points >= 10000) return "أسطورة كاري 👑";
    if (points >= 5000) return "بطل متميز 🏅";
    if (points >= 2000) return "مكافح محترف 🔥";
    if (points >= 500) return "عضو نشط 🐱";
    return "مبتدئ طموح 🌱";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex flex-col md:flex-row items-center gap-8 bg-card p-10 rounded-[2.5rem] shadow-xl border border-border">
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-8 border-secondary shadow-xl bg-white flex items-center justify-center">
              <span className="text-7xl md:text-8xl">{userData.avatar || "🐱"}</span>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-accent text-white p-3 rounded-2xl shadow-lg border-4 border-card">
              <BadgeCheck size={24} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-right space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black text-primary">{userData.name}</h1>
              <span className="bg-secondary px-4 py-1 rounded-full text-xs font-black text-muted-foreground">العضو رقم {userData.id?.substring(0, 6)}</span>
            </div>
            <p className="text-muted-foreground font-bold text-lg italic">{getRankName(userData.points)}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-primary/10 text-primary dark:bg-primary/20 px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-primary/10">
                <CalendarIcon size={18} /> {userData.age || '--'} سنة
              </div>
              <div className="bg-accent/10 text-accent dark:bg-accent/20 px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-accent/10">
                <Ruler size={18} /> {userData.height || '--'} سم
              </div>
              <div className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-orange-200 dark:border-orange-800">
                <Weight size={18} /> {userData.weight || '--'} كجم
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/settings">
              <Button variant="outline" className="w-full rounded-2xl border-2 border-primary text-primary font-black px-6 py-4 h-auto hover:bg-primary/5 transition-all">
                <SettingsIcon className="ml-2" /> الإعدادات
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="text-destructive font-black hover:bg-destructive/10">
              <LogOut className="ml-2" size={18} /> تسجيل الخروج
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-black text-primary flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Trophy className="text-accent" /> الأوسمة المكتسبة
                </div>
                <Link href="/streak">
                  <Button variant="link" className="text-accent font-black">سجل الحماسة <ArrowLeft size={16} className="mr-1 rotate-180" /></Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-4">
              {userData.badges && userData.badges.length > 0 ? userData.badges.map((badge: string, i: number) => (
                <div key={i} className="bg-secondary/40 dark:bg-secondary/20 px-6 py-3 rounded-2xl font-black text-primary dark:text-primary-foreground shadow-sm hover:scale-105 transition-all cursor-default border border-border">
                  {badge}
                </div>
              )) : (
                <p className="text-muted-foreground font-bold italic">لم تكتسب أوسمة بعد، استمر في التقدم! 🔥</p>
              )}
            </div>
          </Card>

          <Link href="/streak">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Trophy size={80} />
              </div>
              <div className="text-6xl animate-bounce">{userData.avatar || "🐱"}</div>
              <div>
                <p className="text-4xl font-black">{userData.points || 0}</p>
                <p className="font-bold opacity-80 uppercase tracking-widest text-[10px] mt-1">إجمالي النقاط</p>
              </div>
              <div className="w-full h-px bg-white/20" />
              <div className="flex items-center gap-3">
                <Flame size={28} className="text-orange-300" fill="currentColor" />
                <div>
                  <p className="text-3xl font-black">{userData.streak || 0} يوم</p>
                  <p className="font-bold opacity-80 text-[10px] mt-1">سلسلة الحماسة</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
