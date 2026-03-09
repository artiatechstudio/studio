"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Trash2, Heart, ArrowLeft, Loader2, Megaphone, Sparkles, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const myRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: myData } = useDatabase(myRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData)
      .filter((p: any) => p.type !== 'dispute') // استثناء النزاعات لعرضها في صفحة المحاكمة
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const isAdmin = myData?.name === 'admin';
  const isPremium = myData?.isPremium === 1 || isAdmin;

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || isSubmitting) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = myData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "يمكن للمستخدم العادي نشر منشورين فقط يومياً. اشترك في بريميوم للنشر بلا حدود! 👑" 
      });
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await runTransaction(newPostRef, () => ({
        id: newPostRef.key,
        userId: user.uid,
        userName: myData?.name || 'بطل مجهول',
        userAvatar: myData?.avatar || '🐱',
        text: inputText.trim(),
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: {}
      }));

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (count) => (count || 0) + 1);

      setInputText('');
      toast({ title: "تم النشر بنجاح! 🌍✨" });
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
    const postCountRef = ref(database, `publicPosts/${postId}/likes`);

    runTransaction(postLikeRef, (current) => {
      if (current) {
        runTransaction(postCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("حذف هذا المنشور؟ 🐱🗑️")) return;
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
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner"><Globe size={24} /></div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الأبطال 🌍</p>
            </div>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2rem] p-4 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handlePost} className="flex gap-2">
            <Input 
              placeholder="بماذا تفكر اليوم؟..." 
              className="flex-1 h-12 rounded-xl bg-secondary/50 border-none font-bold text-right text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={200}
            />
            <Button type="submit" disabled={isSubmitting || !inputText.trim()} size="icon" className="h-12 w-12 rounded-xl bg-primary shadow-lg shrink-0">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" />}
            </Button>
          </form>
          {!isPremium && <p className="text-[8px] font-bold text-muted-foreground mt-2 px-2">متبقي لك اليوم: {Math.max(0, 2 - (myData?.dailyPostCount?.[new Date().toLocaleDateString('en-CA')] || 0))} منشورات.</p>}
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any) => (
            <Card key={post.id} className="rounded-[1.5rem] border-none shadow-md bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.userId}`} className="shrink-0">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                        {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : <span>{post.userAvatar || "🐱"}</span>}
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="font-black text-primary text-xs leading-none">{post.userName}</p>
                      <p className="text-[8px] font-bold text-muted-foreground mt-1 opacity-60">{post.timestamp ? new Date(post.timestamp).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}</p>
                    </div>
                  </div>
                  {(isAdmin || post.userId === user?.uid) && (
                    <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"><Trash2 size={14} /></Button>
                  )}
                </div>
                <p className="text-sm font-bold text-foreground leading-relaxed text-right">{post.text}</p>
                <div className="pt-2 border-t border-border flex items-center justify-start gap-4">
                  <button onClick={() => handleLike(post.id)} className={cn("flex items-center gap-1 text-[10px] font-black transition-colors", post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground hover:text-red-400")}>
                    <Heart size={16} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                    <span>{post.likes || 0}</span>
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
