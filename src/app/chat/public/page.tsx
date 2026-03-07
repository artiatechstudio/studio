
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, set, runTransaction, get, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Heart, Globe, Trash2, Clock, Crown, Sparkles } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsUpdating] = useState(false);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const isPremium = userData?.isPremium === 1;

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < oneDay) // عرض آخر 24 ساعة فقط
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    // فحص الحدود للمستخدمين المجانيين
    const today = new Date().toLocaleDateString('en-CA');
    const userPostsTodayRef = ref(database, `users/${user.uid}/dailyPostCount/${today}`);
    const countSnap = await get(userPostsTodayRef);
    const count = countSnap.exists() ? countSnap.val() : 0;

    if (!isPremium && count >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي (3 منشورات)", description: "اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await set(newPostRef, {
        userId: user.uid,
        userName: userData?.name || 'مجهول',
        userAvatar: userData?.avatar || '🐱',
        isPremium: isPremium ? 1 : 0,
        text: postText.trim(),
        timestamp: serverTimestamp(),
        likes: 0
      });

      // تحديث عداد المنشورات اليومي
      await set(userPostsTodayRef, count + 1);

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
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
    const postLikesRef = ref(database, `publicPosts/${postId}/likes`);
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
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
            <Globe size={32} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="بماذا تفكر اليوم؟ (حد أقصى 150 حرفاً)"
                className="w-full h-32 p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-foreground focus:ring-2 focus:ring-accent outline-none resize-none"
                maxLength={150}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <span className={cn(
                "absolute bottom-3 left-4 text-[10px] font-black",
                postText.length >= 140 ? "text-red-500" : "text-muted-foreground"
              )}>
                {postText.length}/150
              </span>
            </div>
            <div className="flex items-center justify-between">
               {!isPremium && <p className="text-[9px] font-bold text-muted-foreground">متبقي لك اليوم: {Math.max(0, 3 - (userData?.dailyPostCount?.[new Date().toLocaleDateString('en-CA')] || 0))} منشورات</p>}
               {isPremium && <p className="text-[9px] font-black text-yellow-600 flex items-center gap-1"><Sparkles size={10}/> نشر غير محدود للبريميوم</p>}
               <Button 
                type="submit" 
                disabled={isSubmitting || !postText.trim()}
                className="rounded-xl bg-accent hover:bg-accent/90 px-8 font-black shadow-lg shadow-accent/20"
               >
                نشر <Send size={16} className="mr-2 rotate-180" />
               </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black">لا يوجد منشورات حالياً، كن الأول! 🌟</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border-none shadow-md overflow-hidden bg-card transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm hover:scale-110 transition-transform">
                        {post.userAvatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="font-black text-primary text-sm">{post.userName}</p>
                        {post.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] text-muted-foreground font-bold flex items-center justify-end gap-1">
                        <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-bold text-foreground leading-relaxed text-right whitespace-pre-wrap">
                  {post.text}
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-black",
                      post.likedBy?.[user?.uid || ''] 
                        ? "bg-red-50 text-red-600 border border-red-100" 
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Heart size={14} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {post.likes || 0}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
