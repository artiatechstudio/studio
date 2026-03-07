
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, set } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, Users, Crown, Trash2, Search, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData, isLoading } = useDatabase(usersRef);

  const currentUserRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: myData } = useDatabase(currentUserRef);

  // حماية المسار
  React.useEffect(() => {
    if (myData && myData.name !== 'admin') {
      toast({ variant: "destructive", title: "دخول غير مصرح" });
      router.replace('/');
    }
  }, [myData, router]);

  const users = useMemo(() => {
    if (!usersData) return [];
    return Object.values(usersData)
      .filter((u: any) => u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
  }, [usersData, searchTerm]);

  const togglePremium = (targetUserId: string, currentStatus: number) => {
    playSound('click');
    const newStatus = currentStatus === 1 ? 0 : 1;
    const expiry = newStatus === 1 ? Date.now() + (30 * 24 * 60 * 60 * 1000) : null;

    update(ref(database, `users/${targetUserId}`), {
      isPremium: newStatus,
      premiumUntil: expiry
    });

    toast({ 
      title: newStatus === 1 ? "تم الترقية لبريميوم 👑" : "تم إلغاء البريميوم",
      description: `المستخدم: ${usersData[targetUserId].name}`
    });
  };

  if (isLoading || myData?.name !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 space-y-8">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border-4 border-primary/20 mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">لوحة التحكم العليا</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase">الإدارة والرقابة ⚡</p>
            </div>
          </div>
          <div className="text-left bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
            <p className="text-[10px] font-black text-muted-foreground uppercase">إجمالي الأعضاء</p>
            <p className="text-xl font-black text-primary">{users.length}</p>
          </div>
        </header>

        <div className="mx-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            placeholder="ابحث عن مستخدم بالاسم..."
            className="w-full h-14 pr-12 rounded-2xl bg-card border-2 border-primary/10 font-bold text-right shadow-sm focus:border-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mx-2">
          {users.map((u: any) => (
            <Card key={u.id} className={cn(
              "rounded-3xl border-none shadow-md overflow-hidden transition-all",
              u.isPremium === 1 ? "bg-yellow-50/50 border-r-8 border-yellow-500" : "bg-card"
            )}>
              <CardContent className="p-5 flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl border border-border shadow-sm">
                    {u.avatar || "🐱"}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <h3 className="font-black text-primary">{u.name}</h3>
                      {u.isPremium === 1 && <Crown size={14} className="text-yellow-500" fill="currentColor" />}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-[9px] font-black bg-secondary px-2 py-0.5 rounded-lg flex items-center gap-1">
                        {u.points || 0} <Trophy size={10} className="text-yellow-600" />
                      </span>
                      <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        {u.streak || 0}ي <TrendingUp size={10} />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-[8px] font-black text-muted-foreground uppercase">وضع البريميوم</p>
                  <Switch 
                    checked={u.isPremium === 1} 
                    onCheckedChange={() => togglePremium(u.id, u.isPremium || 0)}
                  />
                  {u.premiumUntil && (
                    <p className="text-[7px] font-bold text-orange-600">تنتهي: {new Date(u.premiumUntil).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 mx-2 space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-black text-xs">
            <AlertTriangle size={14} /> تنبيه الإدارة
          </div>
          <p className="text-[10px] font-bold text-red-900 leading-relaxed">
            استخدم صلاحياتك بحكمة. تفعيل البريميوم يمنح العضو وصولاً كاملاً للميزات ويزيل الإعلانات. سيتم تعطيل الاشتراك تلقائياً بعد 30 يوماً من تاريخ التفعيل ما لم يتم التجديد.
          </p>
        </section>
      </div>
    </div>
  );
}
