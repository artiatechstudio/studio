
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Settings as SettingsIcon, Ruler, Weight, Calendar as CalendarIcon, LogOut, ArrowLeft, QrCode, Share2, Heart, Medal, Lock, Sparkles, Users, Crown } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);
  
  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData, isLoading: isAllUsersLoading } = useDatabase(allUsersRef);
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const membershipInfo = useMemo(() => {
    if (!allUsersData || !user || !userData) return { rank: 0, total: 0 };
    if (userData.name === 'admin') return { rank: 0, total: 0 };

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

  if (isUserLoading || isDataLoading || isAllUsersLoading || (!user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">Careingo</p>
      </div>
    );
  }

  if (!userData) return null;

  const getRankName = (points: number = 0) => {
    if (userData.name === 'admin') return "مدير النظام الرسمي 🛡️";
    if (points >= 10000) return "أسطورة كاري 👑";
    if (points >= 5000) return "بطل متميز 🏅";
    if (points >= 2000) return "مكافح محترف 🔥";
    if (points >= 500) return "عضو نشط 🐱";
    return "مبتدئ طموح 🌱";
  };

  const isImageAvatar = userData.avatar && (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:image'));

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-64 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-8">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-8 rounded-[2.5rem] shadow-xl border border-border">
          <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-secondary shadow-lg bg-white flex items-center justify-center shrink-0 overflow-hidden rounded-[2.5rem]">
            {isImageAvatar ? (
              <img src={userData.avatar} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-6xl md:text-7xl">{userData.avatar || "🐱"}</span>
            )}
          </Avatar>
          
          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-4xl font-black text-primary">{userData.name || 'Careingo'}</h1>
                {(userData.isPremium === 1 || userData.name === 'admin') && <Crown size={24} className="text-yellow-500" fill="currentColor" />}
              </div>
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
            <Dialog open={showQr} onOpenChange={setShowQr}>
              <DialogTrigger asChild>
                <Button onClick={() => playSound('click')} variant="outline" size="icon" className="rounded-2xl border-2 border-primary text-primary h-12 w-12 hover:bg-primary/5">
                  <QrCode size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[3rem] p-10 text-center max-w-sm" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary text-center">رمز QR الخاص بك</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 mt-4">
                  <div className="w-64 h-64 bg-white p-4 rounded-[2rem] shadow-inner border-4 border-primary/10 relative overflow-hidden flex items-center justify-center">
                    <Image 
                      src="/qr.png" 
                      alt="QR Code" 
                      width={256} 
                      height={256} 
                      className="object-contain"
                      priority
                    />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed text-center px-4">
                    امسح الرمز ضوئياً لمشاركة ملفك الشخصي مع أصدقائك في مجتمع كارينجو! 🐱✨
                  </p>
                  <Button onClick={() => setShowQr(false)} className="w-full h-12 rounded-xl font-black bg-primary">إغلاق</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/settings">
              <Button onClick={() => playSound('click')} variant="outline" size="icon" className="rounded-2xl border-2 border-primary text-primary h-12 w-12 hover:bg-primary/5">
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
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
