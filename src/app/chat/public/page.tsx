
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Globe, Heart, X, Clock, Crown, ShieldCheck } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'public_posts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';
  const today = new Date().toLocaleDateString('en-CA');
  const postsToday = userData?.dailyPublicPosts?.[today] || 0;

  // تنظيف تلقائي للمنشورات (أقدم من 24 ساعة)
  useEffect(() => {
    if (!postsData) return;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    Object.entries(postsData).forEach(([id, post]: [string, any]) => {
      if (post.timestamp && (now - post.timestamp) > dayMs) {
        remove(ref(database, `public_posts/${id}`));
      }
    });
  }, [postsData, database]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || isSending) return;

    if (!isPremium && !isAdmin && postsToday >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      await push(postsRef, {
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar,
        isPremium: isPremium,
        isAdmin: isAdmin,
        text: inputText.trim(),
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      if (!isAdmin) {
        await update(ref(database, `users/${user.uid}`), {
          [`dailyPublicPosts/${today}`]: postsToday + 1
        });
      }

      setInputText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikeRef = ref(database, `public_posts/${postId}/likedBy/${user.uid}`);
    const postCountRef = ref(database, `public_posts/${postId}/likesCount`);

    runTransaction(postLikeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postCountRef, (c) => (c || 1) - 1);
        return null;
      } else {
        runTransaction(postCountRef, (c) => (c || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    playSound('click');
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المنشور؟ ❌");
    if (!confirmed) return;

    try {
      await remove(ref(database, `public_posts/${postId}`));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const sortedPosts = useMemo(() => {
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
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase">انشر إلهامك للجميع 🌍</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
           <span className="text-[9px] font-black text-muted-foreground">المتبقي:</span>
           {isPremium || isAdmin ? <Infinity size={12} className="text-yellow-600" /> : <span className="text-xs font-black text-primary">{3 - postsToday}/3</span>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40" ref={scrollRef}>
        <Card className="rounded-[2rem] shadow-xl border-none bg-card p-4 overflow-hidden mb-6">
          <form onSubmit={handleSend} className="space-y-3">
            <div className="relative">
              <Input 
                placeholder="بماذا تفكر؟ (حد أقصى 120 حرفاً)" 
                className="h-14 pr-4 pl-12 rounded-2xl bg-secondary/30 border-none font-bold text-right text-xs focus-visible:ring-primary"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 120))}
                maxLength={120}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground opacity-40">
                {inputText.length}/120
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!inputText.trim() || isSending}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg font-black gap-2"
            >
              {isSending ? "جاري النشر..." : "نشر للعالم 🐱🚀"}
              <Send size={16} className="rotate-180" />
            </Button>
          </form>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🌍✨</div>
        ) : sortedPosts.map((post) => (
          <Card key={post.id} className="rounded-[2rem] border border-border shadow-md bg-card overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl border border-border hover:scale-110 transition-transform">
                      {post.userAvatar || "🐱"}
                    </div>
                  </Link>
                  <div className="text-right">
                    <Link href={`/user/${post.userId}`} className="flex items-center gap-1 group">
                      <span className="font-black text-primary text-[11px] group-hover:underline">{post.userName}</span>
                      {post.isAdmin ? <ShieldCheck size={10} className="text-red-500" /> : post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                    </Link>
                    <p className="text-[8px] text-muted-foreground flex items-center gap-1">
                      <Clock size={8} />
                      {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </p>
                  </div>
                </div>
                {(isAdmin || post.userId === user?.uid) && (
                  <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg">
                    <X size={18} />
                  </Button>
                )}
              </div>

              <p className="text-sm font-bold text-foreground leading-relaxed text-right">
                {post.text}
              </p>

              <div className="flex items-center justify-start gap-4 pt-2 border-t border-border/50">
                <button 
                  onClick={() => handleToggleLike(post.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-black transition-all hover:scale-110",
                    post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground"
                  )}
                >
                  <Heart size={16} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                  {post.likesCount || 0}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
