
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, Heart, X, Crown, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const publicChatRef = useMemoFirebase(() => ref(database, 'publicChat'), [database]);
  const chatQuery = useMemoFirebase(() => query(publicChatRef, limitToLast(50)), [publicChatRef]);
  const { data: chatData, isLoading } = useDatabase(chatQuery);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';
  const todayStr = new Date().toLocaleDateString('en-CA');

  const messages = useMemo(() => {
    if (!chatData) return [];
    // تنظيف الرسائل القديمة (أكثر من 24 ساعة) وحذفها من الداتابيز
    const now = Date.now();
    const result = Object.entries(chatData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(m => {
        const isOld = m.timestamp && (now - m.timestamp > 24 * 60 * 60 * 1000);
        if (isOld) {
          remove(ref(database, `publicChat/${m.id}`));
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return result;
  }, [chatData, database]);

  const postsTodayCount = useMemo(() => {
    if (!user || !chatData) return 0;
    return Object.values(chatData).filter((m: any) => m.senderId === user.uid && m.date === todayStr).length;
  }, [chatData, user, todayStr]);

  const postsRemaining = isPremium ? 999 : Math.max(0, 3 - postsTodayCount);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData) return;

    if (!isPremium && postsRemaining <= 0) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "المستخدم المجاني له 3 منشورات فقط. اشترك في بريميوم للنشر بلا حدود!" });
      return;
    }

    playSound('click');
    const newMsg = {
      senderId: user.uid,
      senderName: userData.name,
      senderAvatar: userData.avatar || "🐱",
      senderIsPremium: isPremium,
      text: msgText.trim().slice(0, 120),
      timestamp: serverTimestamp(),
      date: todayStr,
      likesCount: 0
    };

    push(publicChatRef, newMsg);
    setMsgText('');
  };

  const handleToggleLike = (msgId: string) => {
    if (!user) return;
    playSound('click');
    const msgLikesRef = ref(database, `publicChat/${msgId}/likesCount`);
    const likedByRef = ref(database, `publicChat/${msgId}/likedBy/${user.uid}`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(msgLikesRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(msgLikesRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDeleteMessage = (msgId: string) => {
    playSound('click');
    remove(ref(database, `publicChat/${msgId}`));
    toast({ title: "تم حذف المنشور" });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-inner">
            <Globe size={28} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">انشر إلهامك للعالم 🌍</p>
          </div>
        </div>
        <div className="bg-secondary/50 px-4 py-2 rounded-xl border border-border/50 text-right">
           <p className="text-[8px] font-black text-muted-foreground uppercase">المتبقي اليوم</p>
           <p className="text-sm font-black text-primary">{isPremium ? "∞" : postsRemaining}</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto scroll-smooth pb-40">
          {messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
              <MessageSquare size={64} />
              <p className="font-black text-xl">كن أول من ينشر هنا! 🐱✨</p>
            </div>
          ) : messages.map((m: any) => {
            const isMine = m.senderId === user?.uid;
            const canDelete = isAdmin || isMine;
            const isLikedByMe = m.likedBy?.[user?.uid || ''];

            return (
              <div key={m.id} className={cn("flex flex-col gap-2", isMine ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[90%] p-5 rounded-[2rem] shadow-lg relative group transition-all",
                  isMine ? "bg-primary text-white rounded-br-none" : "bg-card text-foreground border border-border rounded-bl-none"
                )}>
                  <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                    <Link href={`/user/${m.senderId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-row-reverse">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg border border-white/10 shrink-0">
                        {m.senderAvatar || "🐱"}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black flex items-center gap-1 justify-end">
                          {m.senderName} {m.senderIsPremium && <Crown size={8} className="text-yellow-400" fill="currentColor" />}
                        </span>
                      </div>
                    </Link>
                    {canDelete && (
                      <button 
                        onClick={() => handleDeleteMessage(m.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                        title="حذف"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm font-bold leading-relaxed break-words text-right">{m.text}</p>
                  
                  <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-2 justify-end">
                    <button 
                      onClick={() => handleToggleLike(m.id)}
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-black transition-all hover:scale-110",
                        isLikedByMe ? "text-red-500" : (isMine ? "text-white/60" : "text-muted-foreground")
                      )}
                    >
                      <span>{m.likesCount || 0}</span>
                      <Heart size={14} fill={isLikedByMe ? "currentColor" : "none"} />
                    </button>
                    <span className="text-[8px] opacity-40 font-bold">
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-3 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-[2.5rem] flex flex-col gap-2 shadow-2xl">
            <div className="flex gap-2">
              <Input 
                placeholder="ماذا يدور في عقلك؟ (ماكس 120 حرف)" 
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-sm px-6"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value.slice(0, 120))}
                maxLength={120}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
              >
                <Send className="rotate-180" />
              </Button>
            </div>
            <div className="flex justify-between px-4">
               <span className={cn("text-[9px] font-black", msgText.length >= 110 ? "text-destructive" : "text-muted-foreground")}>
                 {msgText.length} / 120 حرف
               </span>
               {!isPremium && <span className="text-[9px] font-black text-muted-foreground">المنشورات المتبقية: {postsRemaining}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
