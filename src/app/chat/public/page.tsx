
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction, get } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, Trash2, Heart, Loader2, ArrowLeft, AlertCircle, Megaphone, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData)
      .filter((p: any) => p.type !== 'dispute') // المنشورات العادية فقط
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || !userData || isSubmitting) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "يمكنك نشر منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود! 👑" });
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await push(ref(database, 'publicPosts'), {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        avatar: userData.avatar,
        text: postText.trim(),
        isPremium: isPremium,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: {}
      });

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (count) => (count || 0) + 1);

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const postLikesCountRef = ref(database, `publicPosts/${postId}/likes`);

    runTransaction(postLikeRef, (current) => {
      if (current) {
        runTransaction(postLikesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async (postId: string, authorId: string) => {
    if (!user || (user.uid !== authorId && !isAdmin)) return;
    if (!window.confirm("هل تريد حذف هذا المنشور؟ 🐱")) return;

    playSound('click');
    try {
      // البحث عن المفتاح الحقيقي للمنشور في قاعدة البيانات
      const snap = await get(ref(database, 'publicPosts'));
      const entries = Object.entries(snap.val() || {});
      const target = entries.find(([key, val]: any) => val.id === postId || (val.text === postsData[postId]?.text && val.userId === authorId));
      
      if (target) {
        await remove(ref(database, `publicPosts/${target[0]}`));
        toast({ title: "تم حذف المنشور" });
      } else {
        // محاولة مسح مباشرة إذا كان postId هو المفتاح
        await remove(ref(database, `publicPosts/${postId}`));
        toast({ title: "تم الحذف" });
      }
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
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">التواصل العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الأبطال 🌍</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea 
              placeholder="بماذا تفكر اليوم يا بطل؟..." 
              className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus-visible:ring-primary"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <Megaphone size={12} className="text-primary" />
                {!isPremium ? `المتبقي لك اليوم: ${Math.max(0, 2 - (userData?.dailyPostCount?.[new Date().toLocaleDateString('en-CA')] || 0))}` : "نشر غير محدود للبريميوم 👑"}
              </div>
              <Button type="submit" disabled={isSubmitting || !postText.trim()} className="rounded-xl h-10 px-6 font-black gap-2 shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} className="rotate-180" />}
                نشر
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any, idx: number) => (
            <Card key={post.id || idx} className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.userId}`} className="shrink-0">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                        {post.avatar?.startsWith('data:image') ? <img src={post.avatar} className="w-full h-full object-cover" /> : post.avatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="font-black text-primary text-xs flex items-center gap-1 justify-end">
                        {post.userName} {post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </p>
                      <p className="text-[8px] text-muted-foreground font-bold">{post.timestamp ? new Date(post.timestamp).toLocaleString('ar-LY') : 'الآن'}</p>
                    </div>
                  </div>
                  {(user?.uid === post.userId || isAdmin) && (
                    <Button onClick={() => handleDelete(post.id, post.userId)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>
                
                <div className="pt-2 flex items-center gap-4 border-t border-border/50">
                  <button onClick={() => handleLike(post.id)} className={cn("flex items-center gap-1 text-[10px] font-black transition-colors", post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground hover:text-red-400")}>
                    <Heart size={14} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {post.likes || 0}
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
