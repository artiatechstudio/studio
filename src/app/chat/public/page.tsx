
"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, update } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Globe, Crown, Sparkles, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'public_posts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(100)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [postsData]);

  // حذف الرسائل القديمة (24 ساعة)
  useEffect(() => {
    if (!postsData) return;
    const now = Date.now();
    const expiry = 24 * 60 * 60 * 1000;
    
    Object.entries(postsData).forEach(([id, post]: [string, any]) => {
      if (post.timestamp && now - post.timestamp > expiry) {
        remove(ref(database, `public_posts/${id}`));
      }
    });
  }, [postsData, database]);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [postsData]);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyPostCount = userData?.dailyPublicPosts?.[todayStr] || 0;
  const isPremium = userData?.isPremium === 1;
  const canPost = isPremium || dailyPostCount < 3;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !canPost) return;

    playSound('click');
    const newPost = {
      senderId: user.uid,
      senderName: userData?.name || 'مجهول',
      senderAvatar: userData?.avatar || '🐱',
      senderIsPremium: isPremium,
      text: msgText.trim().slice(0, 120),
      timestamp: serverTimestamp(),
      likesCount: 0
    };

    try {
      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPublicPosts/${todayStr}`]: dailyPostCount + 1
      });
      setMsgText('');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikesRef = ref(database, `public_posts/${postId}/likesCount`);
    const postLikedByRef = ref(database, `public_posts/${postId}/likedBy/${user.uid}`);

    runTransaction(postLikedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postLikesRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDeletePost = (postId: string) => {
    if (!window.confirm("حذف المنشور نهائياً؟ 🗑️")) return;
    playSound('click');
    remove(ref(database, `public_posts/${postId}`));
    toast({ title: "تم الحذف" });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center shadow-md">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">المجتمع العام</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">تختفي الرسائل تلقائياً بعد 24 ساعة 🔥</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto pb-48">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر إلهامه اليوم! 🌍✨</div>
          ) : posts.map((p) => {
            const isMine = p.senderId === user?.uid;
            const isAdmin = userData?.name === 'admin';
            const isLiked = p.likedBy?.[user?.uid || ''];

            return (
              <div key={p.id} className="flex flex-col gap-2 group animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between flex-row-reverse px-2">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Link href={`/user/${p.senderId}`} className="shrink-0 hover:scale-110 transition-transform">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg border border-border shadow-sm">
                        {p.senderAvatar}
                      </div>
                    </Link>
                    <div className="text-right">
                      <Link href={`/user/${p.senderId}`} className="flex items-center gap-1 justify-end">
                        <span className="font-black text-primary text-[10px]">{p.senderName}</span>
                        {p.senderIsPremium && <Crown size={8} className="text-yellow-500" fill="currentColor" />}
                      </Link>
                    </div>
                  </div>
                  {(isMine || isAdmin) && (
                    <button 
                      onClick={() => handleDeletePost(p.id)}
                      className="text-red-500 font-black text-xs hover:bg-red-50 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>

                <div className={cn(
                  "p-4 rounded-[1.5rem] font-bold text-sm shadow-sm relative border border-border",
                  isMine ? "bg-primary/5 text-primary rounded-tr-none mr-8" : "bg-card text-foreground rounded-tl-none ml-8"
                )}>
                  {p.text}
                  <button 
                    onClick={() => handleToggleLike(p.id)}
                    className={cn(
                      "absolute -bottom-3 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-md border transition-all",
                      isLiked ? "bg-red-500 text-white border-red-400" : "bg-white text-muted-foreground border-border"
                    )}
                  >
                    <Heart size={10} fill={isLiked ? "currentColor" : "none"} />
                    {p.likesCount || 0}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40 space-y-2">
          {!canPost && (
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-amber-700 mx-2">
              <AlertCircle size={12} /> وصلت لحد النشر اليومي (3/3). اشترك في بريميوم لنشر غير محدود! 👑
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex flex-col gap-2 shadow-2xl">
            <div className="flex gap-2">
              <Input 
                placeholder={canPost ? "شاركنا إنجازاً أو نصيحة..." : "تم بلوغ حد النشر اليومي"}
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value.slice(0, 120))}
                disabled={!canPost}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!canPost || !msgText.trim()}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
              >
                <Send className="rotate-180" />
              </Button>
            </div>
            <div className="flex items-center justify-between px-2">
               <span className={cn("text-[8px] font-black", msgText.length > 100 ? "text-orange-500" : "text-muted-foreground")}>
                 {120 - msgText.length} حرف متبقٍ
               </span>
               <span className="text-[8px] font-black text-muted-foreground">
                 {isPremium ? "نشر غير محدود 👑" : `${3 - dailyPostCount} منشور متبقٍ اليوم`}
               </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
