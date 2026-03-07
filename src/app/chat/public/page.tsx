
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, runTransaction, get } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Heart, Clock, MessageSquare, ShieldAlert, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsUpdating] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1;

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const fullDay = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < fullDay) // فقط آخر 24 ساعة
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSending || !userData) return;

    // قيود المستخدم المجاني
    const today = new Date().toLocaleDateString('en-CA');
    const dailyPostsCount = userData.dailyPostsCount?.[today] || 0;
    
    if (!isPremium && dailyPostsCount >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "المستخدم المجاني يمكنه نشر 3 منشورات يومياً. اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      const newPost = {
        userId: user.uid,
        userName: userData.name || 'عضو مجهول',
        userAvatar: userData.avatar || '🐱',
        isPremium: isPremium ? 1 : 0,
        text: postText.trim().slice(0, 150),
        timestamp: serverTimestamp(),
        likesCount: 0
      };

      await push(postsRef, newPost);
      
      // تحديث عداد المنشورات اليومي
      await runTransaction(ref(database, `users/${user.uid}/dailyPostsCount/${today}`), (current) => {
        return (current || 0) + 1;
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const postLikesCountRef = ref(database, `publicPosts/${postId}/likesCount`);

    runTransaction(postLikeRef, (isLiked) => {
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
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
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
                placeholder="ماذا أنجزت اليوم؟ (حد أقصى 150 حرفاً)"
                className="w-full h-32 p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                maxLength={150}
              />
              <div className="absolute bottom-3 left-4 text-[10px] font-black text-muted-foreground">
                {postText.length}/150
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-muted-foreground">
                {!isPremium && <span className="flex items-center gap-1"><ShieldAlert size={12}/> متبقي لك {3 - (userData?.dailyPostsCount?.[new Date().toLocaleDateString('en-CA')] || 0)} منشورات</span>}
              </div>
              <Button disabled={isSending || !postText.trim()} className="rounded-xl px-8 h-12 font-black gap-2 shadow-lg">
                <Send className="rotate-180" size={18} /> نشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 px-2">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-black text-primary animate-pulse text-xs">جاري جلب إلهام المجتمع...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <MessageSquare size={64} className="mx-auto mb-4" />
              <p className="text-xl font-black">كن أول من ينشر إلهامه اليوم! 🐱✨</p>
            </div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm hover:scale-110 transition-transform">
                        {post.userAvatar}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="font-black text-primary text-sm">{post.userName}</p>
                        {post.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold justify-end">
                        <Clock size={10} />
                        {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-bold text-foreground text-right leading-relaxed bg-secondary/10 p-4 rounded-2xl border border-border/50">
                  {post.text}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <Button 
                    onClick={() => handleToggleLike(post.id)}
                    variant="ghost" 
                    className={cn(
                      "rounded-full gap-2 font-black text-xs",
                      post.likedBy?.[user?.uid || ''] ? "text-red-500 bg-red-50" : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Heart size={16} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {post.likesCount || 0}
                  </Button>
                  <Link href={`/chat/${post.userId}`} onClick={() => playSound('click')}>
                    <Button variant="ghost" className="text-primary font-black text-[10px] rounded-full">
                      تواصل خاص <MessageSquare size={14} className="mr-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
