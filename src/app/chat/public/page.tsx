
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Heart, X, Crown, Clock, MessageSquare, ShieldCheck } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  // التنظيف التلقائي للمنشورات القديمة (24 ساعة)
  useEffect(() => {
    if (!postsData || !database) return;
    const now = Date.now();
    const expiry = 24 * 60 * 60 * 1000;
    
    Object.entries(postsData).forEach(([id, post]: [string, any]) => {
      if (post.timestamp && now - post.timestamp > expiry) {
        remove(ref(database, `publicPosts/${id}`));
      }
    });
  }, [postsData, database]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const userPostsToday = userData.dailyPublicPostsCount?.[todayStr] || 0;
    const isPremium = userData.isPremium === 1;

    if (!isPremium && userPostsToday >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "المستخدم المجاني يمكنه نشر 3 منشورات يومياً. اشترك في بريميوم للحرية الكاملة! 👑" });
      return;
    }

    playSound('click');
    const newPost = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar || "🐱",
      isPremium: userData.isPremium || 0,
      text: msgText.trim(),
      timestamp: serverTimestamp(),
      likes: 0,
      likedBy: {}
    };

    try {
      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}/dailyPublicPostsCount`), {
        [todayStr]: userPostsToday + 1
      });
      setMsgText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!database) return;
    const confirmDelete = window.confirm("هل تريد حذف هذا المنشور؟ 🗑️");
    if (!confirmDelete) return;

    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user || !database) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const postLikesCountRef = ref(database, `publicPosts/${postId}/likes`);

    runTransaction(postLikeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postLikesCountRef, (count) => (count || 1) - 1);
        return null; // إزالة الإعجاب
      } else {
        runTransaction(postLikesCountRef, (count) => (count || 0) + 1);
        playSound('success');
        return true; // إضافة إعجاب
      }
    });
  };

  const isPremium = userData?.isPremium === 1;
  const todayStr = new Date().toLocaleDateString('en-CA');
  const postsRemaining = isPremium ? "∞" : (3 - (userData?.dailyPublicPostsCount?.[todayStr] || 0));

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-tight text-sm">المجتمع العام</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
          </div>
        </div>
        <div className="bg-secondary/50 px-3 py-1 rounded-full text-[9px] font-black text-muted-foreground">
          المنشورات المتبقية: <span className="text-primary">{postsRemaining}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black text-xl">لا توجد منشورات بعد.. كن الأول! 🚀</div>
        ) : posts.map((post) => {
          const isMine = post.userId === user?.uid;
          const isAdmin = userData?.name === 'admin';
          const isLiked = post.likedBy?.[user?.uid || ''];

          return (
            <Card key={post.id} className="rounded-3xl border border-border shadow-sm bg-card overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-0">
                {/* Header: Publisher Info */}
                <div className="p-4 flex items-center justify-between border-b border-border/50 bg-secondary/5">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm hover:scale-105 transition-transform">
                        {post.userAvatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Link href={`/user/${post.userId}`} className="font-black text-primary text-xs hover:underline">{post.userName}</Link>
                        {post.isPremium === 1 && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                        <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </div>
                    </div>
                  </div>
                  {(isMine || isAdmin) && (
                    <Button 
                      onClick={() => handleDeletePost(post.id)} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>

                {/* Body: Content */}
                <div className="p-5">
                  <p className="text-sm font-bold text-foreground leading-relaxed break-words whitespace-pre-wrap">
                    {post.text}
                  </p>
                </div>

                {/* Footer: Interactions */}
                <div className="px-4 py-3 bg-secondary/10 flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-black shadow-sm",
                      isLiked ? "bg-red-500 text-white scale-105" : "bg-white text-muted-foreground border border-border"
                    )}
                  >
                    <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                    <span>{post.likes || 0}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black">
                    <MessageSquare size={14} />
                    <span>تعليق</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40">
        <form onSubmit={handleSendPost} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex flex-col gap-2 shadow-2xl">
          <div className="flex gap-2">
            <Input 
              placeholder="ماذا يدور في ذهنك؟ (120 حرف كحد أقصى)..." 
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary text-xs"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value.slice(0, 120))}
              maxLength={120}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
            >
              <Send className="rotate-180" />
            </Button>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className={cn("text-[8px] font-black", msgText.length >= 110 ? "text-red-500" : "text-muted-foreground")}>
              {120 - msgText.length} حرف متبقي
            </span>
            {isAdmin && <span className="text-[8px] font-black text-primary flex items-center gap-1"><ShieldCheck size={8} /> وضع الرقابة نشط</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
