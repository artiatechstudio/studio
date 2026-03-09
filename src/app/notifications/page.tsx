
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, remove, update, serverTimestamp, push } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Trophy, Zap, CheckCheck, Clock, Star, Swords, CheckCircle2, XCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();

  const notificationsRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/notifications`) : null, [database, user]);
  const { data: notificationsData, isLoading } = useDatabase(notificationsRef);

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    return Object.entries(notificationsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [notificationsData]);

  const handleClearAll = async () => {
    if (!user || !notificationsRef) return;
    playSound('click');
    await remove(notificationsRef);
    toast({ title: "تم مسح كافة الإشعارات" });
  };

  const handleChallengeAction = async (notif: any, action: 'accept' | 'reject') => {
    if (!user) return;
    playSound('click');

    try {
      if (action === 'accept') {
        const now = Date.now();
        const challengeRef = ref(database, `challenges/${notif.challengeId}`);
        
        await update(challengeRef, {
          status: 'active',
          acceptedAt: now,
          receiverStartTime: now,
          senderStartTime: now // سيتم تعديله عند أول فتح للمرسل
        });

        // إرسال رسالة للطرف الآخر
        push(ref(database, `users/${notif.senderId}/notifications`), {
          type: 'system',
          title: 'بدأ التحدي! ⚔️',
          message: `وافق الخصم على التحدي. انطلق لشاشة الماستر فوراً لبدء التدريب وتحطيم الزمن!`,
          isRead: false,
          timestamp: serverTimestamp()
        });

        toast({ title: "تم قبول التحدي! ⚔️", description: "انتقل لشاشة الماستر لبدء المنافسة." });
        playSound('success');
        router.push('/track/master');
      } else {
        await remove(ref(database, `challenges/${notif.challengeId}`));
        toast({ title: "تم رفض التحدي" });
      }
      await remove(ref(database, `users/${user.uid}/notifications/${notif.id}`));
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500" fill="currentColor" size={20} />;
      case 'achievement': return <Trophy className="text-yellow-500" size={20} />;
      case 'challenge': return <Swords className="text-red-600" size={20} />;
      case 'system': return <Bell className="text-primary" size={20} />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-32" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 space-y-8">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center"><Bell size={32} /></div>
            <h1 className="text-3xl font-black text-primary">الإشعارات</h1>
          </div>
          {notifications.length > 0 && <Button onClick={handleClearAll} variant="ghost" className="rounded-full gap-2 text-accent font-black h-12 px-6"><CheckCheck size={20} /> <span>مسح الكل</span></Button>}
        </header>

        {isLoading ? <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> : notifications.length === 0 ? <div className="text-center p-20 opacity-30"><div className="text-8xl">📭</div><p className="font-black text-xl">لا يوجد إشعارات جديدة</p></div> : (
          <div className="space-y-3 mx-2">
            {notifications.map((n) => (
              <Card key={n.id} className={cn("rounded-3xl border-none shadow-md overflow-hidden bg-white border-r-8", n.type === 'challenge' ? "border-red-500" : "border-accent")}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-secondary/50">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1 text-right">
                      <p className="font-black text-sm text-primary">{n.title}</p>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-2 font-bold"><Clock size={10} /> {n.timestamp ? formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</div>
                    </div>
                  </div>
                  {n.type === 'challenge' && (
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleChallengeAction(n, 'accept')} className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 font-black text-xs gap-2"> <CheckCircle2 size={14} /> قبول التحدي </Button>
                      <Button onClick={() => handleChallengeAction(n, 'reject')} variant="outline" className="flex-1 h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black text-xs gap-2"> <XCircle size={14} /> رفض </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
