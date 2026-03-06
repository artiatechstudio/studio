
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, Star, TrendingUp, Heart } from "lucide-react";
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

        let bmiColor = "text-gray-400";
        let bmiValue = "--";
        
        if (user.weight && user.height) {
          const bmi = user.weight / ((user.height / 100) * (user.height / 100));
          bmiValue = bmi.toFixed(1);
          if (bmi >= 18.5 && bmi < 25) bmiColor = "text-green-500";
          else if (bmi >= 25 && bmi < 30) bmiColor = "text-orange-500";
          else if (bmi >= 30) bmiColor = "text-red-500";
          else bmiColor = "text-blue-500";
        }

        return { ...user, avgScore, bmiColor, bmiValue };
      })
      .filter((user: any) => (user.points || 0) > 0)
      .sort((a: any, b: any) => b.avgScore - a.avgScore);
  }, [rawData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-24" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="space-y-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600 shadow-md border border-white dark:border-slate-800">
              <Trophy size={20} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">قائمة العظماء</h1>
              <p className="text-muted-foreground text-[9px] font-bold flex items-center justify-end gap-1 mt-0.5">
                متوسط إنجاز آخر 3 أيام
                <TrendingUp size={10} className="text-accent" />
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center p-12">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="font-black text-primary text-xs animate-pulse">جاري التحميل...</p>
          </div>
        ) : (
          <div className="bg-card rounded-[2rem] shadow-xl overflow-hidden border border-border mx-2">
            <div className="p-3 border-b border-border bg-secondary/5 text-right">
              <h2 className="text-[10px] font-black text-primary uppercase">المتصدرون حالياً</h2>
            </div>
            <div className="divide-y divide-border">
              {leaders.length > 0 ? leaders.map((user: any, index: number) => (
                <div 
                  key={user.id} 
                  className={`p-3 flex items-center justify-between hover:bg-secondary/5 transition-all ${index < 3 ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div className="text-right bg-primary/5 px-2 py-1.5 rounded-xl order-last shrink-0 min-w-[60px]">
                    <div className="flex items-center gap-1 justify-center">
                      <Star size={10} className="text-yellow-500" fill="currentColor" />
                      <p className="font-black text-primary text-sm">{user.avgScore}</p>
                    </div>
                    <p className="text-[7px] font-black text-muted-foreground uppercase text-center tracking-tighter leading-none">نقطة</p>
                  </div>

                  <div className="flex items-center gap-3 flex-row-reverse flex-1 ml-2 overflow-hidden">
                    <div className="w-6 text-center font-black text-sm text-primary shrink-0">
                      {index === 0 ? <Medal className="text-yellow-500 w-6 h-6 mx-auto" /> : 
                       index === 1 ? <Medal className="text-slate-400 w-6 h-6 mx-auto" /> : 
                       index === 2 ? <Medal className="text-amber-600 w-6 h-6 mx-auto" /> : 
                       <span className="opacity-40 text-[10px]">#{index + 1}</span>}
                    </div>
                    <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
                      <Avatar className="h-9 w-9 border border-border shadow-sm flex items-center justify-center bg-white hover:scale-105 transition-transform">
                        <span className="text-lg">{user.avatar || "🐱"}</span>
                      </Avatar>
                    </Link>
                    <div className="text-right overflow-hidden flex-1 px-1">
                      <h3 className="font-black text-primary text-[11px] truncate leading-none mb-1">{user.name}</h3>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <span className="flex items-center gap-0.5 bg-red-50 px-1 py-0.5 rounded-full text-[7px] font-black text-red-600 border border-red-100">
                          {user.likesCount || 0} <Heart size={8} fill="currentColor" />
                        </span>
                        <span className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 rounded-full text-[7px] font-black text-orange-600 border border-orange-100">
                          {user.streak || 0}ي <Flame size={8} className="text-orange-500" fill="currentColor" />
                        </span>
                        <span className={cn("flex items-center gap-0.5 bg-secondary px-1 py-0.5 rounded-full text-[7px] font-black", user.bmiColor)}>
                          {user.bmiValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-16 text-center text-muted-foreground font-black text-xs italic">لا يوجد متسابقون نشطون حالياً.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
