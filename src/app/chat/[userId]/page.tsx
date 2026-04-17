
"use client"

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, remove, runTransaction, update } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Crown, Trash2, Camera, X, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/user-avatar';
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
  const [msgImage, setMsgImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const myRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [database, user]);
  const { data: myData } = useDatabase(myRef);

  const isFollowing = myData?.following?.[otherId];

  useEffect(() => {
    if (user && chatId && database) {
      set(ref(database, `chats/${chatId}/lastSeen/${user.uid}`), serverTimestamp());
    }
  }, [user, chatId, messagesData, database]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messagesData]);

  const handleFollowToggle = async () => {
    if (!user || !otherId || !myData) return;
    playSound('click');
    const myFollowingRef = ref(database, `users/${user.uid}/following/${otherId}`);
    const theirFollowersRef = ref(database, `users/${otherId}/followers/${user.uid}`);
    const theirFollowersCountRef = ref(database, `users/${otherId}/followersCount`);
    const myFollowingCountRef = ref(database, `users/${user.uid}/followingCount`);

    try {
      if (isFollowing) {
        await set(myFollowingRef, null);
        await set(theirFollowersRef, null);
        runTransaction(theirFollowersCountRef, c => (c || 1) - 1);
        runTransaction(myFollowingCountRef, c => (c || 1) - 1);
      } else {
        await set(myFollowingRef, true);
        await set(theirFollowersRef, true);
        runTransaction(theirFollowersCountRef, c => (c || 0) + 1);
        runTransaction(myFollowingCountRef, c => (c || 0) + 1);
      }
    } catch (e) { toast({ variant: "destructive", title: "فشل الإجراء" }); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgText.trim() && !msgImage) || !user || !messagesRef || isSending) return;
    setIsSending(true);
    playSound('click');
    const msg = { senderId: user.uid, text: msgText.trim(), image: msgImage, timestamp: serverTimestamp() };
    try {
      const newMsgRef = push(messagesRef);
      const updates: any = {};
      updates[`chats/${chatId}/messages/${newMsgRef.key}`] = msg;
      const chatIdx = { lastMessage: msgText.trim() || 'صورة 📸', timestamp: serverTimestamp() };
      updates[`users/${user.uid}/activeChats/${chatId}`] = chatIdx;
      updates[`users/${otherId}/activeChats/${chatId}`] = chatIdx;
      await update(ref(database), updates);
      setMsgText(''); setMsgImage(null);
    } catch (e) { toast({ variant: "destructive", title: "فشل الإرسال" }); } finally { setIsSending(false); }
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
          <Link href={`/user/${otherId}`} className="shrink-0">
            <UserAvatar user={otherUserData} size="md" />
          </Link>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <h2 className="font-black text-primary leading-none text-lg">{otherUserData?.name || "..."}</h2>
              {(otherUserData?.isPremium === 1 || otherUserData?.name === 'admin') && <Crown size={14} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 truncate max-w-[120px]">{otherUserData?.bio || "عضو طموح"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleFollowToggle} className={cn("rounded-full", isFollowing ? "text-accent" : "text-muted-foreground")}>
            {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive/40"><Trash2 size={20}/></Button></AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]" dir="rtl">
              <AlertDialogHeader><AlertDialogTitle className="text-right">حذف المحادثة؟</AlertDialogTitle><AlertDialogDescription className="text-right">سيتم مسح المحادثة من الطرفين نهائياً.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter className="gap-2"><AlertDialogAction onClick={() => {
                remove(chatRootRef!);
                remove(ref(database, `users/${user?.uid}/activeChats/${chatId}`));
                remove(ref(database, `users/${otherId}/activeChats/${chatId}`));
                toast({ title: "تم حذف المحادثة" });
              }} className="bg-destructive">نعم، احذف</AlertDialogAction><AlertDialogCancel>إلغاء</AlertDialogCancel></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth pb-48">
          {messages.length === 0 ? <div className="text-center py-20 opacity-30 font-black text-xl">ابدأ الدردشة! 🐱💬</div> : messages.map((m: any, idx) => {
            const isMine = m.senderId === user?.uid;
            return (
              <div key={idx} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] p-3 rounded-3xl font-bold text-sm shadow-md space-y-2", isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-primary rounded-bl-none border border-border")}>
                  {m.image && <img src={m.image} className="rounded-xl w-full max-h-60 object-contain bg-black/5" alt="Msg" />}
                  {m.text && <p className="whitespace-pre-wrap text-right">{m.text}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex gap-2 shadow-2xl">
            <Input placeholder="اكتب رسالتك..." className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right" value={msgText} onChange={(e) => setMsgText(e.target.value)} disabled={isSending} />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-xl bg-primary shrink-0" disabled={isSending}>
              {isSending ? <Loader2 className="animate-spin"/> : <Send className="rotate-180" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
