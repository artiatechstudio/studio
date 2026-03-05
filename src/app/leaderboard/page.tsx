
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, Star } from "lucide-react";
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
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-[2rem] flex items-center justify-center text-yellow-600 shadow-2xl shadow-yellow-500/20 border-4 border-white">
              <Trophy size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">قائمة العظماء</h1>
              <p className="text-muted-foreground text-lg font-bold">تنافس لتكون بين النخبة في مجتمع كاري!</p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center p-20">
             <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="font-black text-primary text-xl">جاري تحديث قائمة المتصدرين...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/5 overflow-hidden border border-white">
            <div className="p-8 border-b border-secondary/50 bg-secondary/10">
              <h2 className="text-2xl font-black text-primary">الترتيب العالمي</h2>
            </div>
            <div className="divide-y divide-secondary/30">
              {leaders.length > 0 ? leaders.map((user: any, index: number) => (
                <div 
                  key={user.id} 
                  className={`p-6 md:p-8 flex items-center justify-between hover:bg-secondary/10 transition-all ${index < 3 ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 text-center font-black text-2xl text-primary">
                      {index === 0 ? <Medal className="text-yellow-500 w-10 h-10 mx-auto" /> : 
                       index === 1 ? <Medal className="text-slate-400 w-10 h-10 mx-auto" /> : 
                       index === 2 ? <Medal className="text-amber-600 w-10 h-10 mx-auto" /> : 
                       index + 1}
                    </div>
                    <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                      <AvatarImage src={user.avatar || `https://picsum.photos/seed/${user.id}/150/150`} />
                      <AvatarFallback className="bg-primary text-white font-black">{user.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-black text-primary text-xl">{user.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
                        <span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" fill="currentColor" /> {user.streak || 0} يوم</span>
                        <span className="text-xs opacity-60">العضو #{user.registrationRank || '?'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left bg-primary/5 px-6 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-yellow-500" fill="currentColor" />
                      <p className="font-black text-primary text-2xl">{user.points?.toLocaleString() || 0}</p>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center mt-1">نقطة</p>
                  </div>
                </div>
              )) : (
                <div className="p-24 text-center text-muted-foreground font-black text-xl italic">لا يوجد متسابقون بعد. كن أول من يتصدر القائمة!</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
