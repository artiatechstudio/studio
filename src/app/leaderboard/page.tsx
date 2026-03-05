
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, Star, TrendingUp } from "lucide-react";
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild, limitToLast } from 'firebase/database';

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
        return { ...user, avgScore };
      })
      .filter((user: any) => (user.points || 0) > 0)
      .sort((a: any, b: any) => b.avgScore - a.avgScore);
  }, [rawData]);

  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 pb-32">
        <header className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-[1.5rem] flex items-center justify-center text-yellow-600 shadow-xl border-4 border-white dark:border-slate-800">
              <Trophy size={40} />
            </div>
            <div className="text-right">
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">قائمة العظماء</h1>
              <p className="text-muted-foreground text-sm md:text-lg font-bold flex items-center justify-end gap-2" dir="rtl">
                الترتيب بناءً على متوسط إنجازك في آخر 3 أيام
                <TrendingUp size={20} className="text-accent" />
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center p-20">
             <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="font-black text-primary text-xl">جاري تحديث القائمة...</p>
          </div>
        ) : (
          <div className="bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-border">
            <div className="p-6 border-b border-border bg-secondary/10 text-right">
              <h2 className="text-xl font-black text-primary">المتصدرون حالياً</h2>
            </div>
            <div className="divide-y divide-border">
              {leaders.length > 0 ? leaders.map((user: any, index: number) => (
                <div 
                  key={user.id} 
                  className={`p-5 md:p-8 flex items-center justify-between hover:bg-secondary/5 transition-all ${index < 3 ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div className="text-right bg-primary/5 px-4 py-2 md:px-6 md:py-3 rounded-2xl order-last md:order-first">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-500" fill="currentColor" />
                      <p className="font-black text-primary text-lg md:text-2xl">{user.avgScore}</p>
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center mt-1">نقطة/يوم</p>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6 flex-row-reverse">
                    <div className="w-8 md:w-10 text-center font-black text-xl md:text-2xl text-primary">
                      {index === 0 ? <Medal className="text-yellow-500 w-8 h-8 md:w-10 md:h-10 mx-auto" /> : 
                       index === 1 ? <Medal className="text-slate-400 w-8 h-8 md:w-10 md:h-10 mx-auto" /> : 
                       index === 2 ? <Medal className="text-amber-600 w-8 h-8 md:w-10 md:h-10 mx-auto" /> : 
                       index + 1}
                    </div>
                    <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 md:border-4 border-card shadow-lg flex items-center justify-center bg-white">
                      <span className="text-2xl md:text-3xl">{user.avatar || "🐱"}</span>
                    </Avatar>
                    <div className="text-right">
                      <h3 className="font-black text-primary text-base md:text-xl">{user.name}</h3>
                      <div className="flex items-center justify-end gap-2 text-xs md:text-sm text-muted-foreground font-bold">
                        <span className="flex items-center gap-1">{user.streak || 0} يوم <Flame size={14} className="text-orange-500" fill="currentColor" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-24 text-center text-muted-foreground font-black text-xl italic">لا يوجد متسابقون نشطون حالياً.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
