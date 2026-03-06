
"use client"

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, ShieldAlert } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

  const messagesRef = useMemoFirebase(() => ref(database, `chats/${chatId}/messages`), [database, chatId]);
  const messagesQuery = useMemoFirebase(() => query(messagesRef, limitToLast(50)), [messagesRef]);
  const { data: messagesData } = useDatabase(messagesQuery);

  const otherUserRef = useMemoFirebase(() => ref(database, `users/${otherId}`), [database, otherId]);
  const { data: otherUserData } = useDatabase(otherUserRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user) return;

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
    return Object.values(messagesData).sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [messagesData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col" dir="rtl">
      <NavSidebar />
      <div className="flex-1 app-container py-6 flex flex-col gap-4 overflow-hidden h-screen md:h-auto md:pb-32">
        <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border border-border">
              {otherUserData?.avatar || "🐱"}
            </div>
            <div className="text-right">
              <h2 className="font-black text-primary leading-none">{otherUserData?.name || "تحميل..."}</h2>
              <p className="text-[10px] text-green-500 font-bold mt-1">نشط الآن</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft />
            </Button>
          </Link>
        </header>

        <Card className="flex-1 rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2 flex flex-col min-h-0">
          <div className="bg-orange-50 p-2 text-[10px] font-bold text-orange-700 flex items-center justify-center gap-2 border-b border-orange-100">
            <ShieldAlert size={12} />
            تنبيه: المحادثات غير مشفرة ويمكن للاستوديو الاطلاع عليها
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 p-6 space-y-4 overflow-y-auto bg-secondary/5 scroll-smooth"
          >
            {messages.map((m: any, idx) => {
              const isMine = m.senderId === user?.uid;
              return (
                <div key={idx} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-3xl font-bold text-sm shadow-sm",
                    isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-primary rounded-bl-none border border-border"
                  )}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-card border-t border-border flex gap-3">
            <Input 
              placeholder="اكتب رسالتك..." 
              className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-right"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0"
            >
              <Send className="rotate-180" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
