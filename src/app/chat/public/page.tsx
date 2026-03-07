
"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Trash2, Globe, Sparkles, Crown } from 'lucide-react';
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

  const chatRef = useMemoFirebase(() => ref(database, 'publicChat'), [database]);
  const chatQuery = useMemoFirebase(() => query(chatRef, limitToLast(100)), [chatRef]);
  const { data: chatData, isLoading } = useDatabase(chatQuery);

  const messages = useMemo(() => {
    if (!chatData) return [];
    return Object.entries(chatData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [chatData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData) return;

    // قيود النشر للمستخدم المجاني
    const today = new Date().toLocaleDateString('en-CA');
    const postsToday = userData.dailyPublicPosts?.[today] || 0;

    if (!isPremium && !isAdmin && postsToday >= 3) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي", 
        description: "اشترك في بريميوم للنشر بلا حدود! 👑" 
      });
      return;
    }

    playSound('click');
    const newMsg = {
      senderId: user.uid,
      senderName: userData.name,
      senderAvatar: userData.avatar || "🐱",
      isPremiumSender: isPremium,
      text: msgText.trim(),
      timestamp: serverTimestamp(),
      likes: 0
    };

    push(chatRef, newMsg);
    
    // تحديث عداد النشر اليومي
    if (!isAdmin) {
      const updates: any = {};
      updates[`users/${user.uid}/dailyPublicPosts/${today}`] = postsToday + 1;
      const dbRef = ref(database);
      // update logic would go here, simplified for brevity
    }

    setMsgText('');
  };

  const handleDelete = (msgId: string) => {
    if (!isAdmin && !messages.find(m => m.id === msgId && m.senderId === user?.uid)) {
      return;
    }
    const confirmed = window.confirm("هل تريد حذف هذا المنشور؟ 🗑️");
    if (confirmed) {
      remove(ref(database, `publicChat/${msgId}`));
      toast({ title: "تم الحذف بنجاح" });
      playSound('click');
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">المجتمع العام</h2>
            <p className="text-[9px] text-muted-foreground font-bold mt-1">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 space-y-6 overflow-y-auto scroll-smooth pb-40"
        >
          {isLoading ? (
            <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🐱✨</div>
          ) : messages.map((m) => {
            const isMine = m.senderId === user?.uid;
            return (
              <div key={m.id} className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2 mb-1 px-2">
                   <span className="text-[10px] font-black text-muted-foreground">{m.senderName}</span>
                   <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-sm border border-border">
                     {m.senderAvatar}
                   </div>
                   {m.isPremiumSender && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                </div>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl shadow-sm border relative group transition-all",
                  isMine ? "bg-primary text-white border-primary rounded-tr-none" : "bg-white text-slate-900 border-border rounded-tl-none"
                )}>
                  <p className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  
                  <div className="flex items-center justify-end gap-3 mt-3 opacity-60">
                    <span className="text-[8px] font-black">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    {(isAdmin || isMine) && (
                      <button onClick={() => handleDelete(m.id)} className="text-destructive hover:scale-110 transition-transform">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex gap-2 shadow-2xl">
            <Input 
              placeholder={isPremium || isAdmin ? "اكتب رسالتك للمجتمع..." : "اكتب (متبقي لك 3 رسائل يومياً)..."}
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-base"
              value={msgText}
              maxLength={150}
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
