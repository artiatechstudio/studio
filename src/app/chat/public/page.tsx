
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, set, runTransaction, remove } from 'firebase/database';
import { MessageSquare, Heart, Send, Crown, Trash2, ArrowLeft, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

const POST_LIMIT = 150;

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsUpdating] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';
  const today = new Date().toLocaleDateString('en-CA');
  const postsTodayCount = userData?.dailyPublicPosts?.[today] || 0;

  const sortedPosts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < oneDay) // تنظيف تلقائي للمنشورات القديمة
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSending) return;

    if (!isPremium && postsTodayCount >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await set(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || "🐱",
        text: postText.trim(),
        likes: 0,
        isPremium: isPremium ? 1 : 0,
        timestamp: serverTimestamp()
      });

      await update(ref(database, `users/${user.uid}`), {
        [`dailyPublicPosts/${today}`]: postsTodayCount + 1
      });

      setPostText('');
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikesRef = ref(database, `publicPosts/${postId}/likes`);
    const postLikedByRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    runTransaction(postLikedByRef, (liked) => {
      if (liked) {
        runTransaction(postLikesRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("هل تريد حذف هذا المنشور؟ 🗑️");
    if (!confirmDelete) return;

    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع العالم ✨</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" size={20} />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="بماذا تفكر اليوم يا بطل؟..."
                className="w-full min-h-[100px] p-4 rounded-xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value.slice(0, POST_LIMIT))}
                maxLength={POST_LIMIT}
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className={cn("text-[9px] font-black", postText.length >= POST_LIMIT ? "text-red-500" : "text-muted-foreground")}>
                  {postText.length}/{POST_LIMIT}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
                <span className="text-[9px] font-black text-muted-foreground">النشر اليوم:</span>
                {isPremium ? <Sparkles size={12} className="text-yellow-600" /> : <span className="text-xs font-black text-primary">{3 - postsTodayCount}/3</span>}
              </div>
              <Button 
                type="submit" 
                disabled={!postText.trim() || isSending}
                className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20 gap-2"
              >
                {isSending ? "جاري الإرسال..." : "أنشر الآن"} <Send className="rotate-180" size={16} />
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black text-primary animate-pulse">كاري يجمع الحكايات...</p>
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="py-20 text-center opacity-30 font-black text-lg">كن أول من ينشر قصة نجاح اليوم! 🐱🌱</div>
          ) : sortedPosts.map((post) => {
            const isLiked = post.likedBy?.[user?.uid || ''];
            const canDelete = isAdmin || post.userId === user?.uid;

            return (
              <Card key={post.id} className="rounded-[1.5rem] border border-border shadow-sm overflow-hidden bg-card hover:border-primary/20 transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Link href={`/user/${post.userId}`} className="shrink-0">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl border border-border shadow-sm hover:scale-105 transition-transform">
                          {post.userAvatar}
                        </div>
                      </Link>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <h3 className="font-black text-primary text-xs">{post.userName}</h3>
                          {post.isPremium === 1 && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground">
                          {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        </p>
                      </div>
                    </div>
                    {canDelete && (
                      <Button onClick={() => handleDeletePost(post.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>

                  <p className="text-sm font-bold text-foreground leading-relaxed text-right pr-2 border-r-4 border-primary/10">
                    {post.text}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <Button 
                      onClick={() => handleLike(post.id)}
                      variant="ghost" 
                      className={cn("h-9 rounded-xl gap-2 font-black text-xs", isLiked ? "text-red-500 bg-red-50" : "text-muted-foreground")}
                    >
                      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      <span>{post.likes || 0}</span>
                    </Button>
                    <div className="flex items-center gap-1 text-[8px] font-black text-muted-foreground uppercase opacity-40">
                      <MessageSquare size={10} />
                      <span>منشور عام</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
