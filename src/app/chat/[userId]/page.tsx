
"use client"

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, runTransaction } from 'firebase/database';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Trash2, Heart } from 'lucide-react';
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

  const handleDeleteChat = () => {
    if (!window.confirm("هل أنت متأكد من حذف سجل هذه الدردشة؟ لا يمكن التراجع عن ذلك.")) return;
    playSound('click');
    set(messagesRef, null).then(() => {
      toast({ title: "تم حذف السجل" });
    });
  };

  const handleLikeProfile = () => {
    if (!user || !otherId) return;
    playSound('success');
    
    const otherUserLikesRef = ref(database, `users/${otherId}/likesCount`);
    const likedByRef = ref(database, `users/${otherId}/likedBy/${user.uid}`);
    
    runTransaction(likedByRef, (current) => {
      if (current === true) {
        toast({ title: "لقد أعجبت بهذا الملف مسبقاً!" });
        return;
      }
      
      runTransaction(otherUserLikesRef, (count) => (count || 0) + 1);
      toast({ title: "تم إرسال إعجاب! ❤️" });
      return true;
    });
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.values(messagesData).sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [messagesData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col" dir="rtl">
      <NavSidebar />
      <div className="flex-1 app-container py-4 flex flex-col gap-4 overflow-hidden h-screen pb-24 md:pb-4">
        <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-2 mt-2 sticky top-2 z-30">
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
            <Button onClick={handleLikeProfile} variant="ghost" size="icon" className="rounded-full text-red-500 hover:bg-red-50">
              <Heart size={20} fill={otherUserData?.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
            </Button>
            <Button onClick={handleDeleteChat} variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-destructive/5">
              <Trash2 size={20} />
            </Button>
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="rotate-180" />
              </Button>
            </Link>
          </div>
        </header>

        <Card className="flex-1 rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2 flex flex-col relative mb-4">
          <div 
            ref={scrollRef}
            className="flex-1 p-6 space-y-4 overflow-y-auto bg-secondary/5 scroll-smooth pb-40"
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

          <form onSubmit={handleSendMessage} className="absolute bottom-24 md:bottom-6 left-4 right-4 p-2 bg-card/95 backdrop-blur-md border-2 border-primary/20 rounded-2xl flex gap-2 z-20 shadow-2xl">
            <Input 
              placeholder="اكتب رسالتك..." 
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary"
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
        </Card>
      </div>
    </div>
  );
}
