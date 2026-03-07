
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, update, remove, runTransaction, query, limitToLast } from 'firebase/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Heart, Globe, Sparkles, Crown, Clock, Infinity, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(100)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const postsRemaining = isPremium ? 999 : Math.max(0, 5 - (userData?.dailyPublicPostCount?.[todayStr] || 0));

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    if (postsRemaining <= 0) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'عضو مجهول',
      userAvatar: userData?.avatar || '🐱',
      userIsPremium: isPremium,
      text: postText.trim(),
      timestamp: serverTimestamp(),
      likesCount: 0
    };

    try {
      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPublicPostCount/${todayStr}`]: (userData?.dailyPublicPostCount?.[todayStr] || 0) + 1
      });
      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleToggleLike = (postId: string, currentLikes: any) => {
    if (!user) return;
    playSound('click');
    
    const postLikeRef = ref(database, `publicPosts/${postId}/likes/${user.uid}`);
    const postLikesCountRef = ref(database, `publicPosts/${postId}/likesCount`);

    if (currentLikes?.[user.uid]) {
      // إزالة اللايك
      remove(postLikeRef);
      runTransaction(postLikesCountRef, (count) => (count || 1) - 1);
    } else {
      // إضافة لايك
      update(ref(database, `publicPosts/${postId}/likes`), { [user.uid]: true });
      runTransaction(postLikesCountRef, (count) => (count || 0) + 1);
      playSound('success');
    }
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
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </header>

        {/* صندوق النشر */}
        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-primary text-sm flex items-center gap-2">انشر شيئاً ملهماً <Sparkles size={16} className="text-accent" /></h3>
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              <span className="text-[9px] font-black text-muted-foreground">المنشورات المتبقية:</span>
              {isPremium ? <Infinity size={12} className="text-yellow-600" /> : <span className="text-xs font-black text-primary">{postsRemaining}/5</span>}
            </div>
          </div>
          
          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="relative">
              <Textarea 
                placeholder="بماذا تفكر يا بطل؟..."
                className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right p-4 focus-visible:ring-primary resize-none text-sm"
                value={postText}
                onChange={(e) => setPostText(e.target.value.slice(0, 280))}
                disabled={isSubmitting}
              />
              <div className={cn(
                "absolute bottom-3 left-4 text-[9px] font-black px-2 py-0.5 rounded-md",
                postText.length >= 250 ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
              )}>
                {postText.length} / 280
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !postText.trim() || postsRemaining <= 0}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg gap-2"
            >
              {isSubmitting ? "جاري النشر..." : "نشر المنشور الآن 🚀"}
            </Button>
          </form>
        </Card>

        {/* جدار المناشير */}
        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-muted-foreground animate-pulse">جاري تحميل نبض المجتمع...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center space-y-4 opacity-30">
              <div className="text-7xl">🍃</div>
              <p className="font-black text-xl">لا توجد منشورات بعد.. كن أول من ينشر!</p>
            </div>
          ) : posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onDelete={handleDeletePost} 
              onLike={handleToggleLike}
              isAdmin={userData?.name === 'admin'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, onDelete, onLike, isAdmin }: { post: any, currentUser: any, onDelete: any, onLike: any, isAdmin: boolean }) {
  const isMine = post.userId === currentUser?.uid;
  const canDelete = isMine || isAdmin;
  const isLikedByMe = post.likes?.[currentUser?.uid];
  const isAvatarUrl = post.userAvatar && post.userAvatar.startsWith('http');

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden transition-all hover:shadow-lg border border-border/50">
      <CardHeader className="p-5 border-b border-border/30 bg-secondary/5">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
              <div className="w-10 h-10 rounded-full bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden relative hover:scale-110 transition-transform">
                {isAvatarUrl ? (
                  <Image src={post.userAvatar} alt={post.userName} fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-xl">{post.userAvatar || "🐱"}</span>
                )}
              </div>
            </Link>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <h4 className="font-black text-primary text-xs">{post.userName}</h4>
                {(post.userIsPremium || post.userName === 'admin') && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground flex items-center gap-1 justify-end">
                <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
              </p>
            </div>
          </div>
          {canDelete && (
            <Button onClick={() => onDelete(post.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap break-words">
          {post.text}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <Button 
            onClick={() => onLike(post.id, post.likes)}
            variant="ghost" 
            className={cn(
              "h-10 rounded-xl gap-2 font-black text-[10px] px-4 transition-all",
              isLikedByMe ? "text-red-500 bg-red-50" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <Heart size={16} fill={isLikedByMe ? "currentColor" : "none"} className={cn(isLikedByMe && "animate-bounce")} />
            <span>{post.likesCount || 0}</span>
          </Button>
          
          <Link href={`/chat/${post.userId}`} onClick={() => playSound('click')}>
            <Button variant="ghost" className="h-10 rounded-xl gap-2 font-black text-[10px] text-primary hover:bg-primary/5">
              <MessageSquare size={16} />
              رد خاص
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
