
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Globe, X, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [inputText, setInputText] = useState('');
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

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((p: any) => (now - (p.timestamp || 0)) < dayInMs)
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [postsData]);

  const dailyPostsCount = useMemo(() => {
    if (!postsData || !user) return 0;
    const today = new Date().toLocaleDateString('en-CA');
    return Object.values(postsData).filter((p: any) => 
      p.userId === user.uid && 
      new Date(p.timestamp || Date.now()).toLocaleDateString('en-CA') === today
    ).length;
  }, [postsData, user]);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';
  const remainingPosts = isPremium ? 999 : Math.max(0, 3 - dailyPostsCount);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !userData) return;

    if (!isPremium && remainingPosts <= 0) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    playSound('click');
    const newPost = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar || "🐱",
      isPremium: isPremium ? 1 : 0,
      text: inputText.trim().slice(0, 120),
      timestamp: serverTimestamp(),
      likes: 0
    };

    push(postsRef, newPost);
    setInputText('');
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikesRef = ref(database, `public_posts/${postId}/likes`);
    const likedByRef = ref(database, `public_posts/${postId}/likedBy/${user.uid}`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postLikesRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesRef, (count) => (count || 0) + 1);
        playSound('success');
        return true;
      }
    });
  };

  const handleDeletePost = (postId: string) => {
    if (!isAdmin && postsData?.[postId]?.userId !== user?.uid) return;
    const confirmed = window.confirm("هل تريد حذف هذا المنشور؟ 🗑️");
    if (confirmed) {
      playSound('click');
      remove(ref(database, `public_posts/${postId}`));
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-[2rem] shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-sm">المجتمع العام</h2>
            <p className="text-[8px] text-muted-foreground font-bold mt-1">شارك إلهامك مع الجميع 🌍</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" size={18} />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 p-4 space-y-4 overflow-y-auto pb-44"
        >
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-sm">كن أول من يشارك اليوم! 🐱✨</div>
          ) : posts.map((p: any) => {
            const isLikedByMe = p.likedBy?.[user?.uid || ''];
            const canDelete = isAdmin || p.userId === user?.uid;

            return (
              <div key={p.id} className="bg-card border border-border p-4 rounded-[1.5rem] shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/user/${p.userId}`} className="shrink-0" onClick={() => playSound('click')}>
                      <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-xl border border-border shadow-sm hover:scale-105 transition-transform">
                        {p.userAvatar}
                      </div>
                    </Link>
                    <div className="text-right">
                      <Link href={`/user/${p.userId}`} onClick={() => playSound('click')}>
                        <div className="flex items-center gap-1">
                          <span className="font-black text-primary text-[11px]">{p.userName}</span>
                          {p.isPremium === 1 && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                        </div>
                      </Link>
                      <p className="text-[7px] text-muted-foreground font-bold">
                        {p.timestamp ? new Date(p.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleLike(p.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all",
                        isLikedByMe ? "bg-red-50 text-red-600 border border-red-100" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      <Heart size={12} fill={isLikedByMe ? "currentColor" : "none"} />
                      {p.likes || 0}
                    </button>
                    {canDelete && (
                      <button 
                        onClick={() => handleDeletePost(p.id)} 
                        className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center font-black transition-colors"
                        title="حذف"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs font-bold text-foreground leading-relaxed pr-1 text-right">
                  {p.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40 space-y-2">
          <div className="flex justify-between px-2">
            <span className={cn("text-[8px] font-black", inputText.length > 110 ? "text-red-500" : "text-muted-foreground/60")}>
              {120 - inputText.length} حرف متبقي
            </span>
            <span className="text-[8px] font-black text-muted-foreground/60">
              {isPremium ? "نشر غير محدود 👑" : `المتبقي اليوم: ${remainingPosts} منشور`}
            </span>
          </div>
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border border-border rounded-[1.5rem] flex gap-2 shadow-2xl">
            <Input 
              placeholder="اكتب شيئاً ملهماً..." 
              maxLength={120}
              className="h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs focus-visible:ring-primary"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={inputText.trim().length === 0}
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
            >
              <Send className="rotate-180" size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
