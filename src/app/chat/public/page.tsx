
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, remove, update, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, Globe, Crown, ShieldCheck, Clock, X } from 'lucide-react';
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
  const [isPosting, setIsPosting] = useState(false);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1;
  const today = new Date().toLocaleDateString('en-CA');

  // تنظيف المنشورات القديمة (> 24 ساعة)
  useEffect(() => {
    if (!postsData || !database) return;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    Object.entries(postsData).forEach(([id, post]: [string, any]) => {
      if (post.timestamp && (now - post.timestamp) > oneDay) {
        remove(ref(database, `publicPosts/${id}`));
      }
    });
  }, [postsData, database]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData || isPosting) return;

    const postLimit = 3;
    const postsToday = userData.dailyPublicPosts?.[today] || 0;

    if (!isPremium && postsToday >= postLimit) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    setIsPosting(true);
    playSound('click');

    const post = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar || "🐱",
      isPremium: userData.isPremium === 1,
      text: msgText.trim(),
      timestamp: Date.now(),
      likes: 0,
      likedBy: {}
    };

    try {
      await push(postsRef, post);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPublicPosts/${today}`]: postsToday + 1
      });
      setMsgText('');
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = (postId: string, currentLikes: number, likedBy: any) => {
    if (!user) return;
    playSound('click');
    
    const isLiked = likedBy?.[user.uid];
    const updates: any = {};
    
    if (isLiked) {
      updates[`publicPosts/${postId}/likedBy/${user.uid}`] = null;
      updates[`publicPosts/${postId}/likes`] = Math.max(0, currentLikes - 1);
    } else {
      updates[`publicPosts/${postId}/likedBy/${user.uid}`] = true;
      updates[`publicPosts/${postId}/likes`] = currentLikes + 1;
      playSound('success');
    }
    
    update(ref(database), updates);
  };

  const handleDeletePost = async (postId: string) => {
    if (!database) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">المجتمع العام</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">انشر إلهامك للجميع 🌍</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth pb-48">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl flex flex-col items-center gap-4">
              <span className="text-6xl">🌍</span>
              كن أول من ينشر في المجتمع!
            </div>
          ) : posts.map((post) => {
            const isMine = post.userId === user?.uid;
            const canDelete = isMine || isAdmin;
            const isLiked = post.likedBy?.[user?.uid || ''];

            return (
              <Card key={post.id} className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <Link href={`/user/${post.userId}`} className="shrink-0 hover:scale-105 transition-transform">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                          {post.userAvatar || "🐱"}
                        </div>
                      </Link>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Link href={`/user/${post.userId}`} className="font-black text-primary text-sm hover:underline">
                            {post.userName}
                          </Link>
                          {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                        </div>
                        <p className="text-[8px] text-muted-foreground font-bold flex items-center gap-1">
                          <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        </p>
                      </div>
                    </div>
                    {canDelete && (
                      <Button onClick={() => handleDeletePost(post.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg font-black">
                        X
                      </Button>
                    )}
                  </div>

                  <div className="p-5 text-right">
                    <p className="text-sm font-bold text-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {post.text}
                    </p>
                  </div>

                  <div className="px-4 py-2 bg-secondary/10 flex items-center justify-start gap-4">
                    <button 
                      onClick={() => handleToggleLike(post.id, post.likes || 0, post.likedBy)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-black",
                        isLiked ? "bg-red-100 text-red-600" : "bg-white text-muted-foreground border border-border"
                      )}
                    >
                      <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                      {post.likes || 0}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-3 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-[2rem] shadow-2xl flex flex-col gap-2">
            <div className="flex gap-2">
              <textarea 
                placeholder={isPremium ? "ماذا يدور في ذهنك؟..." : `شارك إنجازك... (${3 - (userData?.dailyPublicPosts?.[today] || 0)} متبقي)`}
                className="flex-1 min-h-[60px] p-3 rounded-2xl bg-secondary/50 border-none font-bold text-right text-xs focus:ring-2 focus:ring-primary/20 resize-none outline-none"
                value={msgText}
                maxLength={120}
                onChange={(e) => setMsgText(e.target.value)}
                disabled={isPosting}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!msgText.trim() || isPosting}
                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shrink-0 mt-auto"
              >
                <Send className="rotate-180" />
              </Button>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className={cn("text-[8px] font-black", msgText.length > 100 ? "text-orange-500" : "text-muted-foreground")}>
                {120 - msgText.length} حرف متبقي
              </span>
              {isAdmin && <span className="text-[8px] font-black text-primary flex items-center gap-1"><ShieldCheck size={8} /> وضع الرقابة نشط</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
