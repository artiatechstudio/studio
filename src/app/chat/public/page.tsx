
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Heart, Globe, Crown, Clock, Sparkles, AlertCircle, Infinity } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const today = new Date().toLocaleDateString('en-CA');
  const postCountToday = userData?.dailyPublicPostCount?.[today] || 0;
  const maxPosts = isPremium ? Infinity : 2;

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    if (!isPremium && postCountToday >= maxPosts) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي!", description: "يمكنك نشر منشورين فقط يومياً. اشترك في بريميوم للنشر اللامحدود! 👑" });
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await update(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData?.name || 'عضو كاري',
        userAvatar: userData?.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      await update(ref(database, `users/${user.uid}`), {
        [`dailyPublicPostCount/${today}`]: postCountToday + 1
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🚀" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shadow-inner">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
          </div>
        </header>

        {/* صندوق النشر (Facebook Style) */}
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-card overflow-hidden mx-2 border-t-4 border-accent">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl overflow-hidden border border-border">
                  {userData?.avatar?.startsWith('data:image') ? <img src={userData.avatar} className="w-full h-full object-cover" /> : (userData?.avatar || "🐱")}
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary">{userData?.name || 'تحميل...'}</p>
                  <p className="text-[8px] font-bold text-muted-foreground">بماذا تفكر؟</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg border border-border/20">
                  <span className="text-[8px] font-black text-muted-foreground">المتبقي اليوم:</span>
                  {isPremium ? <Infinity size={10} className="text-yellow-600" /> : <span className="text-[10px] font-black text-primary">{Math.max(0, 2 - postCountToday)}/2</span>}
                </div>
              </div>
            </div>

            <form onSubmit={handleSendPost} className="space-y-3">
              <div className="relative">
                <Textarea 
                  placeholder="انشر نصيحة، إنجازاً، أو كلمة مشجعة..."
                  className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus-visible:ring-accent p-4"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value.slice(0, 280))}
                  disabled={isSubmitting}
                />
                <div className={cn(
                  "absolute bottom-3 left-3 text-[9px] font-black px-2 py-0.5 rounded-full",
                  postText.length >= 250 ? "bg-red-100 text-red-600" : "bg-white/50 text-muted-foreground"
                )}>
                  {postText.length}/280
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || !postText.trim()}
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 font-black gap-2 shadow-lg shadow-accent/20"
              >
                {isSubmitting ? "جاري النشر..." : "نشر الآن 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* جدار المنشورات */}
        <div className="space-y-4 mx-2">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-20 space-y-4">
              <Globe size={64} className="mx-auto" />
              <p className="font-black text-lg">كن أول من يفتتح الجدار اليوم!</p>
            </div>
          ) : posts.map((post: any) => (
            <PublicPostCard key={post.id} post={post} currentUserId={user?.uid} isAdmin={isAdmin} database={database} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PublicPostCard({ post, currentUserId, isAdmin, database }: { post: any, currentUserId?: string, isAdmin: boolean, database: any }) {
  const isOwner = post.userId === currentUserId;
  const isLiked = post.likes?.[currentUserId || ''];

  const handleToggleLike = () => {
    if (!currentUserId) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${post.id}/likes/${currentUserId}`);
    const postLikesCountRef = ref(database, `publicPosts/${post.id}/likesCount`);

    runTransaction(postLikeRef, (current) => {
      if (current) {
        runTransaction(postLikesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesCountRef, (count) => (count || 0) + 1);
        playSound('success');
        return true;
      }
    });
  };

  const handleDelete = async () => {
    if (!isAdmin && !isOwner) return;
    if (!window.confirm("هل تريد حذف هذا المنشور؟ 🐱⚠️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <Card className="rounded-[2rem] border border-border shadow-md bg-card overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
              <div className="w-11 h-11 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-xl overflow-hidden relative">
                {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : (post.userAvatar || "🐱")}
              </div>
            </Link>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <h3 className="font-black text-primary text-sm">{post.userName}</h3>
                {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                <Clock size={8} />
                {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
              </div>
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <Button onClick={handleDelete} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full">
              <Trash2 size={14} />
            </Button>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
            {post.text}
          </p>
        </div>

        <div className="pt-2 border-t border-secondary flex items-center justify-between">
          <Button 
            onClick={handleToggleLike}
            variant="ghost" 
            className={cn(
              "h-9 px-4 rounded-xl gap-2 font-black text-xs transition-all",
              isLiked ? "text-red-500 bg-red-50" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            <span>{post.likesCount || 0} إعجاب</span>
          </Button>
          
          <div className="bg-secondary/30 px-3 py-1 rounded-full text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
            <Sparkles size={8} className="text-accent" /> مجتمع كارينجو
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
