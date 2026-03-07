"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, ArrowLeft, Crown, Trash2, Clock, Sparkles } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const publicChatsRef = useMemoFirebase(() => ref(database, 'publicChats'), [database]);
  const publicChatsQuery = useMemoFirebase(() => query(publicChatsRef, limitToLast(100)), [publicChatsRef]);
  const { data: chatsData, isLoading } = useDatabase(publicChatsQuery);

  const currentUserRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: myData } = useDatabase(currentUserRef);

  const messages = useMemo(() => {
    if (!chatsData) return [];
    return Object.entries(chatsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [chatsData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !myData) return;

    playSound('click');
    const msg = {
      senderId: user.uid,
      senderName: myData.name,
      senderAvatar: myData.avatar,
      isPremium: myData.isPremium === 1 || myData.name === 'admin',
      text: inputText.trim(),
      timestamp: serverTimestamp()
    };

    push(publicChatsRef, msg);
    setInputText('');
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!user) return;
    playSound('click');
    try {
      await remove(ref(database, `publicChats/${msgId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const isAdmin = myData?.name === 'admin';

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
            <p className="text-[10px] font-bold mt-1 flex items-center gap-1 opacity-80">
              <Sparkles size={10} /> ساحة الإلهام المشتركة
            </p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      {/* صندوق كتابة المنشور في الأعلى */}
      <div className="mx-4 mt-4 z-20">
        <Card className="rounded-2xl border-none shadow-xl bg-card p-3 border-2 border-accent/10">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              placeholder="بماذا تفكر؟ انشر إلهامك هنا..." 
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs focus-visible:ring-accent"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputText.trim()}
              className="h-12 w-12 rounded-xl bg-accent hover:bg-accent/90 shadow-lg shrink-0"
            >
              <Send className="rotate-180" />
            </Button>
          </form>
        </Card>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative mt-2">
        <div 
          ref={scrollRef}
          className="flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth pb-32"
        >
          {isLoading ? (
            <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🌟</div>
          ) : messages.map((m) => {
            const isMine = m.senderId === user?.uid;
            const canDelete = isMine || isAdmin;
            const isAvatarUrl = m.senderAvatar && m.senderAvatar.startsWith('http');

            return (
              <div key={m.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[90%] p-4 rounded-3xl font-bold text-sm shadow-md space-y-2 relative group",
                  isMine ? "bg-accent text-white rounded-tr-none" : "bg-white text-primary rounded-tl-none border border-border"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isMine && (
                      <Link href={`/user/${m.senderId}`} className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm overflow-hidden">
                          {isAvatarUrl ? <Image src={m.senderAvatar} alt="V" width={32} height={32} className="object-cover w-full h-full" /> : (m.senderAvatar || "🐱")}
                        </div>
                      </Link>
                    )}
                    <div className="flex flex-col text-right">
                      <div className="flex items-center gap-1">
                        <span className={cn("text-[10px] font-black truncate max-w-[100px]", isMine ? "text-white/90" : "text-primary")}>
                          {m.senderName}
                        </span>
                        {m.isPremium && <Crown size={10} className={isMine ? "text-white" : "text-yellow-500"} fill="currentColor" />}
                      </div>
                      <span className={cn("text-[7px] font-bold opacity-60 flex items-center gap-1 justify-end")}>
                        <Clock size={8} /> {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </span>
                    </div>
                    {isMine && (
                      <Link href={`/user/${m.senderId}`} className="shrink-0 ml-1">
                        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm overflow-hidden">
                          {isAvatarUrl ? <Image src={m.senderAvatar} alt="V" width={32} height={32} className="object-cover w-full h-full" /> : (m.senderAvatar || "🐱")}
                        </div>
                      </Link>
                    )}
                  </div>
                  
                  <p className="text-right whitespace-pre-wrap break-words leading-relaxed text-xs">
                    {m.text}
                  </p>

                  {canDelete && (
                    <button 
                      onClick={() => handleDeleteMessage(m.id)}
                      className={cn(
                        "absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
                        isAdmin && !isMine && "bg-slate-800"
                      )}
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
