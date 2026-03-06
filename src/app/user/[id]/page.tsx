
"use client"

import React, { use } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Trophy, Ruler, Weight, Flame, Heart, ArrowLeft, Star, HeartPulse, ShieldCheck, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

export default function UserPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { database } = useFirebase();
  const router = useRouter();

  const userRef = useMemoFirebase(() => ref(database, `users/${id}`), [database, id]);
  const { data: userData, isLoading } = useDatabase(userRef);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">جاري تحميل الملف...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="text-9xl mb-6">👻</div>
        <h1 className="text-3xl font-black text-primary mb-4">هذا المستخدم غير موجود!</h1>
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10">
        <header className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-[2.5rem] shadow-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
          
          <div className="absolute top-4 left-4 z-10">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
               <ArrowLeft className="rotate-180" />
            </Button>
          </div>

          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-8 border-secondary shadow-xl bg-white flex items-center justify-center shrink-0">
            <span className="text-7xl md:text-8xl">{userData.avatar || "🐱"}</span>
          </Avatar>
          
          <div className="flex-1 text-center md:text-right space-y-3 z-10">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">{userData.name}</h1>
              <span className="bg-red-50 px-4 py-1 rounded-full text-xs font-black text-red-600 border border-red-100 flex items-center gap-1 shadow-sm">
                 {userData.likesCount || 0} إعجاب <Heart size={14} fill="currentColor" />
              </span>
            </div>
            <p className="text-muted-foreground font-bold text-lg bg-secondary/30 inline-block px-4 py-1 rounded-full italic">
               {userData.bio || "عضو طموح في كارينجو 🌱"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-primary/10">
                <Flame size={18} fill="currentColor" className="text-orange-500" /> {userData.streak || 0} يوم حماسة
              </div>
              <div className="bg-accent/5 text-accent px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-accent/10">
                <Star size={18} fill="currentColor" className="text-yellow-500" /> {userData.points?.toLocaleString() || 0} نقطة
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border space-y-6">
            <CardHeader className="p-0 border-b border-border pb-4">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                <UserIcon /> المعلومات العامة
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase">الجنس</p>
                <p className="font-black text-primary">{userData.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase">العمر</p>
                <p className="font-black text-primary">{userData.age || '--'} سنة</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase">الطول</p>
                <p className="font-black text-primary">{userData.height || '--'} سم</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase">الوزن</p>
                <p className="font-black text-primary">{userData.weight || '--'} كجم</p>
              </div>
              <div className="col-span-2 space-y-1 bg-secondary/20 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase">تاريخ الانضمام</p>
                <p className="font-black text-primary">{new Date(userData.registrationDate).toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border space-y-6">
            <CardHeader className="p-0 border-b border-border pb-4">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                <HeartPulse /> مؤشر الأداء الصحي
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col items-center justify-center gap-4 py-4">
               <div className="text-6xl font-black text-primary">{bmiValue}</div>
               <div className={cn("px-6 py-2 rounded-full font-black text-lg bg-secondary", bmiStatus.color)}>
                 {bmiStatus.label}
               </div>
               <p className="text-[10px] font-bold text-muted-foreground text-center">
                 يتم حساب هذا المؤشر تلقائياً بناءً على بيانات الطول والوزن المعلنة.
               </p>
            </div>
          </Card>

          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-card p-8 border border-border">
            <CardHeader className="p-0 border-b border-border pb-4 mb-6">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                <ShieldCheck className="text-accent" /> الأوسمة والإنجازات
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-3">
              {userData.badges && userData.badges.length > 0 ? userData.badges.map((badge: string, i: number) => (
                <div key={i} className="bg-accent/10 px-6 py-3 rounded-2xl font-black text-accent border border-accent/20 shadow-sm">
                  {badge}
                </div>
              )) : (
                <p className="text-muted-foreground font-bold italic w-full text-center py-4">لم يكتسب أوسمة بعد 🌱</p>
              )}
            </div>
          </Card>
        </div>
        
        <div className="flex justify-center mt-10">
          <Link href={`/chat/${id}`} onClick={() => playSound('click')}>
            <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-xl shadow-primary/20 gap-3">
              ابدأ دردشة مع {userData.name} 💬
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
