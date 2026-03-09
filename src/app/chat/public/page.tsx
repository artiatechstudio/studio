
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Trash2, Heart, ArrowLeft, Globe, Loader2, Megaphone } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData)
      .filter((p: any) => p.type !== 'dispute') // استبعاد النزاعات من الحائط العام
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || !userData || isPosting) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData.dailyPostCount?.[todayStr] || 0;
    const isPremium = userData.isPremium === 1 || userData.name === 'admin';

    if (!isPremium && dailyCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "المستخدم العادي له منشوران فقط يومياً. اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await push(ref(database, 'publicPosts'), {
        id: newPostRef.key,
        text: postText.trim(),
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || '🐱',
        isPremium: isPremium,
        likes: 0,
        likedBy: {},
        timestamp: serverTimestamp()
      });

      await update(ref(database, `users/${user.uid}/dailyPostCount`), {
        [todayStr]: dailyCount + 1
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🚀" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const countRef = ref(database, `publicPosts/${postId}/likes`);

    runTransaction(likeRef, (current) => {
      if (current) {
        runTransaction(countRef, (c) => (c || 1) - 1);
        return null;
      } else {
        runTransaction(countRef, (c) => (c || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("حذف المنشور؟ 🗑️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Globe size={24} /></div>
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Input 
              placeholder="بماذا تفكر يا بطل؟..." 
              className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-right text-sm"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <Button disabled={isPosting || !postText.trim()} className="w-full h-12 rounded-xl bg-primary font-black gap-2">
              {isPosting ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" />} انشر الآن
            </Button>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any) => (
            <Card key={post.id} className="rounded-2xl border-none shadow-md bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden">
                      {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userAvatar}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-xs flex items-center gap-1">
                        {post.userName} {post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </p>
                      <p className="text-[8px] text-muted-foreground font-bold">{new Date(post.timestamp).toLocaleString('ar-LY')}</p>
                    </div>
                  </div>
                  {(post.userId === user?.uid || userData?.name === 'admin') && (
                    <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="text-destructive h-8 w-8"><Trash2 size={14} /></Button>
                  )}
                </div>
                <p className="text-sm font-bold text-primary/80 leading-relaxed text-right">{post.text}</p>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleLike(post.id)} 
                    variant="ghost" 
                    size="sm" 
                    className={cn("gap-2 rounded-full font-black text-[10px]", post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground")}
                  >
                    {post.likes || 0} <Heart size={14} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
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
