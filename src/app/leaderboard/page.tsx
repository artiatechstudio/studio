
"use client"

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { NavSidebar } from '@/components/nav-sidebar';
import { Trophy, Medal, Flame, Crown, Timer, Swords, Skull, AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild, limitToLast } from 'firebase/database';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Button } from '@/components/ui/button';

export default function LeaderboardPage() {
  const { database } = useFirebase();
  const [displayLimit, setDisplayLimit] = useState(20);
  
  const leadersQuery = useMemoFirebase(() => query(ref(database, 'users'), orderByChild('points'), limitToLast(100)), [database]);
  const { data: rawData, isLoading } = useDatabase(leadersQuery);

  const stats = useMemo(() => {
    if (!rawData) return { leaders: [], losers: [], totalLeaders: 0 };
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    const allUsers = Object.entries(rawData)
      .map(([id, val]: [string, any]) => ({ ...val, id }))
      .filter((u: any) => u.name !== 'admin');

    // استثناء المستخدمين الذين نقاطهم صفر
    const leaders = allUsers
      .filter((u: any) => (u.points || 0) > 0)
      .sort((a: any, b: any) => (b.points || 0) - (a.points || 0));

    const losers = allUsers
      .filter((user: any) => {
        const isLoss = user.lastChallengeLossDate === todayStr;
        const hasNotWonSince = !user.lastChallengeWinDate || user.lastChallengeWinDate < user.lastChallengeLossDate;
        return (user.lastStreakPenaltyDate === todayStr) || (isLoss && hasNotWonSince);
      })
      .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
      .slice(0, 20);

    return { 
      leaders: leaders.slice(0, displayLimit), 
      losers,
      totalLeaders: leaders.length 
    };
  }, [rawData, displayLimit]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center">
      <div className="relative w-32 h-32 animate-bounce">
        <Image src="/logo.png" alt="Loading" fill className="object-contain" priority />
      </div>
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-primary font-black text-xl animate-pulse">Careingo</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-24" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-8">
        <header className="space-y-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shadow-md border border-white"><Trophy size={20} /></div>
            <div className="text-right"><h1 className="text-xl font-black text-primary leading-tight">قائمة العظماء</h1><p className="text-muted-foreground text-[9px] font-bold">الأبطال النشطون فقط ⚡</p></div>
          </div>
        </header>

        <div className="space-y-10">
          <div className="bg-card rounded-[2.5rem] shadow-xl overflow-hidden border border-border mx-2">
            <div className="p-4 border-b border-border bg-secondary/5 text-right flex items-center justify-between flex-row-reverse px-6">
              <h2 className="text-[10px] font-black text-primary uppercase">أبطال المجتمع</h2>
              <Timer size={14} className="text-primary opacity-40" />
            </div>
            <div className="divide-y divide-border">
              {stats.leaders.length === 0 ? (
                <div className="p-20 text-center opacity-30 font-black">لا يوجد متصدرون حالياً ☕</div>
              ) : stats.leaders.map((user: any, index: number) => (
                <div key={user.id} className="p-3 flex items-center justify-between hover:bg-secondary/5 transition-all">
                  <div className="text-right bg-primary/5 px-2 py-1.5 rounded-xl order-last shrink-0 min-w-[85px] border border-primary/10">
                    <p className="font-black text-primary text-sm">{(user.points || 0).toLocaleString()}</p>
                    <p className="text-[7px] font-black text-muted-foreground uppercase text-center">إجمالي النقاط</p>
                  </div>
                  <div className="flex items-center gap-3 flex-row-reverse flex-1 ml-2 overflow-hidden">
                    <div className="w-6 text-center font-black text-sm text-primary shrink-0">
                      {index < 3 ? <Medal className={index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : "text-amber-600"} /> : <span className="opacity-40 text-[10px]">#{index + 1}</span>}
                    </div>
                    <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
                      <div className="h-10 w-10 border border-border shadow-sm flex items-center justify-center bg-white rounded-full overflow-hidden relative">
                        {user.avatar?.startsWith('data:image') || user.avatar?.startsWith('http') ? <img src={user.avatar} className="object-cover w-full h-full" alt={user.name} /> : <span className="text-xl">{user.avatar || "🐱"}</span>}
                      </div>
                    </Link>
                    <div className="text-right overflow-hidden flex-1 px-1">
                      <div className="flex items-center justify-end gap-1 mb-1"><h3 className="font-black text-primary text-[11px] truncate">{user.name}</h3>{(user.isPremium === 1 || user.name === 'admin') && <Crown size={10} className="text-yellow-500" fill="currentColor" />}</div>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <span className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 rounded-full text-[7px] font-black text-orange-600"><Flame size={8} fill="currentColor" /> {user.streak || 0}ي</span>
                        <span className="flex items-center gap-0.5 bg-blue-50 px-1 py-0.5 rounded-full text-[7px] font-black text-blue-600"><Swords size={8} /> {user.challengesWon || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {stats.totalLeaders > displayLimit && (
              <div className="p-4 border-t border-border bg-secondary/5">
                <Button 
                  onClick={() => { setDisplayLimit(prev => prev + 20); playSound('click'); }} 
                  variant="ghost" 
                  className="w-full font-black text-primary gap-2"
                >
                  <ChevronDown size={18} /> عرض المزيد من الأبطال
                </Button>
              </div>
            )}
          </div>

          <div className="bg-red-50/50 rounded-[2.5rem] shadow-lg overflow-hidden border border-red-100 mx-2">
            <div className="p-4 bg-red-600 text-white text-right flex items-center justify-between px-6">
              <div className="flex items-center gap-2"><Skull size={18} /><h2 className="text-sm font-black uppercase">جدار العار 🛑</h2></div>
              <p className="text-[8px] font-bold opacity-80">فقدوا الالتزام أو خسروا مبارزات</p>
            </div>
            <div className="p-4 space-y-3">
              {stats.losers.length > 0 ? stats.losers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-red-100">
                  <div className="flex flex-col items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100 min-w-[80px]">
                    <span className="text-[8px] font-black text-red-600 flex items-center gap-1">
                      {user.lastChallengeLossDate ? <Swords size={8}/> : <AlertCircle size={8}/>}
                      {user.lastChallengeLossDate ? "هزيمة مبارزة" : "عقوبة غياب"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${user.id}`} className="shrink-0">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl grayscale overflow-hidden border border-border">
                        {user.avatar?.startsWith('data:image') || user.avatar?.startsWith('http') ? <img src={user.avatar} className="object-cover w-full h-full opacity-50" alt={user.name} /> : <span className="opacity-50">{user.avatar || "🐱"}</span>}
                      </div>
                    </Link>
                    <div className="text-right"><p className="font-black text-red-900 text-xs">{user.name}</p><p className="text-[8px] font-bold text-red-400">سقط في {user.lastChallengeLossDate || user.lastStreakPenaltyDate}</p></div>
                  </div>
                </div>
              )) : <div className="p-10 text-center text-red-500 font-black text-xs italic">لا يوجد أحد في جدار العار حالياً.. الجميع يقاتل! 🔥</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
