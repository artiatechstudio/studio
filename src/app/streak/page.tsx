
"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardTitle } from '@/components/ui/card';
import { Flame, CheckCircle2, AlertCircle, UserCheck, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('en-CA'));
  }, []);

  const userRef = useMemoFirebase(() => {
    if (!user || !database) return null;
    return ref(database, `users/${user.uid}`);
  }, [user, database]);

  const { data: userData, isLoading: isUserDataLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'users');
  }, [database]);

  const { data: allUsersData } = useDatabase(allUsersRef);

  const membershipRank = useMemo(() => {
    if (!allUsersData || !user) return 0;
    const usersArray = Object.values(allUsersData) as any[];
    const sorted = usersArray.sort((a, b) => new Date(a.registrationDate || 0).getTime() - new Date(b.registrationDate || 0).getTime());
    const idx = sorted.findIndex(u => u.id === user.uid);
    return idx >= 0 ? idx + 1 : 0;
  }, [allUsersData, user]);

  const isDoneToday = useMemo(() => {
    if (!todayStr || !userData?.dailyPoints) return false;
    return !!userData.dailyPoints[todayStr];
  }, [userData, todayStr]);

  const currentWeek = useMemo(() => {
    const week = [];
    const dayLabels = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const baseDate = new Date();
    const dayOfWeek = baseDate.getDay();
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - (dayOfWeek - i));
      const dStr = d.toLocaleDateString('en-CA');
      week.push({
        label: dayLabels[i],
        isCompleted: !!(userData?.dailyPoints?.[dStr]),
        isToday: dStr === todayStr
      });
    }
    return week;
  }, [userData, todayStr]);

  const last30Days = useMemo(() => {
    const days = [];
    const baseDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString('en-CA');
      days.push({
        date: dStr,
        dayNum: d.getDate(),
        isCompleted: !!(userData?.dailyPoints?.[dStr])
      });
    }
    return days;
  }, [userData]);

  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <p className="text-primary font-black text-xl animate-pulse">كاري يجمع بياناتك...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-4 md:pt-0 overflow-x-hidden" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        
        <header className="bg-gradient-to-br from-primary to-accent p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden mx-2">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1 text-right">
              <h1 className="text-3xl font-black">سجل الحماسة</h1>
              <p className="text-xs font-bold opacity-80 flex items-center justify-end gap-1">رحلة نموك اليومية <TrendingUp size={14} /></p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/20">
                <p className="text-2xl font-black">{userData?.streak || 0}</p>
                <p className="text-[10px] font-black opacity-70">يوم</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/20">
                <p className="text-2xl font-black">{userData?.points || 0}</p>
                <p className="text-[10px] font-black opacity-70">نقطة</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-2">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-card p-6">
            <h3 className="text-lg font-black text-primary mb-6 text-right flex items-center justify-end gap-2">
              زخم الأسبوع الحالي <Flame size={20} className="text-orange-500" />
            </h3>
            <div className="flex justify-around items-center gap-2">
              {currentWeek.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                    day.isCompleted ? "bg-orange-500 border-orange-400 text-white shadow-lg" : 
                    day.isToday ? "bg-secondary border-primary/30 text-primary" : "bg-secondary border-transparent text-muted-foreground/30"
                  )}>
                    {day.isCompleted ? <Flame size={20} fill="currentColor" /> : <span className="text-xs font-black">{day.label[0]}</span>}
                  </div>
                  <span className={cn("text-[10px] font-black", day.isToday ? "text-primary" : "text-muted-foreground opacity-60")}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="px-2">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-card p-6">
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <CardTitle className="text-lg font-black text-primary flex items-center gap-2">خريطة الإنجاز <CalendarIcon size={20} /></CardTitle>
              <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase">
                <span>أقل</span>
                <div className="w-3 h-3 bg-secondary rounded-sm" />
                <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                <span>أكثر</span>
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {last30Days.map((day, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center transition-all text-xs font-black",
                    day.isCompleted ? "bg-orange-500 text-white shadow-md" : "bg-secondary text-muted-foreground/20"
                  )}
                >
                  {day.isCompleted ? <CheckCircle2 size={14} /> : day.dayNum}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
          <Card className="rounded-[2rem] border-none shadow-lg bg-card p-6 flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", isDoneToday ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")}>
              {isDoneToday ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </div>
            <div className="text-right">
              <h4 className="font-black text-primary">حالة اليوم</h4>
              <p className="text-xs font-bold text-muted-foreground mt-1">
                {isDoneToday ? "أنت أسطورة! حافظ على التقدم." : "لم بدأت بعد؟ كاري ينتظرك!"}
              </p>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-lg bg-primary/5 p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
              <UserCheck size={28} />
            </div>
            <div className="text-right">
              <h4 className="font-black text-primary">رقم العضوية</h4>
              <p className="text-xs font-bold text-muted-foreground mt-1">أنت العضو رقم <span className="text-primary font-black">{membershipRank || '--'}</span> بمجتمعنا.</p>
            </div>
          </Card>
        </div>

        <footer className="text-center opacity-30 font-black text-[10px] pt-8 uppercase tracking-widest">
          CAREINGO GROWTH ECOSYSTEM 2026
        </footer>
      </div>
    </div>
  );
}
