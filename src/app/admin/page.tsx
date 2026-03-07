
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, Search, Trophy, TrendingUp, AlertTriangle, LogOut, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';

export default function AdminDashboardPage() {
  const { user } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData, isLoading } = useDatabase(usersRef);

  const currentUserRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: myData } = useDatabase(currentUserRef);

  // حماية المسار بالاسم
  React.useEffect(() => {
    if (myData && myData.name !== 'admin') {
      toast({ variant: "destructive", title: "دخول غير مصرح" });
      router.replace('/');
    }
  }, [myData, router]);

  const users = useMemo(() => {
    if (!usersData) return [];
    return Object.values(usersData)
      .filter((u: any) => u.name !== 'admin' && u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleLogout = async () => {
    playSound('click');
    await signOut(auth);
    router.replace('/login');
  };

  const isAccessAllowed = myData?.name === 'admin';

  if (isLoading || !isAccessAllowed) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck size={24} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">لوحة التحكم</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">الإدارة والرقابة 🛡️</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-destructive font-black h-9 text-xs">
            <LogOut className="ml-2" size={14} /> خروج
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-3 mx-2">
           <Card className="p-4 rounded-[1.5rem] bg-secondary/20 border-none shadow-sm text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">إجمالي الأعضاء</p>
              <p className="text-2xl font-black text-primary">{users.length}</p>
           </Card>
           <Card className="p-4 rounded-[1.5rem] bg-yellow-50 border-none shadow-sm text-center">
              <p className="text-[8px] font-black text-yellow-600 uppercase mb-1">بريميوم نشط</p>
              <p className="text-2xl font-black text-yellow-600">{users.filter((u:any) => u.isPremium === 1).length}</p>
           </Card>
        </div>

        <div className="mx-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            placeholder="ابحث عن مستخدم بالاسم..."
            className="w-full h-12 pr-12 rounded-xl bg-card border border-border font-bold text-right shadow-sm focus:border-primary outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 mx-2">
          {users.map((u: any) => (
            <Card key={u.id} className={cn(
              "rounded-2xl border border-border shadow-sm overflow-hidden transition-all",
              u.isPremium === 1 ? "bg-yellow-50/30 border-yellow-200" : "bg-card"
            )}>
              <CardContent className="p-4 flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border border-border shadow-sm">
                    {u.avatar || "🐱"}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <h3 className="font-black text-primary text-sm">{u.name}</h3>
                      {u.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-[8px] font-black bg-secondary px-2 py-0.5 rounded-lg flex items-center gap-1">
                        {u.points || 0} <Trophy size={8} className="text-yellow-600" />
                      </span>
                      <span className="text-[8px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        {u.streak || 0}ي <TrendingUp size={8} />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-[7px] font-black text-muted-foreground uppercase">وضع البريميوم</p>
                  <Switch 
                    checked={u.isPremium === 1} 
                    onCheckedChange={() => togglePremium(u.id, u.isPremium || 0)}
                    className="scale-75"
                  />
                  {u.premiumUntil && (
                    <p className="text-[7px] font-bold text-orange-600">ينتهي: {new Date(u.premiumUntil).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="bg-red-50/50 p-5 rounded-[2rem] border border-red-100 mx-2 space-y-3">
          <div className="flex items-center gap-2 text-red-600 font-black text-[10px]">
            <AlertTriangle size={12} /> تنبيه الإدارة
          </div>
          <p className="text-[9px] font-bold text-red-900/70 leading-relaxed">
            استخدم صلاحياتك بحكمة. تفعيل البريميوم يمنح العضو وصولاً كاملاً للميزات ويزيل الإعلانات. بصفتك مدير النظام، اشتراكك دائم ولا يخضع لانتهاء الصلاحية.
          </p>
        </section>
      </div>
    </div>
  );
}
