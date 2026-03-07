
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, set, query, limitToLast, get, runTransaction } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Globe, Clock, User as UserIcon } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: rawPosts } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!rawPosts) return [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    return Object.entries(rawPosts)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => now - (p.timestamp || 0) < dayInMs) // تصفية آخر 24 ساعة
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [rawPosts]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || postText.length > 150 || !user || isSending) return;

    setIsSending(true);
    playSound('click');

    try {
      const userSnap = await get(ref(database, `users/${user.uid}`));
      const userData = userSnap.val();

      const newPostRef = push(postsRef);
      await set(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name || 'مجهول',
        userAvatar: userData.avatar || '🐱',
        text: postText.trim(),
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      setPostText('');
      playSound('success');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const likesCountRef = ref(database, `publicPosts/${postId}/likesCount`);

    runTransaction(postLikeRef, (currentVal) => {
      if (currentVal) {
        runTransaction(likesCountRef, count => (count || 1) - 1);
        return null;
      } else {
        runTransaction(likesCountRef, count => (count || 0) + 1);
        return true;
      }
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-2xl shadow-inner border border-accent/20">
            🌍
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">المجتمع العام</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">تختفي المناشير كل 24 ساعة ⏱️</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {posts.map((post) => {
          const isLiked = post.likedBy?.[user?.uid || ''];
          return (
            <Card key={post.id} className="rounded-3xl p-5 shadow-md border-none bg-card space-y-4 transition-all hover:scale-[1.01]">
              <div className="flex items-center justify-between">
                <Link href={`/user/${post.userId}`} onClick={() => playSound('click')} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl border border-border">
                    {post.userAvatar}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-sm leading-none">{post.userName}</p>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </p>
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleLike(post.id)}
                  className={cn("rounded-full gap-2 font-black text-xs", isLiked ? "text-red-500 bg-red-50" : "text-muted-foreground")}
                >
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                  {post.likesCount || 0}
                </Button>
              </div>
              <p className="font-bold text-sm text-primary leading-relaxed bg-secondary/10 p-4 rounded-2xl border-r-4 border-accent">
                {post.text}
              </p>
            </Card>
          );
        })}
        {posts.length === 0 && (
          <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر إلهامه اليوم! 🐱✨</div>
        )}
      </div>

      <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40">
        <form onSubmit={handleSendPost} className="p-3 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-[2rem] shadow-2xl flex flex-col gap-3">
          <div className="flex gap-2">
            <Input 
              placeholder="اكتب منشورك هنا (بحد أقصى 150 حرفاً)..." 
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-sm"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              maxLength={150}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isSending || !postText.trim()}
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
            >
              <Send className="rotate-180" />
            </Button>
          </div>
          <div className="flex justify-between items-center px-2">
            <p className={cn("text-[9px] font-black", postText.length >= 140 ? "text-red-500" : "text-muted-foreground")}>
              {postText.length} / 150
            </p>
            <p className="text-[9px] font-black text-accent flex items-center gap-1"><Globe size={10} /> النشر للجميع</p>
          </div>
        </form>
      </div>
    </div>
  );
}
