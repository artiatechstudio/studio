
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Globe, Crown, Sparkles, Trash2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const chatRef = useMemoFirebase(() => ref(database, 'public_chat'), [database]);
  const chatQuery = useMemoFirebase(() => query(chatRef, limitToLast(100)), [chatRef]);
  const { data: chatData, isLoading } = useDatabase(chatQuery);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData) return;

    playSound('click');
    const msg = {
      senderId: user.uid,
      senderName: userData.name || 'عضو مجهول',
      senderAvatar: userData.avatar || '🐱',
      senderIsPremium: userData.isPremium === 1 || userData.name === 'admin',
      text: msgText.trim(),
      timestamp: serverTimestamp()
    };

    try {
      await push(chatRef, msg);
      setMsgText('');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!user) return;
    playSound('click');
    if (window.confirm("هل أنت متأكد من حذف هذا المنشور؟ 🐱🗑️")) {
      try {
        await remove(ref(database, `public_chat/${msgId}`));
        toast({ title: "تم حذف المنشور بنجاح" });
      } catch (e) {
        toast({ variant: "destructive", title: "فشل الحذف" });
      }
    }
  };

  const messages = useMemo(() => {
    if (!chatData) return [];
    return Object.entries(chatData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // الأحدث أولاً في الأسفل، لكننا سنعرض الصندوق بالأعلى
  }, [chatData]);

  const isAdmin = userData?.name === 'admin';

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-inner">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="font-black text-primary text-lg leading-tight">المجتمع العام</h1>
            <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
              <Sparkles size={10} /> انشر إلهامك للجميع
            </p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 app-container py-6 space-y-6">
        {/* صندوق كتابة المنشور - دائماً في الأعلى */}
        <section className="mx-2">
          <form onSubmit={handleSendMessage} className="bg-card p-4 rounded-[2rem] shadow-xl border-2 border-primary/10 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-lg shadow-sm border border-border">
                {userData?.avatar || "🐱"}
              </div>
              <p className="text-xs font-black text-primary">بماذا تفكر يا {userData?.name || 'بطل'}؟</p>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="اكتب رسالة ملهمة للمجتمع..." 
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-sm"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!msgText.trim()}
                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
              >
                <Send className="rotate-180" />
              </Button>
            </div>
          </form>
        </section>

        {/* قائمة المنشورات */}
        <div className="space-y-4 px-2 pb-32">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🌍✨</div>
          ) : messages.map((m) => {
            const isMine = m.senderId === user?.uid;
            const canDelete = isMine || isAdmin;
            
            return (
              <div key={m.id} className="bg-card p-5 rounded-[2rem] shadow-md border border-border space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <Link href={`/user/${m.senderId}`} onClick={() => playSound('click')} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                      {m.senderAvatar || "🐱"}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <p className="font-black text-primary text-xs">{m.senderName}</p>
                        {m.senderIsPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground">
                        {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </p>
                    </div>
                  </Link>
                  
                  {canDelete && (
                    <Button 
                      onClick={() => handleDeleteMessage(m.id)} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm font-bold text-slate-700 leading-relaxed text-right pr-2">
                  {m.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
