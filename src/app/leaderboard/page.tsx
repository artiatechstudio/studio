"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, Flame } from "lucide-react";
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, query, orderByChild, limitToLast } from 'firebase/database';

export default function LeaderboardPage() {
  const { database } = useFirebase();
  
  // جلب أفضل 50 مستخدم حسب النقاط
  const leadersQuery = useMemoFirebase(() => {
    return query(ref(database, 'users'), orderByChild('points'), limitToLast(50));
  }, [database]);

  const { data: rawData, isLoading } = useDatabase(leadersQuery);

  // تحويل البيانات من أوبجكت إلى مصفوفة مرتبة تنازلياً
  const leaders = rawData ? Object.values(rawData).sort((a: any, b: any) => (b.points || 0) - (a.points || 0)) : [];

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12 pb-32">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shadow-xl border-4 border-white">
              <Trophy size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary leading-tight">لوحة المتصدرين</h1>
              <p className="text-muted-foreground font-medium">تنافس مع أصدقاء كاري لتكون الأفضل!</p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center p-20 font-black text-primary animate-pulse">جاري تحديث الترتيب...</div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border">
            <div className="p-8 border-b border-border bg-secondary/10">
              <h2 className="text-2xl font-black text-primary">الترتيب العالمي</h2>
            </div>
            <div className="divide-y divide-border">
              {leaders.length > 0 ? leaders.map((user: any, index: number) => (
                <div 
                  key={user.id} 
                  className={`p-6 flex items-center justify-between hover:bg-secondary/10 transition-colors ${index < 3 ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-8 text-center font-black text-xl text-primary">
                      {index === 0 ? <Medal className="text-yellow-500 mx-auto" /> : 
                       index === 1 ? <Medal className="text-slate-400 mx-auto" /> : 
                       index === 2 ? <Medal className="text-amber-600 mx-auto" /> : 
                       index + 1}
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                      <AvatarImage src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`} />
                      <AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-primary text-lg">{user.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {user.streak || 0} يوم</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-primary text-xl">{user.points?.toLocaleString() || 0}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">نقطة</p>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center text-muted-foreground font-bold">لا يوجد متسابقون بعد. كن الأول!</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}