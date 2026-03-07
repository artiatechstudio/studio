
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle, XCircle, Mail, Clock, Crown, ArrowLeft } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminRequestsPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData, isLoading } = useDatabase(usersRef);

  React.useEffect(() => {
    if (usersData && usersData[user?.uid || '']?.name !== 'admin') {
      router.replace('/');
    }
  }, [usersData, user, router]);

  const requests = useMemo(() => {
    if (!usersData) return [];
    return Object.values(usersData)
      .filter((u: any) => u.premiumRequest?.status === 'pending')
      .sort((a: any, b: any) => (b.premiumRequest?.requestedAt || 0) - (a.premiumRequest?.requestedAt || 0));
  }, [usersData]);

  const handleApprove = async (targetUserId: string, duration: string) => {
    playSound('success');
    const now = Date.now();
    let expiry = now;
    
    if (duration === '7days') expiry += (7 * 24 * 60 * 60 * 1000);
    else if (duration === '1month') expiry += (30 * 24 * 60 * 60 * 1000);
    else if (duration === '6months') expiry += (180 * 24 * 60 * 60 * 1000);
    else expiry += (30 * 24 * 60 * 60 * 1000); // Default fallback

    const updates: any = {};
    updates[`users/${targetUserId}/isPremium`] = 1;
    updates[`users/${targetUserId}/premiumUntil`] = expiry;
    updates[`users/${targetUserId}/premiumRequest/status`] = 'approved';
    updates[`users/${targetUserId}/showPremiumCelebration`] = true;

    try {
      await update(ref(database), updates);
      
      push(ref(database, `users/${targetUserId}/notifications`), {
        type: 'achievement',
        title: 'تم تفعيل البريميوم! 👑',
        message: 'تهانينا! لقد تمت الموافقة على طلبك. استمتع بكافة الميزات الآن.',
        isRead: false,
        timestamp: serverTimestamp()
      });

      toast({ title: "تمت الموافقة بنجاح ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل العملية" });
    }
  };

  const handleReject = async (targetUserId: string) => {
    playSound('click');
    try {
      await update(ref(database, `users/${targetUserId}/premiumRequest`), {
        status: 'rejected'
      });

      push(ref(database, `users/${targetUserId}/notifications`), {
        type: 'system',
        title: 'تحديث بخصوص طلبك ❌',
        message: 'عذراً، لم تتم الموافقة على طلب البريميوم حالياً. تواصل مع الدعم للمزيد.',
        isRead: false,
        timestamp: serverTimestamp()
      });

      toast({ title: "تم رفض الطلب" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل العملية" });
    }
  };

  const isAccessAllowed = usersData?.[user?.uid || '']?.name === 'admin';

  if (isLoading || !isAccessAllowed) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><ClipboardList size={24} /></div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary">طلبات الاشتراك</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">مراجعة طلبات الترقية 👑</p>
            </div>
          </div>
          <Link href="/admin"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <div className="grid grid-cols-1 gap-4 mx-2">
          {requests.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا توجد طلبات معلقة حالياً ☕</div>
          ) : requests.map((req: any) => (
            <Card key={req.id} className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-2xl">{req.avatar || "🐱"}</div>
                    <div className="text-right">
                      <h3 className="font-black text-primary text-sm">{req.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold"><Mail size={10} /> {req.email}</div>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 flex items-center gap-1">
                    <Clock size={10} /> {req.premiumRequest.duration === '7days' ? '7 أيام' : req.premiumRequest.duration === '6months' ? '6 أشهر' : 'شهر واحد'}
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button onClick={() => handleApprove(req.id, req.premiumRequest.duration)} className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 font-black text-xs gap-2"><CheckCircle size={14} /> موافقة</Button>
                  <Button onClick={() => handleReject(req.id)} variant="outline" className="flex-1 h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black text-xs gap-2"><XCircle size={14} /> رفض</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
