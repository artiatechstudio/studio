
"use client"

import React, { useMemo, use } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useFirebase, useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { ref, runTransaction, push, serverTimestamp } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Trophy, Flame, Heart, ArrowLeft, Star, HeartPulse, User as UserIcon, Crown, Medal, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';

export default function UserPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: currentUser } = useUser();
  const { database } = useFirebase();
  const router = useRouter();

  const userRef = useMemoFirebase(() => ref(database, `users/${id}`), [database, id]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  const membershipInfo = useMemo(() => {
    if (!allUsersData || !id) return { rank: 0, total: 0 };
    if (userData?.name === 'admin') return { rank: 0, total: 0 };

    const usersArray = Object.values(allUsersData) as any[];
    const filteredUsers = usersArray.filter(u => u.name !== 'admin')
      .sort((a, b) => {
        const dateA = new Date(a.registrationDate || 0).getTime();
        const dateB = new Date(b.registrationDate || 0).getTime();
        return dateA - dateB;
      });
    
    const rank = filteredUsers.findIndex(u => u.id === id) + 1;
    return { rank: rank > 0 ? rank : 1, total: filteredUsers.length };
  }, [allUsersData, id, userData]);

  const earnedBadges = useMemo(() => {
    if (!userData) return [];
    return ALL_ACHIEVEMENTS.filter(badge => badge.criteria(userData));
  }, [userData]);

  const handleToggleLike = () => {
    if (!currentUser || !id) return;
    if (currentUser.uid === id) {
      toast({ title: "لا يمكنك الإعجاب بملفك الشخصي!" });
      return;
    }

    playSound('click');
    const userLikesRef = ref(database, `users/${id}/likesCount`);
    const likedByRef = ref(database, `users/${id}/likedBy/${currentUser.uid}`);
    const targetNotifRef = ref(database, `users/${id}/notifications`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(userLikesRef, (count) => (count || 1) - 1);
        toast({ title: "تم إلغاء الإعجاب" });
        return null;
      } else {
        runTransaction(userLikesRef, (count) => (count || 0) + 1);
        push(targetNotifRef, {
          type: 'like',
          title: 'إعجاب جديد! ❤️',
          message: `لقد أعجب أحدهم بملفك الشخصي.`,
          fromId: currentUser.uid,
          isRead: false,
          timestamp: serverTimestamp()
        });
        toast({ title: "تم إرسال إعجاب! ❤️" });
        playSound('success');
        return true;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-black text-primary mb-4">هذا المستخدم غير موجود!</h1>
        <Button onClick={() => router.back()} className="rounded-2xl font-black">العودة</Button>
      </div>
    );
  }

  const bmiValue = userData.weight && userData.height 
    ? (userData.weight / ((userData.height / 100) * (userData.height / 100))).toFixed(1)
    : '--';

  const isLikedByMe = userData.likedBy?.[currentUser?.uid || ''];
  const isImageAvatar = userData.avatar && (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:image'));

  const getRankName = (points: number = 0) => {
    if (userData.name === 'admin') return "مدير النظام الرسمي 🛡️";
    if (points >= 10000) return "أسطورة خالدة 👑";
    if (points >= 5000) return "نخبة كاري 🏅";
    if (points >= 2000) return "بطل صاعد 🔥";
    if (points >= 500) return "مكافح مجتهد 🐱";
    return "مكتشف جديد 🌱";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 md:py-10 space-y-6">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border relative overflow-hidden mx-2">
          <div className="absolute top-3 left-3 z-10">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
               <ArrowLeft size={16} className="rotate-180" />
            </Button>
          </div>
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-secondary shadow-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
            {isImageAvatar ? (
              <img src={userData.avatar} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-5xl md:text-6xl">{userData.avatar || "🐱"}</span>
            )}
          </Avatar>
          <div className="flex-1 text-center md:text-right space-y-2 z-10 overflow-hidden w-full">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
              <div className="flex items-center gap-1 justify-center md:justify-start">
                <h1 className="text-xl md:text-3xl font-black text-primary leading-tight truncate max-w-[200px]">{userData.name}</h1>
                {(userData.isPremium === 1 || userData.name === 'admin') && <Crown size={16} className="text-yellow-500 shrink-0" fill="currentColor" />}
              </div>
              <Button onClick={handleToggleLike} variant="ghost" className={cn("bg-red-50 px-3 py-1 h-7 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1", isLikedByMe ? "text-red-600" : "text-gray-400 grayscale")}>
                 {userData.likesCount || 0} <Heart size={12} fill={isLikedByMe ? "currentColor" : "none"} />
              </Button>
            </div>
            <p className="text-muted-foreground font-black text-xs bg-secondary/30 inline-block px-3 py-0.5 rounded-full italic truncate">
               {getRankName(userData.points)}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-black text-[9px] border border-primary/10">
                {userData.name === 'admin' ? "العضو رقم 0" : `العضو رقم ${membershipInfo.rank}`}
              </div>
              <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-orange-100 flex items-center gap-1"><Flame size={10} fill="currentColor" /> {userData.streak || 0}ي</div>
              <div className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-yellow-100 flex items-center gap-1"><Star size={10} fill="currentColor" /> {userData.points?.toLocaleString() || 0}ن</div>
            </div>
          </div>
        </header>

        <section className="space-y-4 mx-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-primary flex items-center gap-2">
              <Medal size={20} className="text-accent" /> خزانة الأوسمة والميداليات
            </h2>
            <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full">
              {earnedBadges.length} وسام مستحق
            </span>
          </div>
          
          <Card className="rounded-[2rem] bg-card p-5 border border-border shadow-lg">
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center group relative">
                    <div className="w-12 h-12 rounded-xl bg-white border border-primary/10 shadow-sm flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                      {badge.icon}
                    </div>
                    <p className="text-[7px] font-black text-primary mt-1 text-center">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 opacity-30">
                <Lock size={32} className="mx-auto" />
                <p className="text-[10px] font-black italic">لا توجد أوسمة معلنة لهذا المستخدم حالياً.</p>
              </div>
            )}
          </Card>
        </section>
        
        <div className="flex justify-center mt-6 px-2">
          <Link href={`/chat/${id}`} onClick={() => playSound('click')} className="w-full max-w-sm">
            <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-sm font-black shadow-lg gap-2">دردشة مع {userData.name} 💬</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
