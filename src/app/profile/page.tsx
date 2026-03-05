
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Trophy, Flame, Hash, Settings as SettingsIcon, User as UserIcon, Share2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: profile, isLoading } = useDatabase(profileRef);

  const handleShare = async () => {
    const shareData = {
      title: 'كارينجو | رفيقك للنمو',
      text: 'انضم إلي في رحلة الـ 30 يوماً للتطوير الشخصي على منصة كارينجو!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({ title: "تم نسخ الرابط!", description: "يمكنك الآن إرساله لأصدقائك." });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isUserLoading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-primary">جاري تحميل ملفك الشخصي...</p>
      </div>
    </div>
  );

  const userData = profile || {
    name: user?.displayName || 'عضو كاري',
    streak: 0,
    points: 0,
    registrationRank: '...',
    badges: ['مستكشف جديد']
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10 pb-32">
        {/* رأس الصفحة */}
        <header className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/5 border border-white">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar className="w-40 h-40 border-8 border-secondary shadow-xl relative">
              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/150/150`} />
              <AvatarFallback className="bg-primary text-white text-4xl font-black">
                {userData.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-accent text-white p-3 rounded-2xl shadow-lg border-4 border-white">
              <BadgeCheck size={24} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-right space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">{userData.name}</h1>
              <p className="text-muted-foreground text-lg font-medium">عضو في مجتمع كاري للنمو اليومي</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-5 py-2.5 rounded-2xl font-black shadow-sm">
                <Flame size={20} fill="currentColor" /> {userData.streak || 0} يوم متواصل
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-2xl font-black shadow-sm">
                <Hash size={20} /> العضو رقم {userData.registrationRank || '...'}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
            <Button onClick={handleShare} className="w-full md:w-auto rounded-2xl bg-accent hover:bg-accent/90 px-8 py-6 text-lg font-black shadow-xl shadow-accent/20">
              <Share2 className="ml-2" /> شارك مع أصدقائك
            </Button>
            <Link href="/settings">
              <Button variant="outline" className="w-full md:w-auto rounded-2xl border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg font-black">
                <SettingsIcon className="ml-2" /> الإعدادات
              </Button>
            </Link>
          </div>
        </header>

        {/* الإحصائيات والإنجازات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-secondary/50">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Trophy className="text-accent" /> أوسمة الإنجاز
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-wrap gap-4">
                {userData.badges?.length > 0 ? userData.badges.map((badge: string, i: number) => (
                  <div key={i} className="bg-secondary/40 px-6 py-4 rounded-[1.5rem] flex items-center gap-4 group hover:bg-primary hover:text-white transition-all cursor-default shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary group-hover:bg-white group-hover:text-primary shadow-sm">
                      <Trophy size={24} />
                    </div>
                    <span className="font-black text-lg">{badge}</span>
                  </div>
                )) : (
                  <p className="text-muted-foreground font-bold italic p-4">لم تحصل على أوسمة بعد. ابدأ مسارك الآن!</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-accent text-white p-8 space-y-6">
              <h3 className="text-2xl font-black">قوة النمو</h3>
              <p className="text-lg font-bold leading-relaxed opacity-90">
                "أنت العضو رقم {userData.registrationRank} في مجتمعنا، شارك نجاحك مع أصدقائك لنتطور سوياً!"
              </p>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-5xl">🐱</div>
                <div>
                  <h4 className="text-3xl font-black">{userData.points?.toLocaleString() || 0}</h4>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest">إجمالي النقاط</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
