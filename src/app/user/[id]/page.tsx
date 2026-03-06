
"use client"

import React, { use, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useFirebase, useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { ref, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Trophy, Flame, Heart, ArrowLeft, Star, HeartPulse, ShieldCheck, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
    const usersArray = Object.values(allUsersData) as any[];
    const sortedUsers = usersArray.sort((a, b) => {
      const dateA = new Date(a.registrationDate || 0).getTime();
      const dateB = new Date(b.registrationDate || 0).getTime();
      return dateA - dateB;
    });
    const rank = sortedUsers.findIndex(u => u.id === id) + 1;
    return { rank: rank > 0 ? rank : 1, total: sortedUsers.length };
  }, [allUsersData, id]);

  const handleToggleLike = () => {
    if (!currentUser || !id) return;
    if (currentUser.uid === id) {
      toast({ title: "لا يمكنك الإعجاب بملفك الشخصي!" });
      return;
    }

    playSound('click');
    const userLikesRef = ref(database, `users/${id}/likesCount`);
    const likedByRef = ref(database, `users/${id}/likedBy/${currentUser.uid}`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(userLikesRef, (count) => (count || 1) - 1);
        toast({ title: "تم إلغاء الإعجاب" });
        return null;
      } else {
        runTransaction(userLikesRef, (count) => (count || 0) + 1);
        toast({ title: "تم إرسال إعجاب! ❤️" });
        playSound('success');
        return true;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-6xl animate-bounce">🐱</div>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-sm animate-pulse uppercase tracking-tighter">جاري التحميل...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="text-8xl mb-6">👻</div>
        <h1 className="text-2xl font-black text-primary mb-4">هذا المستخدم غير موجود!</h1>
        <Button onClick={() => router.back()} className="rounded-2xl font-black">العودة</Button>
      </div>
    );
  }

  const bmiValue = userData.weight && userData.height 
    ? (userData.weight / ((userData.height / 100) * (userData.height / 100))).toFixed(1)
    : '--';

  const getBmiStatus = (val: string) => {
    const v = parseFloat(val);
    if (isNaN(v)) return { label: "غير محدد", color: "text-muted-foreground" };
    if (v < 18.5) return { label: "نحافة", color: "text-blue-500" };
    if (v < 25) return { label: "مثالي", color: "text-green-500" };
    if (v < 30) return { label: "زيادة", color: "text-orange-500" };
    return { label: "سمنة", color: "text-red-500" };
  };

  const bmiStatus = getBmiStatus(bmiValue);
  const isLikedByMe = userData.likedBy?.[currentUser?.uid || ''];

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 md:py-10 space-y-6">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2rem] shadow-xl border border-border relative overflow-hidden group mx-2">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
          
          <div className="absolute top-3 left-3 z-10">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
               <ArrowLeft size={16} className="rotate-180" />
            </Button>
          </div>

          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-secondary shadow-lg bg-white flex items-center justify-center shrink-0">
            <span className="text-5xl md:text-6xl">{userData.avatar || "🐱"}</span>
          </Avatar>
          
          <div className="flex-1 text-center md:text-right space-y-2 z-10 overflow-hidden w-full">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl md:text-3xl font-black text-primary leading-tight truncate max-w-full">{userData.name}</h1>
              <Button 
                onClick={handleToggleLike} 
                variant="ghost" 
                className={cn(
                  "bg-red-50 px-3 py-1 h-7 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1 shadow-sm transition-all active:scale-95",
                  isLikedByMe ? "text-red-600" : "text-gray-400 grayscale"
                )}
              >
                 {userData.likesCount || 0} إعجاب <Heart size={12} fill={isLikedByMe ? "currentColor" : "none"} />
              </Button>
            </div>
            <p className="text-muted-foreground font-bold text-xs bg-secondary/30 inline-block px-3 py-0.5 rounded-full italic max-w-full truncate">
               {userData.bio || "عضو طموح في كارينجو 🌱"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-black text-[9px] border border-primary/10">
                العضو رقم {membershipInfo.rank}
              </div>
              <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-orange-100 flex items-center gap-1">
                <Flame size={10} fill="currentColor" /> {userData.streak || 0}ي
              </div>
              <div className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-yellow-100 flex items-center gap-1">
                <Star size={10} fill="currentColor" /> {userData.points?.toLocaleString() || 0}ن
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2">
          <Card className="border-none shadow-lg rounded-[2rem] bg-card p-5 border border-border space-y-4">
            <CardHeader className="p-0 border-b border-border pb-3">
              <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                <UserIcon size={16} /> المعلومات العامة
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-muted-foreground uppercase">الجنس</p>
                <p className="font-black text-primary text-xs">{userData.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-muted-foreground uppercase">العمر</p>
                <p className="font-black text-primary text-xs">{userData.age || '--'} سنة</p>
              </div>
              <div className="col-span-2 space-y-0.5 bg-secondary/20 p-3 rounded-xl border border-border/10">
                <p className="text-[8px] font-black text-muted-foreground uppercase">تاريخ الانضمام</p>
                <p className="font-black text-primary text-[10px] flex items-center gap-1.5">
                  <CalendarIcon size={12} />
                  {userData.registrationDate ? new Date(userData.registrationDate).toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' }) : '--'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem] bg-card p-5 border border-border space-y-4">
            <CardHeader className="p-0 border-b border-border pb-3">
              <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                <HeartPulse size={16} /> مؤشر الأداء الصحي
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col items-center justify-center gap-2 py-2">
               <div className="text-4xl font-black text-primary">{bmiValue}</div>
               <div className={cn("px-4 py-1 rounded-full font-black text-xs bg-secondary", bmiStatus.color)}>
                 {bmiStatus.label}
               </div>
               <p className="text-[7px] font-bold text-muted-foreground text-center opacity-60 px-2 leading-tight">
                 يتم حساب هذا المؤشر تلقائياً بناءً على بيانات الطول والوزن المعلنة.
               </p>
            </div>
          </Card>

          <Card className="md:col-span-2 border-none shadow-lg rounded-[2rem] bg-card p-5 border border-border">
            <CardHeader className="p-0 border-b border-border pb-3 mb-4">
              <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" /> الأوسمة والإنجازات
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {userData.badges && userData.badges.length > 0 ? userData.badges.map((badge: string, i: number) => (
                <div key={i} className="bg-accent/5 px-3 py-1.5 rounded-xl font-black text-[9px] text-accent border border-accent/10 shadow-sm">
                  {badge}
                </div>
              )) : (
                <p className="text-muted-foreground font-bold text-[10px] italic w-full text-center py-4">لم يكتسب أوسمة بعد 🌱</p>
              )}
            </div>
          </Card>
        </div>
        
        <div className="flex justify-center mt-6 px-2">
          <Link href={`/chat/${id}`} onClick={() => playSound('click')} className="w-full max-w-sm">
            <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-sm font-black shadow-lg shadow-primary/20 gap-2">
              ابدأ دردشة مع {userData.name} 💬
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
