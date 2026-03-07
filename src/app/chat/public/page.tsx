
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Globe, Crown, Clock } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const publicChatsRef = useMemoFirebase(() => ref(database, 'public_chats'), [database]);
  const publicQuery = useMemoFirebase(() => query(publicChatsRef, limitToLast(100)), [publicChatsRef]);
  const { data: messagesData, isLoading } = useDatabase(publicQuery);

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(usersRef);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData) return;

    playSound('success');
    const msg = {
      senderId: user.uid,
      senderName: userData.name,
      senderAvatar: userData.avatar || "🐱",
      text: msgText.trim(),
      timestamp: serverTimestamp()
    };

    push(publicChatsRef, msg);
    setMsgText('');
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.values(messagesData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [messagesData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center shadow-md">
              <Globe size={24} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        {/* الرسالة لكتابة المنشور - في الأعلى دائماً كما طلبت */}
        <Card className="rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2 border-2 border-primary/10">
          <CardContent className="p-6">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl shadow-inner border border-border">
                  {userData?.avatar || "🐱"}
                </div>
                <div className="text-right">
                  <p className="font-black text-primary text-xs">بماذا تفكر يا بطل؟</p>
                  <p className="text-[8px] font-bold text-muted-foreground">منشورك سيظهر لكافة أعضاء كارينجو</p>
                </div>
              </div>
              <div className="relative">
                <textarea 
                  placeholder="اكتب رسالة ملهمة للمجتمع..." 
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary/20 resize-none outline-none"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
                <Button 
                  type="submit" 
                  disabled={!msgText.trim()}
                  className="absolute bottom-3 left-3 h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg font-black text-xs gap-2"
                >
                  نشر <Send size={14} className="rotate-180" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* قائمة المنشورات بالأسفل */}
        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🐱🚀</div>
          ) : messages.map((m: any, idx) => {
            const senderData = allUsersData?.[m.senderId];
            const isPremium = senderData?.isPremium === 1 || senderData?.name === 'admin';
            
            return (
              <Card key={idx} className="rounded-3xl border-none shadow-md bg-card overflow-hidden hover:scale-[1.01] transition-transform">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link href={`/user/${m.senderId}`} onClick={() => playSound('click')} className="shrink-0">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl border border-border shadow-sm">
                          {m.senderAvatar}
                        </div>
                      </Link>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <p className="font-black text-primary text-xs">{m.senderName}</p>
                          {isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                          <Clock size={8} />
                          {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed pr-2 border-r-4 border-accent/20">
                    {m.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
