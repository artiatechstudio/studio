
"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, CalendarDays, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const [todayStr, setTodayStr] = useState<string>("");

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setTodayStr(`${year}-${month}-${day}`);
  }, []);

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

  const completedDates = useMemo(() => {
    if (!userData?.dailyPoints) return [];
    return Object.keys(userData.dailyPoints).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
  }, [userData]);
  
  const isDoneToday = useMemo(() => {
    if (!todayStr || !userData?.dailyPoints) return false;
    return !!userData.dailyPoints[todayStr];
  }, [userData, todayStr]);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 md:py-12 space-y-6">
        
        {/* Header Section - Optimized for Mobile */}
        <header className="bg-card p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-border mx-1 relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-12 -translate-y-12" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-orange-100 dark:bg-orange-900/30 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-orange-600 shadow-md border-2 border-white dark:border-slate-800 animate-float shrink-0">
                <Flame className="size-10 md:size-14" fill="currentColor" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl md:text-5xl font-black text-primary leading-none">سجل الحماسة</h1>
                <p className="text-[10px] md:text-base font-bold text-muted-foreground mt-1">توثيق رحلة نموك اليومية 🔥</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
              <div className="flex-1 md:flex-none bg-orange-500 text-white px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] text-center shadow-md">
                 <p className="text-2xl md:text-4xl font-black">{userData?.streak || 0}</p>
                 <p className="text-[7px] md:text-[10px] font-black uppercase tracking-tighter opacity-80">يوم مستمر</p>
              </div>
              <div className="flex-1 md:flex-none bg-primary text-white px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] text-center shadow-md">
                 <p className="text-2xl md:text-4xl font-black">{(userData?.points || 0).toLocaleString()}</p>
                 <p className="text-[7px] md:text-[10px] font-black uppercase tracking-tighter opacity-80">نقطة إجمالية</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-1">
          {/* Calendar Card - Constrained */}
          <Card className="lg:col-span-2 border-none shadow-lg rounded-[2rem] md:rounded-[2.5rem] bg-card overflow-hidden border border-border">
            <CardHeader className="bg-secondary/10 p-5 md:p-8 border-b border-border">
              <CardTitle className="text-lg md:text-2xl font-black text-primary flex items-center justify-end gap-2">
                خارطة الإنجاز <CalendarDays size={20} className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8 overflow-hidden">
              <div className="rtl-calendar-clean w-full max-w-full overflow-hidden">
                <Calendar
                  mode="multiple"
                  selected={completedDates}
                  showOutsideDays={false}
                  className="p-0 bg-transparent w-full"
                  components={{
                    Head: () => null, 
                    DayContent: ({ date }) => {
                      if (!date) return null;
                      const isCompleted = completedDates.some(d => d.toDateString() === date.toDateString());
                      if (isCompleted) {
                        return <div className="text-lg md:text-2xl animate-pulse">🔥</div>;
                      }
                      return <span className="font-black text-[10px] md:text-sm opacity-60">{date.getDate()}</span>;
                    }
                  }}
                />
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 text-[8px] md:text-xs font-black text-muted-foreground bg-secondary/20 p-3 rounded-xl">
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded-sm" /> منجز 🔥</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-secondary rounded-sm border border-border" /> لم يكتمل</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Today Status Card */}
            <Card className="border-none shadow-lg rounded-[2rem] bg-card p-6 md:p-8 border border-border text-right relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange-500 to-primary" />
              <h3 className="font-black text-lg md:text-xl text-primary mb-4 flex items-center justify-end gap-2">
                حالة اليوم
                {isDoneToday ? <CheckCircle2 size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-orange-500" />}
              </h3>
              <p className="text-xs md:text-base font-bold text-muted-foreground leading-relaxed">
                {isDoneToday 
                  ? "أحسنت يا بطل! لقد أتممت مهمتك لليوم وحافظت على السلسلة بنجاح. استمر!" 
                  : "لم تسجل أي إنجاز لليوم بعد. تذكر أن كل دقيقة تمر تقربك من فقدان حماسك!"}
              </p>
              {!isDoneToday && (
                <div className="flex justify-end mt-6">
                  <Badge variant="outline" className="border-orange-500 text-orange-500 font-black px-4 py-1.5 rounded-xl animate-pulse text-[10px]">
                    مطلوب إنجاز 🔥
                  </Badge>
                </div>
              )}
            </Card>

            {/* Membership Card */}
            <Card className="border-none shadow-lg rounded-[2rem] bg-primary/5 p-6 md:p-8 border border-primary/10 text-right">
              <div className="flex items-center justify-end gap-2 text-primary mb-4">
                <h3 className="font-black text-lg">مرتبة العضوية</h3>
                <UserCheck size={20} />
              </div>
              <div className="space-y-4">
                <div className="p-4 md:p-6 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-sm border border-border/50 text-center">
                   <p className="text-[8px] md:text-xs font-black text-muted-foreground uppercase mb-1">رقم العضوية الفخري</p>
                   <p className="font-black text-primary text-xl md:text-3xl">أنت العضو رقم {membershipRank || '--'}</p>
                   <p className="text-[7px] md:text-[9px] text-accent font-black mt-1">نفخر بكونك من الرواد الأوائل 🌱</p>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                   <p className="font-black text-primary text-lg md:text-xl">{completedDates.length}</p>
                   <p className="text-[10px] md:text-sm font-bold text-muted-foreground">إجمالي أيام الإنجاز</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
