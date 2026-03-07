
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, get, set, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, ArrowLeft, Send, Globe, Clock, User as UserIcon, AlertCircle } from 'lucide-react';
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

  const publicPostsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(publicPostsRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < oneDayInMs) // عرض فقط آخر 24 ساعة
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSending) return;
    if (postText.length > 150) {
      toast({ variant: "destructive", title: "الرسالة طويلة جداً", description: "الحد الأقصى هو 150 حرفاً." });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      const userSnap = await get(ref(database, `users/${user.uid}`));
      const userData = userSnap.val();

      const newPostRef = push(ref(database, 'publicPosts'));
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
      setIsUpdating(false);
    }
  };

  const handleLikePost = (postId: string) => {
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
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground">تختفي المنشورات بعد 24 ساعة ⏳</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="بماذا تشعر اليوم؟ ألهم الآخرين... 🐱✨"
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                value={postText}
                maxLength={150}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className={cn(
                "absolute bottom-3 left-4 text-[10px] font-black",
                postText.length >= 140 ? "text-red-500" : "text-muted-foreground"
              )}>
                {postText.length} / 150
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSending || !postText.trim()}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg"
            >
              <Send size={18} className="rotate-180" />
              انشر إلهامك
            </Button>
          </form>
        </Card>

        <div className="space-y-4 px-2">
          {isLoading ? (
            <div className="text-center py-20 opacity-20"><Globe className="animate-spin mx-auto" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black italic">لا يوجد منشورات حالياً، كن أول من ينشر! 🐱💬</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                    <Clock size={10} />
                    {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                  </div>
                  <Link href={`/user/${post.userId}`} className="flex items-center gap-3 flex-row-reverse group">
                    <div className="text-right">
                      <p className="font-black text-primary text-xs group-hover:underline">{post.userName}</p>
                    </div>
                    <div className="w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform">
                      {post.userAvatar || "🐱"}
                    </div>
                  </Link>
                </div>

                <p className="text-right font-bold text-sm leading-relaxed text-slate-700 bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                  {post.text}
                </p>

                <div className="flex items-center justify-start gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLikePost(post.id)}
                    className={cn(
                      "rounded-full gap-2 px-4 h-9 font-black transition-all",
                      post.likedBy?.[user?.uid || ''] ? "bg-red-50 text-red-600" : "bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <Heart size={16} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {post.likesCount || 0}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
