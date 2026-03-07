
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Settings as SettingsIcon, Ruler, Weight, Calendar as CalendarIcon, LogOut, ArrowLeft, QrCode, Share2, Heart, Medal, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);
  
  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData, isLoading: isAllUsersLoading } = useDatabase(allUsersRef);
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(profileRef);

  const membershipInfo = useMemo(() => {
    if (!allUsersData || !user) return { rank: 0, total: 0 };
    if (userData?.name === 'admin') return { rank: 0, total: 0 };

    const usersArray = Object.values(allUsersData) as any[];
    const filteredUsers = usersArray.filter(u => u.name !== 'admin')
      .sort((a, b) => {
        const dateA = new Date(a.registrationDate || 0).getTime();
        const dateB = new Date(b.registrationDate || 0).getTime();
        return dateA - dateB;
      });
    
    const rank = filteredUsers.findIndex(u => u.id === user.uid) + 1;
    return { rank: rank > 0 ? rank : 1, total: filteredUsers.length };
  }, [allUsersData, user, userData]);

  const handleLogout = async () => {
    playSound('click');
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج" });
    router.replace('/login');
  };

  if (isUserLoading || isLoading || isAllUsersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">Careingo</p>
      </div>
    );
  }

  const getRankName = (points: number = 0) => {
    if (userData.name === 'admin') return "مدير النظام الرسمي 🛡️";
    if (points >= 10000) return "أسطورة كاري 👑";
    if (points >= 5000) return "بطل متميز 🏅";
    if (points >= 2000) return "مكافح محترف 🔥";
    if (points >= 500) return "عضو نشط 🐱";
    return "مبتدئ طموح 🌱";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-64 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-8">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-8 rounded-[2.5rem] shadow-xl border border-border">
          <Avatar className="w-28 h-24 md:w-36 md:h-32 border-4 border-secondary shadow-lg bg-white flex items-center justify-center shrink-0">
            <span className="text-6xl md:text-7xl">{userData.avatar || "🐱"}</span>
          </Avatar>
          
          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-4xl font-black text-primary">{userData.name || 'Careingo'}</h1>
              <span className="bg-primary/10 px-3 py-0.5 rounded-full text-[9px] font-black text-primary border border-primary/20">
                {userData.name === 'admin' ? "العضو رقم 0" : `العضو رقم ${membershipInfo.rank} من ${membershipInfo.total}`}
              </span>
            </div>
            <p className="text-muted-foreground font-bold text-sm italic">{getRankName(userData.points)}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 border border-primary/10">
                <CalendarIcon size={12} /> {userData.age || '--'} سنة
              </div>
              <div className="bg-accent/5 text-accent px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 border border-accent/10">
                <Ruler size={12} /> {userData.height || '--'} سم
              </div>
              <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 border border-orange-100">
                <Weight size={12} /> {userData.weight || '--'} كجم
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="outline" size="icon" className="rounded-2xl border-2 border-primary text-primary h-12 w-12 hover:bg-primary/5">
                <SettingsIcon size={20} />
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="text-destructive font-black h-12 rounded-2xl hover:bg-destructive/10">
              <LogOut className="ml-2" size={18} /> خروج
            </Button>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-primary flex items-center gap-2">
              <Medal className="text-accent" /> خزانة الأوسمة والإنجازات
            </h2>
            <span className="text-[10px] font-black text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {ALL_ACHIEVEMENTS.filter(a => a.criteria(userData)).length} / {ALL_ACHIEVEMENTS.length}
            </span>
          </div>
          
          <Card className="rounded-[2.5rem] bg-card p-6 border border-border shadow-xl">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {ALL_ACHIEVEMENTS.map((badge) => {
                const isEarned = badge.criteria(userData);
                return (
                  <div key={badge.id} className="group relative flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl transition-all duration-500 shadow-md border",
                      isEarned 
                        ? "bg-white border-primary/20 scale-100 rotate-0" 
                        : "bg-secondary/20 border-transparent opacity-20 grayscale scale-90"
                    )}>
                      {isEarned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <p className={cn(
                      "text-[7px] font-black text-center mt-1 transition-opacity",
                      isEarned ? "text-primary opacity-100" : "text-muted-foreground opacity-40"
                    )}>
                      {badge.name}
                    </p>
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 p-2 bg-slate-900 text-white rounded-lg text-[8px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {badge.description}
                      {!isEarned && <p className="text-accent mt-1">لم يُنجز بعد 🔒</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-[2.5rem] bg-card p-8 border border-border shadow-xl flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
               <QrCode size={36} />
             </div>
             <div className="space-y-1">
               <h3 className="font-black text-primary text-lg">شارك رحلتك</h3>
               <p className="text-[10px] text-muted-foreground font-bold">دع العالم يرى إنجازاتك في كارينجو!</p>
             </div>
             <Dialog open={showQr} onOpenChange={setShowQr}>
               <DialogTrigger asChild>
                 <Button className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90 font-black gap-2">
                   <Share2 size={18} /> إظهار الرمز
                 </Button>
               </DialogTrigger>
               <DialogContent className="rounded-[2.5rem] p-10 text-center" dir="rtl">
                 <DialogHeader><DialogTitle className="text-2xl font-black text-primary">رمز بروفايلك</DialogTitle></DialogHeader>
                 <div className="flex flex-col items-center gap-6 mt-4">
                   <div className="bg-white p-4 rounded-3xl border-4 border-accent shadow-inner">
                      <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://careingo.app/user/${user.uid}`} alt="QR" width={200} height={200} />
                   </div>
                   <p className="text-xs font-bold text-muted-foreground">امسح الرمز لزيارة بروفايلك العام 🐱</p>
                   <Button onClick={() => setShowQr(false)} className="w-full h-12 rounded-xl font-black">إغلاق</Button>
                 </div>
               </DialogContent>
             </Dialog>
          </Card>

          <Card className="rounded-[2.5rem] bg-primary text-white p-8 border-none shadow-xl flex flex-col items-center justify-center text-center gap-4 overflow-hidden relative">
             <Sparkles className="absolute -top-4 -left-4 opacity-20" size={100} />
             <Trophy size={48} className="relative z-10" />
             <div className="relative z-10">
               <h3 className="font-black text-xl">طريق الأساطير</h3>
               <p className="text-[10px] font-bold opacity-80 mt-1">أكمل كافة المسارات لتحصل على الوسام الماسي 💠</p>
             </div>
             <Link href="/streak" className="w-full relative z-10">
               <Button className="w-full h-12 rounded-2xl bg-white text-primary hover:bg-white/90 font-black">سجل الحماسة</Button>
             </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
