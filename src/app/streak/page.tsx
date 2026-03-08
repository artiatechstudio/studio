
"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, CheckCircle2, AlertCircle, UserCheck, Calendar as CalendarIcon, TrendingUp, ShieldCheck, Crown, Share2, Sparkles, Star, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';

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

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const streakFreezes = userData?.streakFreezes ?? 2;

  const handleShare = async () => {
    playSound('click');
    if (!isPremium) {
      toast({ variant: "destructive", title: "ميزة بريميوم 👑", description: "مشاركة بطاقة التميز الأسبوعية حصرية للمشتركين." });
      return;
    }
    
    const shareText = `أنا في اليوم ${userData?.streak || 0} من رحلة النمو في تطبيق Careingo! 🐱🔥 رصيد نقاطي: ${userData?.points || 0}. انضم إلينا الآن!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'إنجازي في Careingo',
          text: shareText,
          url: window.location.origin
        });
      } catch (error: any) {
        // في حال تم رفض الصلاحية أو فشل الفتح، نقوم بالنسخ للحافظة
        navigator.clipboard.writeText(shareText);
        toast({ 
          title: "تم نسخ نص الإنجاز! 📋", 
          description: "تعذر فتح نافذة المشاركة، تم نسخ النص بدلاً من ذلك لتشاركه يدوياً." 
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "تم نسخ نص الإنجاز! 📋" });
    }
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">Careingo</p>
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

        {/* ميزة تجميد الحماسة */}
        <div className="px-2">
          <Card className={cn(
            "rounded-[2rem] border-none shadow-xl p-6 relative overflow-hidden",
            isPremium ? "bg-blue-600 text-white" : "bg-slate-100 border border-dashed border-slate-300"
          )}>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-right">
                <h3 className="font-black text-sm flex items-center gap-2 justify-end">
                  تجميد الحماسة 🧊
                  <Snowflake size={18} className={isPremium ? "text-blue-200" : "text-slate-400"} />
                </h3>
                <p className={cn("text-[10px] font-bold mt-1", isPremium ? "text-blue-100" : "text-slate-500")}>
                  {isPremium 
                    ? `رصيدك الحالي: ${streakFreezes} من أصل 2 تجميدات هذا الشهر.` 
                    : "اشترك في بريميوم لتحصل على 2 تجميد حماسة شهرياً."}
                </p>
              </div>
              {!isPremium && (
                <Link href="/settings">
                  <Button size="sm" className="bg-primary text-[10px] h-8 rounded-xl font-black">اشترك الآن</Button>
                </Link>
              )}
            </div>
          </Card>
        </div>

        <div className="px-2">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-black text-primary mb-6 text-right flex items-center justify-end gap-2">
              زخم الأسبوع الحالي <Flame size={20} className="text-orange-500" />
            </h3>
            <div className="flex justify-between items-center gap-1 sm:gap-2">
              {currentWeek.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0 text-center">
                  <div className={cn(
                    "w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all border-2 shrink-0",
                    day.isCompleted ? "bg-orange-500 border-orange-400 text-white shadow-lg" : 
                    day.isToday ? "bg-secondary border-primary/30 text-primary" : "bg-secondary border-transparent text-muted-foreground/30"
                  )}>
                    {day.isCompleted ? <Flame size={14} className="sm:w-5 sm:h-5" fill="currentColor" /> : <span className="text-[10px] sm:text-xs font-black">{day.label[0]}</span>}
                  </div>
                  <span className={cn("text-[8px] sm:text-[10px] font-black truncate w-full text-center px-0.5", day.isToday ? "text-primary" : "text-muted-foreground opacity-60")}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* بطاقة الإنجاز الأسبوعية (حصرياً للبريميوم) */}
        {isPremium && (
          <div className="px-2">
            <Card className="rounded-[2.5rem] border-4 border-yellow-400 bg-white p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-400 rotate-45 opacity-20" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-400 rotate-45 opacity-20" />
              
              <div className="text-center space-y-4 relative z-10">
                <Crown className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-primary">بطاقة التميز الملكية</h3>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <p className="text-[10px] font-black text-yellow-700 uppercase">الحماسة</p>
                    <p className="text-xl font-black text-primary">{userData?.streak || 0} يوم</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <p className="text-[10px] font-black text-yellow-700 uppercase">النقاط</p>
                    <p className="text-xl font-black text-primary">{userData?.points || 0}</p>
                  </div>
                </div>
                <Button onClick={handleShare} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black gap-2">
                  <Share2 size={18} /> مشاركة إنجازي مع العالم
                </Button>
              </div>
            </Card>
          </div>
        )}

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

        <footer className="text-center opacity-30 font-black text-[10px] pt-8 uppercase tracking-widest">
          Careingo GROWTH ECOSYSTEM 2026
        </footer>
      </div>
    </div>
  );
}
