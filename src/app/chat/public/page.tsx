
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, get, update, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Heart, MessageCircle, Clock, Globe, ShieldCheck, Crown } from 'lucide-react';
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

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < twentyFourHours)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const postsTodayCount = useMemo(() => {
    if (!postsData || !user) return 0;
    const today = new Date().toLocaleDateString('en-CA');
    return Object.values(postsData).filter((p: any) => 
      p.userId === user.uid && 
      new Date(p.timestamp).toLocaleDateString('en-CA') === today
    ).length;
  }, [postsData, user]);

  const isPremium = userData?.isPremium === 1;
  const canPost = isPremium || postsTodayCount < 3;

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || isSending || !user || !canPost) return;
    if (postText.length > 150) {
      toast({ variant: "destructive", title: "المنشور طويل جداً", description: "الحد الأقصى هو 150 حرفاً." });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await update(newPostRef, {
        id: newPostRef.key,
        text: postText.trim(),
        userId: user.uid,
        userName: userData?.name || 'مستخدم مجهول',
        userAvatar: userData?.avatar || '🐱',
        isPremium: userData?.isPremium || 0,
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (error) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  const handleLikePost = (postId: string) => {
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
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground">منشورات تختفي تلقائياً بعد 24 ساعة</p>
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
                placeholder={canPost ? "ماذا يدور في ذهنك؟ (بحد أقصى 150 حرفاً)..." : "وصلت للحد اليومي! اشترك في بريميوم للنشر بلا حدود 👑"}
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                value={postText}
                maxLength={150}
                disabled={!canPost}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="absolute bottom-3 left-4 text-[10px] font-black text-muted-foreground">
                {postText.length}/150
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground">
                {!isPremium && `تبقى لك ${3 - postsTodayCount} منشورات اليوم`}
              </p>
              <Button 
                type="submit" 
                disabled={isSending || !postText.trim() || !canPost} 
                className="rounded-xl h-11 px-8 font-black gap-2"
              >
                <Send size={18} className="rotate-180" />
                نشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 px-2">
          {posts.length > 0 ? posts.map((post) => (
            <Card key={post.id} className="rounded-3xl border-none shadow-md overflow-hidden bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.userId}`} className="shrink-0">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                        {post.userAvatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="font-black text-primary text-xs">{post.userName}</p>
                        {post.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground flex items-center justify-end gap-1">
                        <Clock size={8} />
                        {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-700 leading-relaxed text-right">
                  {post.text}
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-start gap-4">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-black transition-colors",
                      post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground hover:text-red-400"
                    )}
                  >
                    <Heart size={16} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {post.likesCount || 0}
                  </button>
                  <div className="text-[10px] font-bold text-muted-foreground/40 flex items-center gap-1">
                    <MessageCircle size={12} /> تواصل خاص
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-20 opacity-20 font-black">
              <Globe size={48} className="mx-auto mb-4" />
              لا يوجد منشورات حالياً.. كُن الأول!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
