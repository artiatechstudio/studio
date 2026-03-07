
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Globe, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const publicChatRef = useMemoFirebase(() => ref(database, `public_chat`), [database]);
  const messagesQuery = useMemoFirebase(() => publicChatRef ? query(publicChatRef, limitToLast(100)) : null, [publicChatRef]);
  const { data: messagesData } = useDatabase(messagesQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !publicChatRef) return;

    playSound('click');
    const msg = {
      senderId: user.uid,
      senderName: userData?.name || 'مجهول',
      senderAvatar: userData?.avatar || '🐱',
      isPremium: (userData?.isPremium === 1 || userData?.name === 'admin'),
      text: msgText.trim(),
      timestamp: serverTimestamp()
    };

    push(publicChatRef, msg);
    setMsgText('');
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.values(messagesData).sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messagesData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-gradient-to-r from-accent to-pink-500 p-4 rounded-3xl shadow-lg border border-white/20 mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl border border-white/30 shadow-inner">
            🌍
          </div>
          <div className="text-right text-white">
            <h2 className="font-black leading-none text-lg">المجتمع العام</h2>
            <p className="text-[10px] font-bold mt-1 opacity-80">ساحة النقاش الجماعية</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth pb-40"
        >
          {messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر إلهامه هنا! 🌍✨</div>
          ) : messages.map((m: any, idx) => {
            const isMine = m.senderId === user?.uid;
            return (
              <div key={idx} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                <div className="flex items-center gap-1 mb-1 px-2">
                   {!isMine && <span className="text-[10px] font-black text-primary">{m.senderName}</span>}
                   {m.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                </div>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-3xl font-bold text-sm shadow-md flex gap-2",
                  isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-primary rounded-bl-none border border-border"
                )}>
                  {!isMine && <span className="shrink-0">{m.senderAvatar}</span>}
                  <span>{m.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex gap-2 shadow-2xl">
            <Input 
              placeholder="شارك رسالتك مع الجميع..." 
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
      </div>
    </div>
  );
}
