
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, get } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Globe, Heart, Crown, Clock, X, MessageSquare, AlertCircle, Infinity } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesRef = useMemoFirebase(() => ref(database, 'publicMessages'), [database]);
  const messagesQuery = useMemoFirebase(() => query(messagesRef, limitToLast(100)), [messagesRef]);
  const { data: messagesData, isLoading } = useDatabase(messagesQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const today = new Date().toLocaleDateString('en-CA');
  const postsCountToday = userData?.dailyPublicPostsCount?.[today] || 0;
  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData]);

  // منطق تنظيف الرسائل القديمة (24 ساعة)
  useEffect(() => {
    if (!messagesData) return;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    Object.entries(messagesData).forEach(([id, msg]: [string, any]) => {
      if (msg.timestamp && now - msg.timestamp > oneDay) {
        remove(ref(database, `publicMessages/${id}`));
      }
    });
  }, [messagesData, database]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !userData) return;

    if (!isPremium && postsCountToday >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "المستخدم المجاني يمكنه نشر 3 منشورات يومياً. اشترك في بريميوم للحرية المطلقة! 👑" });
      return;
    }

    playSound('click');
    const msg = {
      senderId: user.uid,
      senderName: userData.name,
      senderAvatar: userData.avatar || "🐱",
      senderIsPremium: isPremium,
      text: inputText.trim(),
      timestamp: serverTimestamp(),
      likes: 0,
      likedBy: {}
    };

    try {
      await push(messagesRef, msg);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPublicPostsCount/${today}`]: postsCountToday + 1
      });
      setInputText('');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    }
  };

  const handleToggleLike = (msgId: string) => {
    if (!user) return;
    playSound('click');
    const msgLikesRef = ref(database, `publicMessages/${msgId}/likes`);
    const likedByRef = ref(database, `publicMessages/${msgId}/likedBy/${user.uid}`);

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

  const handleDelete = (msgId: string) => {
    if (!window.confirm("هل تريد حذف هذا المنشور؟ 🛑")) return;
    playSound('click');
    remove(ref(database, `publicMessages/${msgId}`));
    toast({ title: "تم حذف المنشور" });
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.entries(messagesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messagesData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div className="text-right">
            <h1 className="text-sm font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase">الإلهام المشترك 🔥</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-lg border border-border/50">
              <span className="text-[8px] font-black text-muted-foreground">المنشورات المتبقية:</span>
              {isPremium ? <Infinity size={10} className="text-yellow-600" /> : <span className="text-[10px] font-black text-primary">{3 - postsCountToday}/3</span>}
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto pb-40">
          {isLoading ? (
            <div className="text-center py-20 opacity-30 animate-pulse font-black">جاري جلب الإلهام...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-lg">كن أول من ينشر إنجازاته اليوم! 🐱✨</div>
          ) : messages.map((m) => (
            <div key={m.id} className="bg-card p-4 rounded-[2rem] shadow-md border border-border space-y-3 relative group">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <Link href={`/user/${m.senderId}`} onClick={() => playSound('click')}>
                    <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm hover:scale-110 transition-transform">
                      {m.senderAvatar}
                    </div>
                  </Link>
                  <div className="text-right">
                    <Link href={`/user/${m.senderId}`} onClick={() => playSound('click')} className="flex items-center gap-1 justify-end">
                      <span className="text-[11px] font-black text-primary hover:underline">{m.senderName}</span>
                      {m.senderIsPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                    </Link>
                    <div className="flex items-center gap-1 text-[7px] text-muted-foreground font-bold justify-end">
                      <Clock size={8} /> {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </div>
                  </div>
                </div>
                
                {(isAdmin || m.senderId === user?.uid) && (
                  <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg font-black text-xs">
                    X
                  </button>
                )}
              </div>

              <p className="text-sm font-bold text-foreground text-right leading-relaxed pr-2">
                {m.text}
              </p>

              <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                <button 
                  onClick={() => handleToggleLike(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all",
                    m.likedBy?.[user?.uid || ''] ? "bg-red-50 text-red-600 border border-red-100" : "bg-secondary text-muted-foreground hover:bg-red-50"
                  )}
                >
                  <Heart size={12} fill={m.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                  {m.likes || 0}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSend} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-3xl flex flex-col gap-2 shadow-2xl">
            <div className="flex gap-2">
              <Input 
                placeholder="ما هو إنجازك اليوم؟..." 
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-sm flex-1"
                value={inputText}
                maxLength={120}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shrink-0">
                <Send className="rotate-180" />
              </Button>
            </div>
            <div className="flex justify-between items-center px-3">
               <span className={cn("text-[8px] font-black", inputText.length > 100 ? "text-orange-500" : "text-muted-foreground")}>
                 {120 - inputText.length} حرف متبقي
               </span>
               <p className="text-[7px] font-bold text-muted-foreground opacity-60">سيتم حذف الرسائل تلقائياً بعد 24 ساعة 🕒</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
