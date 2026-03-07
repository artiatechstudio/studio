
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, onValue, off } from 'firebase/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Trash2, Heart, Crown, ArrowLeft, Clock, MessageSquare, Globe, Sparkles, Infinity, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const today = new Date().toLocaleDateString('en-CA');
  const postsCountToday = userData?.dailyPublicPosts?.[today] || 0;
  const remainingPosts = isPremium ? Infinity : Math.max(0, 2 - postsCountToday);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || isSending || !user || !userData) return;

    if (!isPremium && postsCountToday >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي (منشورين)", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      const newPost = {
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        timestamp: serverTimestamp(),
        likesCount: 0
      };

      await push(postsRef, newPost);
      
      await runTransaction(ref(database, `users/${user.uid}/dailyPublicPosts/${today}`), (count) => (count || 0) + 1);

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const likesCountRef = ref(database, `publicPosts/${postId}/likesCount`);

    runTransaction(likeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(likesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(likesCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2 sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
              <Globe size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-1">
                <Sparkles size={8}/> انشر إلهامك للجميع
              </p>
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
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border">
                {userData?.avatar?.startsWith('http') ? (
                  <img src={userData.avatar} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{userData?.avatar || "🐱"}</span>
                )}
              </div>
              <textarea 
                placeholder="بماذا تفكر يا بطل؟..."
                className="flex-1 min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary/20 resize-none outline-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value.slice(0, 280))}
                disabled={isSending}
              />
            </div>
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-[10px] font-black text-primary">{postText.length}/280</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">حرفاً</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-accent">{isPremium ? '∞' : remainingPosts}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">متبقي اليوم</p>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSending || !postText.trim() || (!isPremium && remainingPosts === 0)}
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg gap-2"
              >
                {isSending ? "جاري النشر..." : "نشر الآن 🔥"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا توجد منشورات بعد.. كن الأول! 🐱🎤</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] overflow-hidden border border-border shadow-md bg-card transition-all hover:shadow-lg">
              <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between flex-row-reverse border-none">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                    <div className="w-11 h-11 rounded-full bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                      {post.userAvatar?.startsWith('http') ? (
                        <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{post.userAvatar || "🐱"}</span>
                      )}
                    </div>
                  </Link>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <h3 className="font-black text-primary text-sm">{post.userName}</h3>
                      {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </p>
                  </div>
                </div>
                
                {(post.userId === user?.uid || isAdmin) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] p-10 text-center" dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-primary text-right">حذف المنشور؟</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-muted-foreground leading-relaxed mt-2 text-right">
                          هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع عن هذا الفعل. ⚠️
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="flex-1 h-12 rounded-xl font-black bg-destructive hover:bg-destructive/90">حذف نهائي</AlertDialogAction>
                        <AlertDialogCancel className="flex-1 h-12 rounded-xl font-black">إلغاء</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">
                  {post.text}
                </p>
                <div className="flex items-center gap-4 border-t border-border/50 pt-3">
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 transition-all hover:scale-110",
                      post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground"
                    )}
                  >
                    <Heart size={18} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    <span className="text-xs font-black">{post.likesCount || 0}</span>
                  </button>
                  <Link href={`/chat/${post.userId}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare size={18} />
                    <span className="text-xs font-black italic">دردشة</span>
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
