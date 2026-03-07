
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Settings as SettingsIcon, Ruler, Weight, Calendar as CalendarIcon, LogOut, ArrowLeft, QrCode, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);
  const [cachedProfile, setCachedProfile] = useState<any>(null);
  
  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData, isLoading: isAllUsersLoading } = useDatabase(allUsersRef);
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: profile, isLoading } = useDatabase(profileRef);

  useEffect(() => {
    const cache = localStorage.getItem('careingo_user_data');
    if (cache) {
      try {
        setCachedProfile(JSON.parse(cache));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('careingo_user_data', JSON.stringify(profile));
      setCachedProfile(profile);
    }
  }, [profile]);

  const membershipInfo = useMemo(() => {
    if (!allUsersData || !user) return { rank: 0, total: 0 };
    
    const usersArray = Object.values(allUsersData) as any[];
    const sortedUsers = usersArray.sort((a, b) => {
      const dateA = new Date(a.registrationDate || 0).getTime();
      const dateB = new Date(b.registrationDate || 0).getTime();
      return dateA - dateB;
    });
    
    const rank = sortedUsers.findIndex(u => u.id === user.uid) + 1;
    return { rank: rank > 0 ? rank : 1, total: sortedUsers.length };
  }, [allUsersData, user]);

  const handleLogout = async () => {
    playSound('click');
    localStorage.removeItem('careingo_user_data'); // تنظيف الكاش عند الخروج
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج" });
    router.replace('/login');
  };

  const handleShare = () => {
    playSound('click');
    setShowQr(true);
  };

  if (isUserLoading || (isLoading && !cachedProfile) || isAllUsersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">كاري ينتظرك بشوق...</p>
      </div>
    );
  }

  const userData = profile || cachedProfile || {};

  const getRankName = (points: number = 0) => {
    if (points >= 10000) return "أسطورة كاري 👑";
    if (points >= 5000) return "بطل متميز 🏅";
    if (points >= 2000) return "مكافح محترف 🔥";
    if (points >= 500) return "عضو نشط 🐱";
    return "مبتدئ طموح 🌱";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-64 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex flex-col md:flex-row items-center gap-8 bg-card p-10 rounded-[2.5rem] shadow-xl border border-border">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-8 border-secondary shadow-xl bg-white flex items-center justify-center shrink-0">
            <span className="text-7xl md:text-8xl">{userData.avatar || "🐱"}</span>
          </Avatar>
          
          <div className="flex-1 text-center md:text-right space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-5xl font-black text-primary">{userData.name || 'جارِ التحميل'}</h1>
              <span className="bg-primary/10 px-4 py-1 rounded-full text-xs font-black text-primary border border-primary/20">
                العضو رقم {membershipInfo.rank} من {membershipInfo.total}
              </span>
              <span className="bg-red-50 px-4 py-1 rounded-full text-xs font-black text-red-600 border border-red-100 flex items-center gap-1">
                 {userData.likesCount || 0} إعجاب <Heart size={14} fill="currentColor" />
              </span>
            </div>
            <p className="text-muted-foreground font-bold text-lg italic">{getRankName(userData.points)}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-primary/10 text-primary dark:bg-primary/20 px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-primary/10">
                <CalendarIcon size={18} /> {userData.age || '--'} سنة
              </div>
              <div className="bg-accent/10 text-accent dark:bg-accent/20 px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-accent/10">
                <Ruler size={18} /> {userData.height || '--'} سم
              </div>
              <div className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-orange-200 dark:border-orange-800">
                <Weight size={18} /> {userData.weight || '--'} كجم
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/settings" onClick={() => playSound('click')}>
              <Button variant="outline" className="w-full rounded-2xl border-2 border-primary text-primary font-black px-6 py-4 h-auto hover:bg-primary/5 transition-all">
                <SettingsIcon className="ml-2" /> الإعدادات
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="text-destructive font-black hover:bg-destructive/10">
              <LogOut className="ml-2" size={18} /> تسجيل الخروج
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-black text-primary flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Trophy className="text-accent" /> الأوسمة المكتسبة
                </div>
                <Link href="/streak" onClick={() => playSound('click')}>
                  <Button variant="link" className="text-accent font-black">سجل الحماسة <ArrowLeft size={16} className="mr-1 rotate-180" /></Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-4">
              {userData.badges && userData.badges.length > 0 ? userData.badges.map((badge: string, i: number) => (
                <div key={i} className="bg-secondary/40 dark:bg-secondary/20 px-6 py-3 rounded-2xl font-black text-primary dark:text-primary-foreground shadow-sm border border-border">
                  {badge}
                </div>
              )) : (
                <p className="text-muted-foreground font-bold italic">لم تكتسب أوسمة بعد، استمر في التقدم! 🔥</p>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border flex flex-col items-center justify-center text-center gap-6">
             <div className="w-20 h-20 bg-accent/10 rounded-[1.5rem] flex items-center justify-center text-accent">
               <QrCode size={48} />
             </div>
             <div className="space-y-1">
               <h3 className="font-black text-primary text-xl">شارك التطبيق</h3>
               <p className="text-xs text-muted-foreground font-bold">دع أصدقاءك يصورون الرمز للانضمام!</p>
             </div>
             <Dialog open={showQr} onOpenChange={setShowQr}>
               <DialogTrigger asChild>
                 <Button onClick={handleShare} className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90 font-black gap-2">
                   <Share2 size={18} /> إظهار الرمز
                 </Button>
               </DialogTrigger>
               <DialogContent className="rounded-[3rem] p-10 text-center sm:max-w-md">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-black text-primary">ادعُ أصدقاءك</DialogTitle>
                 </DialogHeader>
                 <div className="flex flex-col items-center gap-6 mt-4">
                   <div className="bg-white p-6 rounded-[2rem] shadow-inner border-4 border-accent">
                      <Image 
                        src="/qr.png" 
                        alt="QR Code" 
                        width={250} 
                        height={250} 
                        className="rounded-lg"
                      />
                   </div>
                   <p className="font-bold text-muted-foreground">اجعل أصدقاءك يصورون هذا الرمز للتحميل المباشر 🐱</p>
                   <Button onClick={() => setShowQr(false)} className="w-full h-12 rounded-2xl font-black">إغلاق</Button>
                 </div>
               </DialogContent>
             </Dialog>
          </Card>
        </div>
      </div>
    </div>
  );
}
