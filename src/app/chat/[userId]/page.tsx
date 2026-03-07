
"use client"

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function ChatRoomPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: otherId } = use(params);
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatId = useMemo(() => {
    if (!user) return '';
    return [user.uid, otherId].sort().join('_');
  }, [user, otherId]);

  const messagesRef = useMemoFirebase(() => chatId ? ref(database, `chats/${chatId}/messages`) : null, [database, chatId]);
  const messagesQuery = useMemoFirebase(() => messagesRef ? query(messagesRef, limitToLast(50)) : null, [messagesRef]);
  const { data: messagesData } = useDatabase(messagesQuery);

  const otherUserRef = useMemoFirebase(() => ref(database, `users/${otherId}`), [database, otherId]);
  const { data: otherUserData } = useDatabase(otherUserRef);

  useEffect(() => {
    if (user && chatId && database) {
      const lastSeenRef = ref(database, `chats/${chatId}/lastSeen/${user.uid}`);
      set(lastSeenRef, serverTimestamp());
    }
  }, [user, chatId, messagesData, database]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !messagesRef) return;

    playSound('click');
    const msg = {
      senderId: user.uid,
      text: msgText.trim(),
      timestamp: serverTimestamp()
    };

    push(messagesRef, msg);
    setMsgText('');
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.values(messagesData).sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messagesData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <Link href={`/user/${otherId}`} onClick={() => playSound('click')} className="shrink-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border border-border hover:scale-110 transition-transform shadow-sm">
              {otherUserData?.avatar || "🐱"}
            </div>
          </Link>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">{otherUserData?.name || "تحميل..."}</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 truncate max-w-[120px]">
              {otherUserData?.bio || "عضو طموح في كارينجو"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth pb-40"
        >
          {messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">ابدأ المحادثة الآن! 🐱💬</div>
          ) : messages.map((m: any, idx) => {
            const isMine = m.senderId === user?.uid;
            return (
              <div key={idx} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-3xl font-bold text-sm shadow-md",
                  isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-primary rounded-bl-none border border-border"
                )}>
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form with safe margin for mobile navigation */}
        <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex gap-2 shadow-2xl">
            <Input 
              placeholder="اكتب رسالتك..." 
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
