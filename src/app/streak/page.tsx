
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
      </div>
    );
  }

  const dailyPoints = userData?.dailyPoints || {};
  const activeDates = Object.keys(dailyPoints).map(dateStr => new Date(dateStr));
  
  const today = new Date().toISOString().split('T')[0];
  const isDoneToday = !!dailyPoints[today];

  return (
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-xl border-4 border-white">
            <Flame size={40} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary">سجل الحماسة</h1>
            <p className="text-muted-foreground font-bold">تتبع استمراريتك وإنجازاتك اليومية</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b border-border">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                <CalendarDays className="text-primary" /> تقويم الإنجاز
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex justify-center">
              <Calendar
                mode="multiple"
                selected={activeDates}
                className="rounded-3xl border shadow-inner p-4 bg-secondary/10"
                classNames={{
                  day_selected: "bg-green-500 text-white hover:bg-green-600 font-bold rounded-xl",
                  day_today: "border-2 border-primary text-primary font-black",
                }}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-orange-500 text-white p-8 text-center flex flex-col items-center justify-center gap-4">
              <div className="text-6xl animate-bounce">🔥</div>
              <div>
                <p className="text-5xl font-black">{userData?.streak || 0}</p>
                <p className="font-bold opacity-80 uppercase tracking-widest text-xs mt-2">يوم حماسة مستمر</p>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border">
              <h3 className="font-black text-primary mb-4 flex items-center gap-2">
                {isDoneToday ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-orange-500" />}
                حالة اليوم
              </h3>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                {isDoneToday 
                  ? "أحسنت! لقد أتممت مهمتك لليوم وحافظت على السلسلة. نراك غداً!" 
                  : "لم تسجل أي إنجاز لليوم بعد. أسرع قبل أن تنتهي السلسلة!"}
              </p>
              {!isDoneToday && (
                <Badge variant="outline" className="mt-4 border-orange-500 text-orange-500 font-black px-3 py-1">
                  مهمة مطلوبة 🔥
                </Badge>
              )}
            </Card>
          </div>
        </div>

        <section className="bg-secondary/20 rounded-[2.5rem] p-8 border border-border">
          <h3 className="text-xl font-black text-primary mb-6">كيف تعمل الحماسة؟</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-bold text-muted-foreground">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
              <p className="text-primary font-black mb-2">1. الإنجاز اليومي</p>
              تحصل على نقطة حماسة واحدة عند إكمال أي مهمة في أي مسار خلال اليوم.
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
              <p className="text-primary font-black mb-2">2. الاستمرارية</p>
              يجب أن تنجز مهمة واحدة على الأقل كل يوم لتنمو السلسلة. إذا فاتك يوم، سيعود العداد للصفر.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
