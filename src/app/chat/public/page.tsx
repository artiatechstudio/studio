
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, runTransaction, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Heart, Send, ArrowLeft, Clock, Trash2, Crown } from 'lucide-react';
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
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const postsCountToday = useMemo(() => {
    if (!posts) return 0;
    const today = new Date().toLocaleDateString('en-CA');
    return posts.filter(p => p.userId === user?.uid && new Date(p.timestamp).toLocaleDateString('en-CA') === today).length;
  }, [posts, user]);

  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || !userData || isSending) return;

    if (!isPremium && postsCountToday >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData.name,
      avatar: userData.avatar,
      text: postText.trim(),
      timestamp: serverTimestamp(),
      likesCount: 0,
      isPremiumUser: isPremium
    };

    push(postsRef, newPost).then(() => {
      setPostText('');
      setIsUpdating(false);
      playSound('success');
    });
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const likesCountRef = ref(database, `publicPosts/${postId}/likesCount`);

    runTransaction(postLikeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(likesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(likesCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDeletePost = (postId: string) => {
    if (!user) return;
    const confirmed = window.confirm("هل تريد حذف هذا المنشور؟ 🗑️");
    if (!confirmed) return;

    playSound('click');
    remove(ref(database, `publicPosts/${postId}`));
    toast({ title: "تم حذف المنشور" });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع العالم 🌍</p>
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
                placeholder="بماذا تفكر اليوم؟ (بحد أقصى 150 حرفاً)..."
                className="w-full h-32 p-4 rounded-2xl bg-secondary/50 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground/50"
                maxLength={150}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="absolute bottom-3 left-4 text-[10px] font-black text-muted-foreground">
                {postText.length}/150
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground">
                {!isPremium && <span className={cn(postsCountToday >= 3 ? "text-red-500" : "text-primary")}>المتبقي اليوم: {3 - postsCountToday}/3</span>}
                {isPremium && <span className="text-yellow-600 flex items-center gap-1">وضع اللا حدود <Crown size={10} /></span>}
              </div>
              <Button type="submit" disabled={isSending || !postText.trim()} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg gap-2 font-black">
                نشر <Send size={16} className="rotate-180" />
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="text-center py-20 opacity-30 font-black text-xl animate-pulse">جاري جلب المنشورات... 🌍</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا يوجد منشورات بعد. كن أول الملهمين! 🐱✨</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border-none shadow-md overflow-hidden bg-card transition-all hover:scale-[1.01]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border border-border shadow-sm hover:scale-110 transition-transform">
                        {post.avatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="font-black text-primary text-sm">{post.userName}</p>
                        {post.isPremiumUser && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold uppercase">
                        <Clock size={8} />
                        {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </div>
                    </div>
                  </div>
                  {(isAdmin || post.userId === user?.uid) && (
                    <Button onClick={() => handleDeletePost(post.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>

                <p className="text-sm font-bold text-foreground leading-relaxed text-right pr-2">
                  {post.text}
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all text-[10px] font-black",
                      post.likedBy?.[user?.uid || ''] 
                        ? "bg-red-50 text-red-600 border border-red-100" 
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Heart size={14} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {post.likesCount || 0} إعجاب
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
