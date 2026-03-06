
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, Star, TrendingUp, HeartPulse, Heart } from "lucide-react";
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild, limitToLast } from 'firebase/database';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';

export default function LeaderboardPage() {
  const { database } = useFirebase();
  
  const leadersQuery = useMemoFirebase(() => {
    return query(ref(database, 'users'), orderByChild('points'), limitToLast(100));
  }, [database]);

  const { data: rawData, isLoading } = useDatabase(leadersQuery);

  const leaders = useMemo(() => {
    if (!rawData) return [];
    
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return Object.values(rawData)
      .map((user: any) => {
        const dailyPoints = user.dailyPoints || {};
        const scores = dates.map(date => dailyPoints[date] || 0);
        const sum = scores.reduce((a, b) => a + b, 0);
        const avgScore = Math.round(sum / 3);

        let bmiStatus = "غير محدد";
        let bmiColor = "text-gray-400";
        let bmiValue = "--";
        
        if (user.weight && user.height) {
          const bmi = user.weight / ((user.height / 100) * (user.height / 100));
          bmiValue = bmi.toFixed(1);
          if (bmi >= 18.5 && bmi < 25) {
            bmiStatus = "مثالي";
            bmiColor = "text-green-500";
          } else if (bmi >= 25 && bmi < 30) {
            bmiStatus = "زائد";
            bmiColor = "text-orange-500";
          } else if (bmi >= 30) {
            bmiStatus = "سمنة";
            bmiColor = "text-red-500";
          } else {
            bmiStatus = "ناقص";
            bmiColor = "text-blue-500";
          }
        }

        return { ...user, avgScore, bmiStatus, bmiColor, bmiValue };
      })
      .filter((user: any) => (user.points || 0) > 0)
      .sort((a: any, b: any) => b.avgScore - a.avgScore);
  }, [rawData]);

  return (
    <div className="min-h-screen bg-background md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 md:py-16 space-y-10 pb-36">
        <header className="space-y-6 mx-2">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-[2rem] flex items-center justify-center text-yellow-600 shadow-2xl border-[6px] border-white dark:border-slate-800">
              <Trophy size={48} />
            </div>
            <div className="text-right">
              <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight text-right">قائمة العظماء</h1>
              <p className="text-muted-foreground text-lg md:text-2xl font-bold flex items-center justify-end gap-3 mt-2" dir="rtl">
                الترتيب بناءً على متوسط إنجازك في آخر 3 أيام
                <TrendingUp size={24} className="text-accent" />
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center p-24">
             <div className="w-20 h-20 border-[6px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
             <p className="font-black text-primary text-2xl animate-pulse">جاري تحديث القائمة...</p>
          </div>
        ) : (
          <div className="bg-card rounded-[3rem] shadow-2xl overflow-hidden border border-border mx-2">
            <div className="p-8 border-b border-border bg-secondary/10 text-right">
              <h2 className="text-2xl font-black text-primary">المتصدرون حالياً</h2>
            </div>
            <div className="divide-y divide-border">
              {leaders.length > 0 ? leaders.map((user: any, index: number) => (
                <div 
                  key={user.id} 
                  className={`p-6 md:p-10 flex items-center justify-between hover:bg-secondary/5 transition-all ${index < 3 ? 'bg-primary/[0.03]' : ''}`}
                >
                  <div className="text-right bg-primary/5 px-6 py-4 md:px-8 md:py-5 rounded-3xl order-last md:order-first shadow-inner min-w-[120px]">
                    <div className="flex items-center gap-2 justify-center">
                      <Star size={20} className="text-yellow-500" fill="currentColor" />
                      <p className="font-black text-primary text-2xl md:text-3xl">{user.avgScore}</p>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase text-center mt-2 tracking-widest">نقطة / يوم</p>
                  </div>

                  <div className="flex items-center gap-6 md:gap-10 flex-row-reverse flex-1 ml-4 overflow-hidden">
                    <div className="w-12 md:w-16 text-center font-black text-2xl md:text-4xl text-primary shrink-0">
                      {index === 0 ? <Medal className="text-yellow-500 w-12 h-12 md:w-16 md:h-16 mx-auto drop-shadow-lg" /> : 
                       index === 1 ? <Medal className="text-slate-400 w-12 h-12 md:w-16 md:h-16 mx-auto drop-shadow-md" /> : 
                       index === 2 ? <Medal className="text-amber-600 w-12 h-12 md:w-16 md:h-16 mx-auto drop-shadow-sm" /> : 
                       <span className="opacity-50">#{index + 1}</span>}
                    </div>
                    <Link href={`/user/${user.id}`} onClick={() => playSound('click')}>
                      <Avatar className="h-16 w-16 md:h-24 md:w-24 border-[4px] md:border-[6px] border-card shadow-xl flex items-center justify-center bg-white shrink-0 hover:scale-110 transition-transform">
                        <span className="text-4xl md:text-6xl">{user.avatar || "🐱"}</span>
                      </Avatar>
                    </Link>
                    <div className="text-right overflow-hidden flex-1">
                      <h3 className="font-black text-primary text-xl md:text-3xl truncate">{user.name}</h3>
                      <div className="flex flex-wrap items-center justify-end gap-4 mt-3">
                        <span className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black text-red-600 border border-red-100">
                          {user.likesCount || 0} <Heart size={14} fill="currentColor" />
                        </span>
                        <span className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full text-sm font-black text-orange-600 border border-orange-100">
                          {user.streak || 0} يوم <Flame size={18} className="text-orange-500" fill="currentColor" />
                        </span>
                        <span className={cn("flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-sm font-black shadow-sm", user.bmiColor)}>
                          <HeartPulse size={18} /> {user.bmiValue} ({user.bmiStatus})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-32 text-center text-muted-foreground font-black text-2xl italic">لا يوجد متسابقون نشطون حالياً.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
