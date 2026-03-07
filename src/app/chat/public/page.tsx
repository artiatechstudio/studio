
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, runTransaction, get } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Globe, ArrowLeft, Heart, Clock, User as UserIcon } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsUpdating] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const activePosts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(post => (now - (post.timestamp || 0)) < oneDay)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || postText.length > 150 || !user || isSending) return;

    setIsUpdating(true);
    playSound('click');

    try {
      const userSnap = await get(ref(database, `users/${user.uid}`));
      const userData = userSnap.val();

      const newPost = {
        authorId: user.uid,
        authorName: userData?.name || "مجهول",
        authorAvatar: userData?.avatar || "🐱",
        content: postText.trim(),
        timestamp: serverTimestamp(),
        likesCount: 0
      };

      await push(postsRef!, newPost);
      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍✨" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    
    const postLikesCountRef = ref(database, `publicPosts/${postId}/likesCount`);
    const userLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    runTransaction(userLikeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postLikesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-2xl border border-accent/20 shadow-inner">
            🌍
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">المجتمع العام</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">تختفي المنشورات بعد 24 ساعة</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth pb-40">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePosts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر إلهاماً اليوم! 🐱✨</div>
          ) : activePosts.map((post) => {
            const isLiked = post.likedBy?.[user?.uid || ''];
            return (
              <Card key={post.id} className="rounded-[2rem] border-none shadow-md overflow-hidden bg-card border border-border">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/user/${post.authorId}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                        {post.authorAvatar}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-xs leading-none">{post.authorName}</p>
                        <p className="text-[8px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
                          <Clock size={8} />
                          {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        </p>
                      </div>
                    </Link>
                    <Button 
                      onClick={() => handleToggleLike(post.id)}
                      variant="ghost" 
                      size="sm" 
                      className={cn("rounded-full gap-1.5 h-8 px-3 font-black text-[10px]", isLiked ? "text-red-500 bg-red-50" : "text-muted-foreground bg-secondary/50")}
                    >
                      <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                      {post.likesCount || 0}
                    </Button>
                  </div>
                  <p className="text-sm font-bold text-primary/80 leading-relaxed text-right pr-2 border-r-4 border-accent/20">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendPost} className="p-3 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-2xl space-y-2">
            <div className="flex gap-2">
              <Input 
                placeholder="انشر شيئاً ملهماً (بحد أقصى 150 حرفاً)..." 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                maxLength={150}
                disabled={isSending}
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
               <span className={cn("text-[9px] font-black", postText.length >= 140 ? "text-red-500" : "text-muted-foreground")}>
                 {postText.length} / 150
               </span>
               <span className="text-[9px] font-black text-muted-foreground">ساهم في نشر الإيجابية ✨</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
