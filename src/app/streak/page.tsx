
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">كاري ينتظرك بشوق...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 md:py-12 space-y-6">
        
        {/* Header Section */}
        <header className="bg-card p-5 md:p-8 rounded-[2rem] shadow-xl border border-border mx-1 relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-12 -translate-y-12" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 dark:bg-orange-900/30 rounded-[1.5rem] flex items-center justify-center text-orange-600 shadow-md border-2 border-white dark:border-slate-800 animate-float shrink-0">
                <Flame className="size-8 md:size-10" fill="currentColor" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl md:text-4xl font-black text-primary leading-none">سجل الحماسة</h1>
                <p className="text-[10px] md:text-sm font-bold text-muted-foreground mt-1">توثيق رحلة نموك اليومية 🔥</p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto justify-center">
              <div className="flex-1 md:flex-none bg-orange-500 text-white px-4 py-2 rounded-2xl text-center shadow-md">
                 <p className="text-xl md:text-2xl font-black">{userData?.streak || 0}</p>
                 <p className="text-[7px] font-black uppercase opacity-80">يوم مستمر</p>
              </div>
              <div className="flex-1 md:flex-none bg-primary text-white px-4 py-2 rounded-2xl text-center shadow-md">
                 <p className="text-xl md:text-2xl font-black">{(userData?.points || 0).toLocaleString()}</p>
                 <p className="text-[7px] font-black uppercase opacity-80">نقطة إجمالية</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-1">
          <Card className="lg:col-span-2 border-none shadow-lg rounded-[2rem] bg-card overflow-hidden border border-border">
            <CardHeader className="bg-secondary/10 p-5 border-b border-border">
              <CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-2">
                خارطة الإنجاز <CalendarDays size={20} className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 overflow-hidden">
              <div className="rtl-calendar-clean w-full overflow-hidden">
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
                        return <div className="text-lg animate-pulse">🔥</div>;
                      }
                      return <span className="font-black text-[10px] opacity-60">{date.getDate()}</span>;
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-lg rounded-[2rem] bg-card p-6 border border-border text-right relative overflow-hidden">
              <h3 className="font-black text-lg text-primary mb-4 flex items-center justify-end gap-2">
                حالة اليوم
                {isDoneToday ? <CheckCircle2 size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-orange-500" />}
              </h3>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                {isDoneToday 
                  ? "أحسنت يا بطل! لقد أتممت مهمتك لليوم وحافظت على السلسلة بنجاح." 
                  : "لم تسجل أي إنجاز لليوم بعد. هيا ابدأ الآن!"}
              </p>
            </Card>

            <Card className="border-none shadow-lg rounded-[2rem] bg-primary/5 p-6 border border-primary/10 text-right">
              <div className="flex items-center justify-end gap-2 text-primary mb-4">
                <h3 className="font-black text-lg">مرتبة العضوية</h3>
                <UserCheck size={20} />
              </div>
              <div className="space-y-4 text-center">
                 <p className="text-[8px] font-black text-muted-foreground uppercase">رقم العضوية الفخري</p>
                 <p className="font-black text-primary text-xl">أنت العضو رقم {membershipRank || '--'}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
