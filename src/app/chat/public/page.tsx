
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, set, runTransaction, get } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Send, ArrowLeft, Globe, Clock, User as UserIcon } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData } = useDatabase(postsRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (p.timestamp || 0) > now - oneDay)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSending) return;
    if (postText.length > 150) {
      toast({ variant: "destructive", title: "الرسالة طويلة جداً", description: "الحد الأقصى 150 حرفاً." });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      const userRef = ref(database, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();

      const newPostRef = push(postsRef);
      await set(newPostRef, {
        userId: user.uid,
        userName: userData.name || 'عضو مجهول',
        userAvatar: userData.avatar || '🐱',
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
      setIsSending(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikesRef = ref(database, `publicPosts/${postId}/likesCount`);
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
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground">شارك إلهامك بـ 150 حرفاً</p>
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
                placeholder="ما الذي يدور في ذهنك؟ 🌱" 
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-accent resize-none"
                value={postText}
                maxLength={150}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className={cn(
                "absolute bottom-3 left-4 text-[10px] font-black",
                postText.length >= 140 ? "text-red-500" : "text-muted-foreground opacity-40"
              )}>
                {postText.length} / 150
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSending || !postText.trim()} 
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 font-black gap-2 shadow-lg"
            >
              <Send size={18} className="rotate-180" /> {isSending ? "جاري النشر..." : "انشر الآن"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4 px-2">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <Globe size={64} className="mx-auto mb-4" />
              <p className="font-black text-xl">كن أول من ينشر في المجتمع! 🌟</p>
            </div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-3xl border-none shadow-md bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                    <Clock size={10} />
                    {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                  </div>
                  <Link href={`/user/${post.userId}`} className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-black text-primary text-xs leading-none">{post.userName}</p>
                      <p className="text-[8px] font-bold text-muted-foreground mt-1">عضو في كارينجو</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                      {post.userAvatar}
                    </div>
                  </Link>
                </div>
                
                <p className="text-sm font-bold text-right leading-relaxed text-slate-700 bg-secondary/10 p-4 rounded-2xl border-r-4 border-accent/20">
                  {post.text}
                </p>

                <div className="flex justify-start">
                  <Button 
                    onClick={() => handleLike(post.id)}
                    variant="ghost" 
                    className={cn(
                      "h-9 rounded-full gap-2 px-4 font-black text-xs",
                      post.likedBy?.[user?.uid || ''] ? "bg-red-50 text-red-600" : "bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <Heart size={14} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
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
