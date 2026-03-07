
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, Star, TrendingUp, Heart, Skull, AlertCircle, Crown } from "lucide-react";
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild, limitToLast } from 'firebase/database';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';

export default function LeaderboardPage() {
  const { database } = useFirebase();
  
  // جلب أفضل 200 مستخدم بناءً على النقاط الكلية لضمان المزامنة اللحظية
  const leadersQuery = useMemoFirebase(() => {
    return query(ref(database, 'users'), orderByChild('points'), limitToLast(200));
  }, [database]);

  const { data: rawData, isLoading } = useDatabase(leadersQuery);

  const stats = useMemo(() => {
    if (!rawData) return { leaders: [], losers: [] };
    
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toLocaleDateString('en-CA');

    const allUsers = Object.values(rawData)
      .filter((u: any) => u.name !== 'admin')
      .map((user: any) => {
        let bmiColor = "text-gray-400";
        let bmiValue = "--";
        let bmiStatus = "غير محدد";
        
        if (user.weight && user.height) {
          const bmi = user.weight / ((user.height / 100) * (user.height / 100));
          bmiValue = bmi.toFixed(1);
          if (bmi >= 18.5 && bmi < 25) { bmiColor = "text-green-500"; bmiStatus = "مثالي"; }
          else if (bmi >= 25 && bmi < 30) { bmiColor = "text-orange-500"; bmiStatus = "زيادة"; }
          else if (bmi >= 30) { bmiColor = "text-red-500"; bmiStatus = "سمنة"; }
          else { bmiColor = "text-blue-500"; bmiStatus = "نحافة"; }
        }

        return { ...user, bmiColor, bmiValue, bmiStatus };
      });

    // المتصدرون: ترتيب تنازلي حسب النقاط الكلية
    const leaders = [...allUsers]
      .filter((user: any) => (user.points || 0) > 0)
      .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
      .slice(0, 100);

    // جدار العار: من تم معاقبتهم في آخر 3 أيام
    const losers = allUsers
      .filter((user: any) => user.lastStreakPenaltyDate && user.lastStreakPenaltyDate >= threeDaysAgoStr)
      .sort((a: any, b: any) => b.lastStreakPenaltyDate.localeCompare(a.lastStreakPenaltyDate))
      .slice(0, 20);

    return { leaders, losers };
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">Careingo</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-24" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-8">
        <header className="space-y-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600 shadow-md border border-white dark:border-slate-800">
              <Trophy size={20} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">قائمة العظماء</h1>
              <p className="text-muted-foreground text-[9px] font-bold flex items-center justify-end gap-1 mt-0.5">
                ترتيب الأبطال حسب النقاط الكلية 🏆
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-10">
          <div className="bg-card rounded-[2.5rem] shadow-xl overflow-hidden border border-border mx-2">
            <div className="p-3 border-b border-border bg-secondary/5 text-right flex items-center justify-between flex-row-reverse px-6">
              <h2 className="text-[10px] font-black text-primary uppercase">المتصدرون حالياً</h2>
              <Star size={12} className="text-yellow-500" />
            </div>
            <div className="divide-y divide-border">
              {stats.leaders.length > 0 ? stats.leaders.map((user: any, index: number) => {
                const isAvatarUrl = user.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('http');
                const isPremium = user.isPremium === 1 || user.name === 'admin';
                return (
                  <div 
                    key={user.id} 
                    className={`p-3 flex items-center justify-between hover:bg-secondary/5 transition-all ${index < 3 ? 'bg-primary/[0.02]' : ''}`}
                  >
                    {/* عرض النقاط الكلية بوضوح */}
                    <div className="text-right bg-primary/5 px-2 py-1.5 rounded-xl order-last shrink-0 min-w-[75px] border border-primary/10">
                      <div className="flex items-center gap-1 justify-center">
                        <Star size={10} className="text-yellow-500" fill="currentColor" />
                        <p className="font-black text-primary text-sm">{(user.points || 0).toLocaleString()}</p>
                      </div>
                      <p className="text-[7px] font-black text-muted-foreground uppercase text-center tracking-tighter leading-none">نقطة كلية</p>
                    </div>

                    <div className="flex items-center gap-3 flex-row-reverse flex-1 ml-2 overflow-hidden">
                      <div className="w-6 text-center font-black text-sm text-primary shrink-0">
                        {index === 0 ? <Medal className="text-yellow-500 w-6 h-6 mx-auto" /> : 
                         index === 1 ? <Medal className="text-slate-400 w-6 h-6 mx-auto" /> : 
                         index === 2 ? <Medal className="text-amber-600 w-6 h-6 mx-auto" /> : 
                         <span className="opacity-40 text-[10px]">#{index + 1}</span>}
                      </div>
                      
                      <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
                        <div className="h-10 w-10 border border-border shadow-sm flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform overflow-hidden relative">
                          {isAvatarUrl ? (
                            <Image src={user.avatar} alt={user.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <span className="text-xl">{user.avatar || "🐱"}</span>
                          )}
                        </div>
                      </Link>

                      <div className="text-right overflow-hidden flex-1 px-1">
                        <div className="flex items-center justify-end gap-1 mb-1">
                          <h3 className="font-black text-primary text-[11px] truncate leading-none">{user.name}</h3>
                          {isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <span className="flex items-center gap-0.5 bg-red-50 px-1 py-0.5 rounded-full text-[7px] font-black text-red-600 border border-red-100">
                            {user.likesCount || 0} <Heart size={8} fill="currentColor" />
                          </span>
                          <span className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 rounded-full text-[7px] font-black text-orange-600 border border-orange-100">
                            {user.streak || 0}ي <Flame size={8} fill="currentColor" />
                          </span>
                          <div className={cn("flex flex-col items-center bg-secondary/50 px-1.5 py-0.5 rounded-lg border border-border/20 min-w-[35px]", user.bmiColor)}>
                             <span className="text-[8px] font-black leading-none">{user.bmiValue}</span>
                             <span className="text-[6px] font-black uppercase opacity-80">{user.bmiStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-16 text-center text-muted-foreground font-black text-xs italic">لا يوجد متسابقون نشطون حالياً.</div>
              )}
            </div>
          </div>

          {/* جدار العار - مخصص لآخر 3 أيام فقط */}
          <div className="bg-red-50/50 rounded-[2.5rem] shadow-lg overflow-hidden border border-red-100 mx-2">
            <div className="p-4 bg-red-600 text-white text-right flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Skull size={18} />
                <h2 className="text-sm font-black uppercase tracking-widest">جدار العار 🛑</h2>
              </div>
              <p className="text-[8px] font-bold opacity-80">فقدوا الالتزام في آخر 3 أيام</p>
            </div>
            <div className="p-4 space-y-3">
              {stats.losers.length > 0 ? stats.losers.map((user: any) => {
                const isAvatarUrl = user.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('http');
                const isPremium = user.isPremium === 1 || user.name === 'admin';
                return (
                  <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-red-100 shadow-sm">
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                      <AlertCircle size={12} className="text-red-600" />
                      <span className="text-[10px] font-black text-red-600">عقوبة غياب</span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl grayscale overflow-hidden relative">
                          {isAvatarUrl ? (
                            <Image src={user.avatar} alt={user.name} width={40} height={40} className="object-cover w-full h-full opacity-50" unoptimized />
                          ) : (
                            <span className="opacity-50">{user.avatar || "🐱"}</span>
                          )}
                        </div>
                      </Link>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <p className="font-black text-red-900 text-xs">{user.name}</p>
                          {isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                        </div>
                        <p className="text-[8px] font-bold text-red-400">انكسرت الحماسة في {user.lastStreakPenaltyDate}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-10 text-center text-red-300 font-bold text-[10px]">لا يوجد أحد في جدار العار حالياً.. الجميع يقاتل! 🔥</div>
              )}
            </div>
            <div className="bg-red-100 p-2 text-center">
              <p className="text-[7px] font-black text-red-600 uppercase">الالتزام هو الفارق الوحيد بين العظيم والراسب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
