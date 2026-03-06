
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { playSound } from '@/lib/sounds';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  // استخراج تواريخ الإنجاز الحقيقية من قاعدة البيانات
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
    <div className="min-h-screen bg-background pb-32 md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 shadow-xl border-4 border-white dark:border-slate-800">
            <Flame size={40} fill="currentColor" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black text-primary">سجل الحماسة</h1>
            <p className="text-muted-foreground font-bold">تتبع استمراريتك وإنجازاتك اليومية الموثقة</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-card overflow-hidden border border-border">
            <CardHeader className="bg-primary/5 p-8 border-b border-border">
              <CardTitle className="text-xl font-black text-primary flex items-center justify-end gap-3">
                تقويم الإنجاز <CalendarDays className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex justify-center items-center overflow-x-auto">
              <div className="flex justify-center w-full rtl-calendar">
                <Calendar
                  mode="multiple"
                  selected={completedDates}
                  className="rounded-3xl border shadow-inner p-4 bg-secondary/10"
                  modifiers={{
                    completed: completedDates
                  }}
                  modifiersStyles={{
                    completed: { 
                      backgroundColor: 'hsl(var(--primary))', 
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '12px'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card 
              onClick={() => playSound('click')}
              className="border-none shadow-xl rounded-[2.5rem] bg-orange-500 text-white p-8 text-center flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="text-6xl animate-bounce">🔥</div>
              <div>
                <p className="text-5xl font-black">{userData?.streak || 0}</p>
                <p className="font-bold opacity-80 uppercase tracking-widest text-xs mt-2">يوم حماسة مستمر</p>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border text-right">
              <h3 className="font-black text-primary mb-4 flex items-center justify-end gap-2">
                حالة اليوم
                {isDoneToday ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-orange-500" />}
              </h3>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                {isDoneToday 
                  ? "أحسنت! لقد أتممت مهمتك لليوم وحافظت على السلسلة. نراك غداً!" 
                  : "لم تسجل أي إنجاز لليوم بعد. أسرع قبل أن تنتهي السلسلة!"}
              </p>
              {!isDoneToday && (
                <div className="flex justify-end mt-4">
                  <Badge variant="outline" className="border-orange-500 text-orange-500 font-black px-3 py-1">
                    مهمة مطلوبة 🔥
                  </Badge>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
