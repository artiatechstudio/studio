
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Trophy, Flame, Hash, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  
  const profileRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: profile, isLoading } = useDatabase(profileRef);

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج" });
    router.push('/login');
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
    name: user?.displayName || 'صديق كاري',
    streak: 0,
    points: 0,
    registrationRank: '...',
    badges: ['مستكشف جديد']
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10 pb-32">
        {/* رأس الصفحة */}
        <header className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 md:border-8 border-secondary shadow-xl relative">
              <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/150/150`} />
              <AvatarFallback className="bg-primary text-white text-3xl md:text-4xl font-black">
                {userData.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 md:p-3 rounded-2xl shadow-lg border-2 md:border-4 border-white dark:border-slate-900">
              <BadgeCheck size={24} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-right space-y-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">{userData.name}</h1>
              <p className="text-muted-foreground text-base md:text-lg font-medium">عضو في مجتمع كاري للنمو اليومي</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-4 py-2 rounded-2xl font-black shadow-sm">
                <Flame size={18} fill="currentColor" /> {userData.streak || 0} يوم حماسة
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl font-black shadow-sm">
                <Hash size={18} /> العضو رقم {userData.registrationRank || '...'}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
            <Link href="/settings">
              <Button variant="outline" className="w-full md:w-auto rounded-2xl border-primary text-primary hover:bg-primary/5 px-6 py-4 font-black">
                <SettingsIcon size={18} className="ml-2" /> الإعدادات
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="w-full md:w-auto rounded-2xl text-destructive hover:bg-destructive/10 px-6 py-4 font-black">
              <LogOut size={18} className="ml-2" /> تسجيل الخروج
            </Button>
          </div>
        </header>

        {/* الإحصائيات والإنجازات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden border border-border">
              <CardHeader className="p-6 md:p-8 border-b border-border bg-secondary/10">
                <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-3">
                  <Trophy className="text-accent" /> أوسمة الإنجاز
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 flex flex-wrap gap-4">
                {userData.badges?.length > 0 ? userData.badges.map((badge: string, i: number) => (
                  <div key={i} className="bg-secondary/40 px-5 py-3 rounded-2xl flex items-center gap-4 group hover:bg-primary hover:text-white transition-all cursor-default shadow-sm">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-primary group-hover:bg-card group-hover:text-primary shadow-sm">
                      <Trophy size={20} />
                    </div>
                    <span className="font-black text-base md:text-lg">{badge}</span>
                  </div>
                )) : (
                  <p className="text-muted-foreground font-bold italic p-4">لم تحصل على أوسمة بعد. ابدأ مسارك الآن!</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-xl rounded-[2rem] bg-accent text-white p-6 md:p-8 space-y-4">
              <h3 className="text-xl md:text-2xl font-black">قوة النمو</h3>
              <p className="text-base md:text-lg font-bold leading-relaxed opacity-90">
                "أنت العضو رقم {userData.registrationRank} في مجتمعنا، استمر في التقدم كل يوم!"
              </p>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] bg-primary text-white p-6 md:p-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-4xl">🐱</div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-black">{userData.points?.toLocaleString() || 0}</h4>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest">إجمالي النقاط</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
