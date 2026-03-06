
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, CalendarDays, CheckCircle2, AlertCircle, Trophy, TrendingUp, Star, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const completedDates = useMemo(() => {
    if (!userData?.dailyPoints) return [];
    return Object.keys(userData.dailyPoints).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
  }, [userData]);
  
  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const isDoneToday = useMemo(() => !!userData?.dailyPoints?.[todayStr], [userData, todayStr]);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 md:py-16 space-y-12">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card p-10 rounded-[3rem] shadow-2xl border border-border mx-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-16 -translate-y-16" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-[2.5rem] flex items-center justify-center text-orange-600 shadow-xl border-4 border-white dark:border-slate-800 animate-float">
              <Flame size={56} fill="currentColor" />
            </div>
            <div className="text-right">
              <h1 className="text-4xl md:text-6xl font-black text-primary leading-none">سجل الحماسة</h1>
              <p className="text-muted-foreground font-bold text-lg mt-2">توثيق رحلة نموك اليومية 🔥</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center relative z-10">
            <div className="bg-orange-500 text-white px-8 py-4 rounded-[2rem] text-center shadow-lg shadow-orange-500/20">
               <p className="text-4xl font-black">{userData?.streak || 0}</p>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">يوم مستمر</p>
            </div>
            <div className="bg-primary text-white px-8 py-4 rounded-[2rem] text-center shadow-lg shadow-primary/20">
               <p className="text-4xl font-black">{(userData?.points || 0).toLocaleString()}</p>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">نقطة إجمالية</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mx-2">
          <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] bg-card overflow-hidden border border-border">
            <CardHeader className="bg-secondary/10 p-10 border-b border-border">
              <CardTitle className="text-2xl font-black text-primary flex items-center justify-end gap-3">
                خارطة الإنجاز <CalendarDays className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <div className="rtl-calendar flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={completedDates}
                  showHead={false}
                  className="rounded-[2.5rem] border shadow-inner p-4 md:p-12 bg-secondary/5 w-full max-w-none"
                  modifiers={{
                    completed: completedDates
                  }}
                  modifiersStyles={{
                    completed: { 
                      color: 'transparent',
                      background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23f97316\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l4.59-4.59L17 10.5 11 16.5z\'/%3E%3C/svg%3E") no-repeat center',
                      backgroundSize: '32px',
                    }
                  }}
                />
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black text-muted-foreground bg-white/50 p-4 rounded-2xl border border-border">
                 <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-lg shadow-sm" /> يوم منجز 🔥</div>
                 <div className="flex items-center gap-2"><div className="w-4 h-4 bg-secondary rounded-lg border border-border" /> يوم لم يكتمل</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-none shadow-xl rounded-[3rem] bg-card p-10 border border-border text-right relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-orange-500 to-primary" />
              <h3 className="font-black text-2xl text-primary mb-6 flex items-center justify-end gap-3">
                حالة اليوم
                {isDoneToday ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-orange-500" />}
              </h3>
              <p className="text-lg font-bold text-muted-foreground leading-relaxed">
                {isDoneToday 
                  ? "أحسنت يا بطل! لقد أتممت مهمتك لليوم وحافظت على السلسلة بنجاح. استمر!" 
                  : "لم تسجل أي إنجاز لليوم بعد. تذكر أن كل دقيقة تمر تقربك من فقدان حماسك!"}
              </p>
              {!isDoneToday && (
                <div className="flex justify-end mt-8">
                  <Badge variant="outline" className="border-orange-500 text-orange-500 font-black px-6 py-2 rounded-2xl animate-pulse">
                    مطلوب إنجاز 🔥
                  </Badge>
                </div>
              )}
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] bg-primary/5 p-10 border border-primary/10 text-right">
              <div className="flex items-center justify-end gap-3 text-primary mb-6">
                <h3 className="font-black text-xl">هويتك في كارينجو</h3>
                <UserCheck size={24} />
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 text-center">
                   <p className="text-xs font-black text-muted-foreground uppercase mb-2">ترتيب انضمامك للمجتمع</p>
                   <p className="font-black text-primary text-3xl">أنت العضو رقم {userData?.registrationRank || '--'}</p>
                   <p className="text-[10px] text-accent font-black mt-2">من أوائل الداعمين للنمو 🌱</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                   <p className="font-black text-primary text-xl">{completedDates.length}</p>
                   <p className="font-bold text-muted-foreground">أيام الإنجاز الكلية</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
