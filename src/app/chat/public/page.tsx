
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, runTransaction, get } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Globe, Heart, Clock, User as UserIcon } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(post => (now - (post.timestamp || 0)) < oneDayInMs)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isPosting) return;
    if (postText.length > 150) {
      toast({ variant: "destructive", title: "المنشور طويل جداً", description: "الحد الأقصى هو 150 حرفاً." });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const userRef = ref(database, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();

      const newPostRef = push(postsRef);
      await set(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData?.name || "عضو مجهول",
        userAvatar: userData?.avatar || "🐱",
        text: postText.trim(),
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikesRef = ref(database, `publicPosts/${postId}/likesCount`);
    const likedByRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postLikesRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground">تختفي المنشورات بعد 24 ساعة لتبقى الساحة متجددة 🔥</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="انشر إلهامك اليوم... (150 حرفاً كحد أقصى)" 
                className="w-full h-24 p-4 rounded-2xl bg-secondary/50 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                value={postText}
                maxLength={150}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className={cn(
                "absolute bottom-2 left-4 text-[10px] font-black",
                postText.length >= 140 ? "text-red-500" : "text-muted-foreground"
              )}>
                {postText.length} / 150
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!postText.trim() || isPosting}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg"
            >
              {isPosting ? "جاري النشر..." : "نشر للعالم 🚀"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4 px-2">
          {isLoading ? (
            <div className="text-center py-20 animate-pulse">جاري تحميل الإلهام... 🌍</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black">كن أول من ينشر في المجتمع اليوم! 🐱✨</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Link href={`/user/${post.userId}`} onClick={() => playSound('click')} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                      {post.userAvatar || "🐱"}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-xs">{post.userName}</p>
                      <p className="text-[8px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </p>
                    </div>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLikePost(post.id)}
                    className={cn(
                      "rounded-full gap-1 text-[10px] font-black h-8",
                      post.likedBy?.[user?.uid || ''] ? "text-red-500 bg-red-50" : "text-muted-foreground"
                    )}
                  >
                    {post.likesCount || 0} <Heart size={12} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                  </Button>
                </div>
                <p className="text-sm font-bold text-foreground leading-relaxed text-right">
                  {post.text}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
