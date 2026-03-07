
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, MessageSquare, Trash2, Globe, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Image from 'next/image';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const publicMessagesRef = useMemoFirebase(() => ref(database, 'publicChat'), [database]);
  const publicMessagesQuery = useMemoFirebase(() => query(publicMessagesRef, limitToLast(50)), [publicMessagesRef]);
  const { data: messagesData, isLoading } = useDatabase(publicMessagesQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: myData } = useDatabase(userRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !myData) return;

    playSound('click');
    const msg = {
      senderId: user.uid,
      name: myData.name,
      avatar: myData.avatar,
      isPremium: myData.isPremium || 0,
      text: msgText.trim(),
      timestamp: serverTimestamp()
    };

    push(publicMessagesRef, msg);
    setMsgText('');
  };

  const handleDeleteMessage = (msgId: string) => {
    playSound('click');
    remove(ref(database, `publicChat/${msgId}`));
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.entries(messagesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messagesData]);

  const isMyPremium = myData?.isPremium === 1 || myData?.name === 'admin';

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-2xl shadow-lg">
            🌍
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">الدردشة العامة</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
              <Globe size={10} /> مجتمع كارينجو المفتوح
            </p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="p-4 z-20">
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex gap-2 shadow-2xl">
            <Input 
              placeholder="شارك إلهامك مع الجميع..." 
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-base"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
            >
              <Send className="rotate-180" />
            </Button>
          </form>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 p-6 space-y-6 overflow-y-auto scroll-smooth pb-40"
        >
          {isLoading ? (
            <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : messages.map((m: any) => {
            const isMine = m.senderId === user?.uid;
            const isAdmin = myData?.name === 'admin';
            const msgIsPremium = m.isPremium === 1 || m.name === 'admin';
            const isAvatarUrl = m.avatar && m.avatar.startsWith('http');

            return (
              <div key={m.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                <div className={cn("flex items-end gap-2 max-w-[85%]", isMine ? "flex-row-reverse" : "flex-row")}>
                  <Link href={`/user/${m.senderId}`} className="shrink-0">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shrink-0 shadow-sm overflow-hidden">
                      {isAvatarUrl ? (
                        <Image src={m.avatar} alt={m.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                      ) : (
                        m.avatar || "🐱"
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col gap-1">
                    <div className={cn("flex items-center gap-1", isMine ? "justify-end" : "justify-start")}>
                      <span className="text-[10px] font-black text-muted-foreground">{m.name}</span>
                      {msgIsPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-3xl font-bold text-sm shadow-md relative group",
                      isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-primary rounded-bl-none border border-border"
                    )}>
                      {m.text}
                      {(isMine || isAdmin) && (
                        <button 
                          onClick={() => handleDeleteMessage(m.id)}
                          className={cn(
                            "absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded-full shadow-lg",
                            isMine ? "-left-2" : "-right-2"
                          )}
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-muted-foreground/50 px-2">
                      {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
