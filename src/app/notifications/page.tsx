
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, set, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Trophy, Zap, Trash2, CheckCheck, Clock, Star } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function NotificationsPage() {
  const { user } = useUser();
  const { database } = useFirebase();

  const notificationsRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/notifications`) : null, [database, user]);
  const { data: notificationsData, isLoading } = useDatabase(notificationsRef);

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    return Object.entries(notificationsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [notificationsData]);

  const handleMarkAllAsRead = async () => {
    if (!user || !notificationsData) return;
    playSound('click');
    const updates: any = {};
    Object.keys(notificationsData).forEach(id => {
      updates[`users/${user.uid}/notifications/${id}/isRead`] = true;
    });
    await update(ref(database), updates);
  };

  const handleClearAll = async () => {
    if (!user || !notificationsRef) return;
    const confirmed = window.confirm("هل تريد حذف كافة الإشعارات؟ 🐱🗑️");
    if (!confirmed) return;
    
    playSound('click');
    try {
      await remove(notificationsRef);
    } catch (error) {
      console.error("Clear notifications error:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500" fill="currentColor" size={20} />;
      case 'achievement': return <Trophy className="text-yellow-500" size={20} />;
      case 'bonus': return <Zap className="text-accent" size={20} />;
      case 'system': return <Bell className="text-primary" size={20} />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-32 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 space-y-8">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Bell size={32} />
            </div>
            <h1 className="text-3xl font-black text-primary">الإشعارات</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleMarkAllAsRead} variant="ghost" size="icon" className="rounded-full hover:bg-accent/10 text-accent" title="تحديد الكل كمقروء">
              <CheckCheck size={20} />
            </Button>
            <Button onClick={handleClearAll} variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 text-destructive" title="مسح الكل">
              <Trash2 size={20} />
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-20 space-y-4 opacity-30">
            <div className="text-8xl">📭</div>
            <p className="font-black text-xl">لا يوجد إشعارات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3 mx-2">
            {notifications.map((n) => (
              <Card 
                key={n.id} 
                className={cn(
                  "rounded-3xl border-none shadow-md overflow-hidden transition-all hover:scale-[1.01]",
                  n.isRead ? "bg-card opacity-70" : "bg-white border-r-8 border-accent"
                )}
                onClick={() => {
                  if (!n.isRead && user) {
                    update(ref(database, `users/${user.uid}/notifications/${n.id}`), { isRead: true });
                  }
                }}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    n.isRead ? "bg-secondary" : "bg-accent/10"
                  )}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1 text-right">
                    <p className={cn("font-black text-sm", n.isRead ? "text-muted-foreground" : "text-primary")}>
                      {n.title}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-2 font-bold">
                      <Clock size={10} />
                      {n.timestamp ? formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <section className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 mx-2 space-y-4">
          <div className="flex items-center gap-2 text-primary font-black text-xs">
            <Star size={14} className="text-yellow-500" fill="currentColor" />
            نصيحة كاري للإشعارات
          </div>
          <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
            الإشعارات تساعدك على البقاء متصلاً بالمجتمع. تفقدها يومياً لمعرفة من أعجب بملفك، وتابع إنجازاتك الجديدة! 🐱✨
          </p>
        </section>
      </div>
    </div>
  );
}
