
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Trophy, Zap, CheckCheck, Clock, Star } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

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

  const handleClearAll = async () => {
    if (!user || !notificationsRef) return;
    playSound('click');
    try {
      await remove(notificationsRef);
      toast({ title: "تم مسح كافة الإشعارات بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل مسح الإشعارات" });
    }
  };

  const handleDeleteOne = async (notifId: string) => {
    if (!user) return;
    playSound('click');
    try {
      await remove(ref(database, `users/${user.uid}/notifications/${notifId}`));
    } catch (e) {
      console.error("Delete failed", e);
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
    <div className="min-h-screen bg-background md:pr-72 pb-32" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 space-y-8">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Bell size={32} />
            </div>
            <h1 className="text-3xl font-black text-primary">الإشعارات</h1>
          </div>
          {notifications.length > 0 && (
            <Button 
              onClick={handleClearAll} 
              variant="ghost" 
              className="rounded-full gap-2 text-accent font-black hover:bg-accent/10 h-12 px-6"
              title="مسح الكل"
            >
              <CheckCheck size={20} />
              <span>مسح الكل</span>
            </Button>
          )}
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
                className="rounded-3xl border-none shadow-md overflow-hidden transition-all bg-white border-r-8 border-accent"
                onClick={() => handleDeleteOne(n.id)}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-accent/10">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1 text-right">
                    <p className="font-black text-sm text-primary">
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
                  <div className="text-[8px] font-black text-accent uppercase opacity-40 self-center">انقر للمسح</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <section className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 mx-2 space-y-4">
          <div className="flex items-center gap-2 text-primary font-black text-xs">
            < Star size={14} className="text-yellow-500" fill="currentColor" />
            نظام الإشعارات الذكي
          </div>
          <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
            في كارينجو، الإشعارات هي تنبيهات فورية لمتابعة إنجازاتك. بمجرد قراءتك للإشعار أو النقر عليه، يتم مسحه تلقائياً للحفاظ على صندوق وارد نظيف ومنظم دائماً! 🐱✨
          </p>
        </section>
      </div>
    </div>
  );
}
