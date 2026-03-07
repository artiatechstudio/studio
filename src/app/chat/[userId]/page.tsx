
"use client"

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, runTransaction, remove } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Crown, Trash2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ChatRoomPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: otherId } = use(params);
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatId = useMemo(() => {
    if (!user) return '';
    return [user.uid, otherId].sort().join('_');
  }, [user, otherId]);

  const chatRootRef = useMemoFirebase(() => chatId ? ref(database, `chats/${chatId}`) : null, [database, chatId]);
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

  const handleDeleteConversation = async () => {
    if (!chatRootRef) return;
    setIsDeleting(true);
    playSound('click');
    try {
      await remove(chatRootRef);
      toast({ title: "تم حذف المحادثة نهائياً من الطرفين" });
      setShowDeleteDialog(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل حذف المحادثة" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = () => {
    if (!user || !otherId) return;
    playSound('click');
    const userLikesRef = ref(database, `users/${otherId}/likesCount`);
    const likedByRef = ref(database, `users/${otherId}/likedBy/${user.uid}`);
    const targetNotifRef = ref(database, `users/${otherId}/notifications`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(userLikesRef, (count) => (count || 1) - 1);
        toast({ title: "تم إلغاء الإعجاب" });
        return null;
      } else {
        runTransaction(userLikesRef, (count) => (count || 0) + 1);
        push(targetNotifRef, {
          type: 'like',
          title: 'إعجاب جديد! ❤️',
          message: `لقد أعجب أحدهم بملفك الشخصي.`,
          fromId: user.uid,
          isRead: false,
          timestamp: serverTimestamp()
        });
        toast({ title: "تم إرسال إعجاب! ❤️" });
        playSound('success');
        return true;
      }
    });
  };

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return Object.values(messagesData).sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messagesData]);

  const isLikedByMe = otherUserData?.likedBy?.[user?.uid || ''];
  const otherIsPremium = otherUserData?.isPremium === 1 || otherUserData?.name === 'admin';

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <Link href={`/user/${otherId}`} onClick={() => playSound('click')} className="shrink-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border border-border hover:scale-110 transition-transform shadow-sm overflow-hidden">
              {otherUserData?.avatar?.startsWith('http') ? (
                <img src={otherUserData.avatar} alt={otherUserData.name} className="w-full h-full object-cover" />
              ) : (
                <span>{otherUserData?.avatar || "🐱"}</span>
              )}
            </div>
          </Link>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <h2 className="font-black text-primary leading-none text-lg">{otherUserData?.name || "تحميل..."}</h2>
              {otherIsPremium && <Crown size={14} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 truncate max-w-[120px]">
              {otherUserData?.bio || "عضو طموح في كارينجو"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button onClick={handleToggleLike} variant="ghost" size="icon" className={cn("rounded-full", isLikedByMe ? "text-red-500" : "text-muted-foreground")}>
            <Heart fill={isLikedByMe ? "currentColor" : "none"} size={20} />
          </Button>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-destructive/10">
                <Trash2 size={20} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-10 text-center" dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-primary text-right">حذف المحادثة؟</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-bold text-muted-foreground leading-relaxed mt-2 text-right">
                  سيتم مسح كافة الرسائل في هذه المحادثة من **الطرفين** نهائياً. لا يمكن التراجع عن هذه العملية! 🐱⚠️
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                <AlertDialogAction onClick={handleDeleteConversation} disabled={isDeleting} className="flex-1 h-12 rounded-xl font-black bg-destructive hover:bg-destructive/90">
                  {isDeleting ? "جاري الحذف..." : "نعم، احذف المحادثة"}
                </AlertDialogAction>
                <AlertDialogCancel className="flex-1 h-12 rounded-xl font-black">إلغاء</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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

        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
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
