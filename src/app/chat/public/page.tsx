
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, update, get } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Trash2, Heart, Clock, Crown, Sparkles, Infinity, User, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
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

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyCount = userData?.dailyPostsCount?.[todayStr] || 0;
  const remainingPosts = isPremium ? Infinity : Math.max(0, 2 - dailyCount);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((p: any) => p.type !== 'dispute') // فلترة النزاعات لتجنب التداخل مع المحاكمة
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSending) return;

    if (!isPremium && remainingPosts <= 0) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "يسمح ببعضوين في اليوم للأعضاء العاديين. اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsSending(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'مستخدم مجهول',
      userAvatar: userData?.avatar || '🐱',
      isPremium: isPremium ? 1 : 0,
      text: postText.trim(),
      timestamp: serverTimestamp(),
      likes: {}
    };

    try {
      await push(postsRef, newPost);
      if (!isPremium) {
        await update(ref(database, `users/${user.uid}/dailyPostsCount`), {
          [todayStr]: dailyCount + 1
        });
      }
      setPostText('');
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
      toast({ title: "تم حذف المنشور بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likes/${user.uid}`);
    
    get(likeRef).then(snapshot => {
      if (snapshot.exists()) {
        remove(likeRef);
      } else {
        update(ref(database, `publicPosts/${postId}/likes`), {
          [user.uid]: true
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSendPost} className="space-y-4">
              <div className="flex items-start gap-3">
                <Link href="/profile">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                    {userData?.avatar?.startsWith('data:image') || userData?.avatar?.startsWith('http') ? (
                      <img src={userData.avatar} className="w-full h-full object-cover" alt="Me" />
                    ) : (
                      <span>{userData?.avatar || "🐱"}</span>
                    )}
                  </div>
                </Link>
                <textarea 
                  placeholder={`بماذا تفكر يا ${userData?.name?.split(' ')[0]}؟`}
                  className="flex-1 min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary/20 resize-none outline-none"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  maxLength={280}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase">المتبقي اليوم</span>
                    <div className="flex items-center gap-1 font-black text-primary">
                      {isPremium ? <Infinity size={14} className="text-yellow-500" /> : <span>{remainingPosts} منشور</span>}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase">الحروف</span>
                    <span className={cn("text-[10px] font-black", postText.length > 250 ? "text-red-500" : "text-primary")}>
                      {280 - postText.length}
                    </span>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={!postText.trim() || isSending || (!isPremium && remainingPosts <= 0)}
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg font-black gap-2"
                >
                  {isSending ? "جاري النشر..." : "نشر الآن"} <Send size={16} className="rotate-180" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-20 font-black text-xl">كن أول من ينشر في المجتمع! 🐱✨</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] shadow-md border border-border bg-card overflow-hidden">
              <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm overflow-hidden hover:scale-105 transition-transform">
                      {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                        <img src={post.userAvatar} className="w-full h-full object-cover" alt={post.userName} />
                      ) : (
                        <span>{post.userAvatar || "🐱"}</span>
                      )}
                    </div>
                  </Link>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Link href={`/user/${post.userId}`} className="font-black text-primary text-sm hover:underline">
                        {post.userName}
                      </Link>
                      {post.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground">
                      <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                    </div>
                  </div>
                </div>

                {(post.userId === user?.uid || isAdmin) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] p-10 text-center" dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-primary text-right">حذف المنشور؟</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-muted-foreground text-right mt-2">
                          هل أنت متأكد من رغبتك في حذف هذا المنشور نهائياً من المجتمع؟ 🐱⚠️
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="flex-1 h-12 rounded-xl font-black bg-destructive hover:bg-destructive/90">نعم، احذف</AlertDialogAction>
                        <AlertDialogCancel className="flex-1 h-12 rounded-xl font-black">إلغاء</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <p className="text-sm font-bold text-primary/80 leading-relaxed text-right whitespace-pre-wrap">
                  {post.text}
                </p>
                <div className="pt-3 border-t border-border/50 flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full transition-all",
                      post.likes?.[user?.uid || ''] 
                        ? "bg-red-50 text-red-600 font-black shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary font-bold"
                    )}
                  >
                    <Heart size={18} fill={post.likes?.[user?.uid || ''] ? "currentColor" : "none"} />
                    <span className="text-xs">{Object.keys(post.likes || {}).length}</span>
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
