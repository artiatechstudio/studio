
"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, CheckCircle2, AlertCircle, UserCheck, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('en-CA'));
  }, []);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  const membershipRank = useMemo(() => {
    if (!allUsersData || !user) return 0;
    const usersArray = Object.values(allUsersData) as any[];
    const sortedUsers = usersArray.sort((a, b) => {
      const dateA = new Date(a.registrationDate || 0).getTime();
      const dateB = new Date(b.registrationDate || 0).getTime();
      return dateA - dateB;
    });
    return sortedUsers.findIndex(u => u.id === user.uid) + 1;
  }, [allUsersData, user]);

  const isDoneToday = useMemo(() => {
    if (!todayStr || !userData?.dailyPoints) return false;
    return !!userData.dailyPoints[todayStr];
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
        isCompleted: !!userData?.dailyPoints?.[dStr]
      });
    }
    return days;
  }, [userData]);

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
        isCompleted: !!userData?.dailyPoints?.[dStr],
        isToday: dStr === todayStr
      });
    }
    return week;
  }, [userData, todayStr]);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">كاري ينتظرك بشوق...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        
        <header className="bg-gradient-to-br from-primary to-accent p-6 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden mx-2">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1 text-right">
              <h1 className="text-2xl font-black">سجل الحماسة</h1>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest flex items-center justify-end gap-1">
                رحلة نموك اليومية <TrendingUp size={12} />
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center border border-white/20 min-w-[60px]">
                <p className="text-xl font-black">{userData?.streak || 0}</p>
                <p className="text-[8px] font-black uppercase opacity-70">يوم</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center border border-white/20 min-w-[60px]">
                <p className="text-xl font-black">{userData?.points || 0}</p>
                <p className="text-[8px] font-black uppercase opacity-70">نقطة</p>
              </div>
            </div>
          </div>
        </header>

        <section className="px-1">
          <Card className="rounded-[2.5rem] border-none shadow-lg bg-card p-4 sm:p-6 overflow-hidden">
            <h3 className="text-sm font-black text-primary mb-6 text-right flex items-center justify-end gap-2 px-2">
              زخم الأسبوع الحالي <Flame size={18} className="text-orange-500" />
            </h3>
            <div className="flex justify-around items-center gap-1 px-1">
              {currentWeek.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-inner border-2 shrink-0",
                    day.isCompleted ? "bg-orange-500 border-orange-400 text-white animate-pulse shadow-orange-500/20" : 
                    day.isToday ? "bg-secondary border-primary/30 text-primary" : "bg-secondary border-transparent text-muted-foreground/40"
                  )}>
                    {day.isCompleted ? <Flame size={14} fill="currentColor" /> : <span className="text-[8px] sm:text-[9px] font-black">{day.label[0]}</span>}
                  </div>
                  <span className={cn("text-[6px] sm:text-[8px] md:text-[9px] font-black text-center truncate w-full", day.isToday ? "text-primary" : "text-muted-foreground opacity-60")}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="px-1 sm:px-2">
          <Card className="rounded-[2.5rem] border-none shadow-lg bg-card p-4 sm:p-6 overflow-hidden">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between flex-row-reverse">
              <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                خريطة الإنجاز (30 يوم) <CalendarIcon size={16} />
              </CardTitle>
              <div className="flex items-center gap-1 text-[8px] font-black text-muted-foreground">
                <span>أقل</span>
                <div className="w-2 h-2 bg-secondary rounded-sm" />
                <div className="w-2 h-2 bg-orange-200 rounded-sm" />
                <div className="w-2 h-2 bg-orange-500 rounded-sm" />
                <span>أكثر</span>
              </div>
            </CardHeader>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {last30Days.map((day, i) => (
                <div 
                  key={i} 
                  title={day.date}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center transition-all duration-500",
                    day.isCompleted ? "bg-orange-500 shadow-lg shadow-orange-500/20 text-white" : "bg-secondary text-muted-foreground/20"
                  )}
                >
                  {day.isCompleted ? <CheckCircle2 size={12} /> : <span className="text-[8px] font-bold">{day.dayNum}</span>}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
          <Card className="rounded-[2rem] border-none shadow-md bg-card p-5 flex items-center gap-4 border border-border">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", isDoneToday ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")}>
              {isDoneToday ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="text-right">
              <h4 className="font-black text-xs text-primary">حالة اليوم</h4>
              <p className="text-[10px] font-bold text-muted-foreground leading-tight mt-1">
                {isDoneToday ? "أنت أسطورة! حافظ على اشتعال الشعلة." : "لم بدأت بعد؟ كاري ينتظرك بشوق!"}
              </p>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-md bg-primary/5 p-5 flex items-center gap-4 border border-primary/10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
              <UserCheck size={24} />
            </div>
            <div className="text-right">
              <h4 className="font-black text-xs text-primary">رقم العضوية</h4>
              <p className="text-[10px] font-bold text-muted-foreground leading-tight mt-1">
                أنت العضو رقم <span className="text-primary font-black">{membershipRank || '--'}</span> في مجتمعنا.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center opacity-20 font-black text-[8px] pt-4">
          CAREINGO STREAK SYSTEM v2.0
        </footer>
      </div>
    </div>
  );
}
