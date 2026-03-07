
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, update, runTransaction, get } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, ArrowLeft, Heart, Crown, Clock, Sparkles } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const [isSubmitting, setIsUpdating] = useState(false);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const publicChatRef = useMemoFirebase(() => ref(database, 'publicChat'), [database]);
  const publicChatQuery = useMemoFirebase(() => query(publicChatRef, limitToLast(50)), [publicChatRef]);
  const { data: messagesData } = useDatabase(publicChatQuery);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';
  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyPostCount = userData?.dailyPublicPostCount?.[todayStr] || 0;

  // دالة حذف الرسائل القديمة (أكبر من 24 ساعة)
  useEffect(() => {
    if (!messagesData) return;
    const now = Date.now();
    const expiry = 24 * 60 * 60 * 1000;

    Object.entries(messagesData).forEach(([id, msg]: [string, any]) => {
      if (msg.timestamp && (now - msg.timestamp) > expiry) {
        remove(ref(database, `publicChat/${id}`));
      }
    });
  }, [messagesData, database]);

  const sortedMessages = useMemo(() => {
    if (!messagesData) return [];
    return Object.entries(messagesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // الأحدث في الأعلى
  }, [messagesData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData || isSubmitting) return;

    if (!isPremium && dailyPostCount >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "المستخدم المجاني يمكنه نشر 3 منشورات فقط يومياً. اشترك في بريميوم للحرية المطلقة! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    const newMsg = {
      senderId: user.uid,
      senderName: userData.name,
      senderAvatar: userData.avatar || "🐱",
      senderIsPremium: isPremium,
      text: msgText.trim(),
      timestamp: serverTimestamp(),
      likesCount: 0
    };

    try {
      await push(publicChatRef, newMsg);
      await update(ref(database, `users/${user.uid}/dailyPublicPostCount`), {
        [todayStr]: dailyPostCount + 1
      });
      setMsgText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLike = (msgId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicChat/${msgId}/likes/${user.uid}`);
    const countRef = ref(database, `publicChat/${msgId}/likesCount`);

    runTransaction(likeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(countRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(countRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDeleteMessage = async (msgId: string) => {
    playSound('click');
    if (!window.confirm("هل تريد حذف هذا المنشور نهائياً؟ 🗑️")) return;
    
    try {
      await remove(ref(database, `publicChat/${msgId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
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

      <div className="flex-1 overflow-hidden flex flex-col relative pt-4">
        <div className="flex-1 p-4 space-y-6 overflow-y-auto pb-48">
          {sortedMessages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱✨</div>
          ) : sortedMessages.map((m) => (
            <Card key={m.id} className="rounded-[2rem] border border-border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-0">
                {/* Header: Publisher Info */}
                <div className="p-4 flex items-center justify-between border-b border-border/50 bg-secondary/5">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${m.senderId}`} onClick={() => playSound('click')} className="shrink-0">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border hover:scale-110 transition-transform shadow-sm">
                        {m.senderAvatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Link href={`/user/${m.senderId}`} className="font-black text-primary text-xs hover:underline">{m.senderName}</Link>
                        {m.senderIsPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground flex items-center gap-1">
                        <Clock size={8} /> {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </p>
                    </div>
                  </div>
                  
                  {(isAdmin || m.senderId === user?.uid) && (
                    <Button 
                      onClick={() => handleDeleteMessage(m.id)} 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-50 h-8 w-8 rounded-full font-black"
                    >
                      X
                    </Button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 text-right">
                  <p className="text-sm font-bold text-foreground leading-relaxed break-words whitespace-pre-wrap">
                    {m.text}
                  </p>
                </div>

                {/* Footer: Interactions */}
                <div className="px-6 py-3 border-t border-border/30 flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleLike(m.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-black",
                      m.likes?.[user?.uid || ''] ? "bg-red-50 text-red-600 border border-red-100" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Heart size={14} fill={m.likes?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {m.likesCount || 0}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40">
          <Card className="p-3 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-3xl shadow-2xl space-y-2">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-primary">المتبقي اليوم:</span>
                {isPremium ? <span className="text-[10px] font-black text-yellow-600 flex items-center gap-0.5"><Sparkles size={10} /> غير محدود</span> : <span className="text-[10px] font-black text-primary">{3 - dailyPostCount}/3</span>}
              </div>
              <span className={cn("text-[9px] font-black", msgText.length > 110 ? "text-red-500" : "text-muted-foreground")}>
                {120 - msgText.length} حرف متبقي
              </span>
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input 
                placeholder="ماذا يدور في ذهنك؟..." 
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right text-xs focus-visible:ring-primary"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value.slice(0, 120))}
                maxLength={120}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!msgText.trim() || isSubmitting}
                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
              >
                <Send className="rotate-180" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
