
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, Trash2, Heart, ArrowLeft, Loader2, Crown } from 'lucide-react';
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
    // عرض المنشورات العادية فقط (ليست نزاعات)
    return Object.values(postsData)
      .filter((p: any) => p.type !== 'dispute')
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || !userData || isPosting) return;

    const isPremium = userData.isPremium === 1 || userData.name === 'admin';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "يمكن للمستخدمين العاديين نشر منشورين فقط يومياً. اشترك في بريميوم للنشر بلا حدود! 👑" 
      });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await update(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar,
        isPremium: isPremium,
        text: postText.trim(),
        likes: {},
        timestamp: serverTimestamp()
      });

      await update(ref(database, `users/${user.uid}/dailyPostCount`), {
        [todayStr]: dailyCount + 1
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
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
    const likeRef = ref(database, `publicPosts/${postId}/likes/${user.uid}`);
    runTransaction(likeRef, (current) => {
      return current ? null : true;
    });
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("هل تريد حذف هذا المنشور؟")) return;
    playSound('click');
    await remove(ref(database, `publicPosts/${postId}`));
    toast({ title: "تم الحذف" });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center"><Globe size={24} /></div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">التواصل العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع العالم 🌍</p>
            </div>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-4 mx-2">
          <Textarea 
            placeholder="ماذا يدور في ذهنك؟" 
            className="rounded-2xl bg-secondary/30 border-none min-h-[100px] font-bold text-right text-sm"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <Button 
            onClick={handleCreatePost} 
            disabled={isPosting || !postText.trim()}
            className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 font-black gap-2"
          >
            {isPosting ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" />}
            نشر الآن
          </Button>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any) => (
            <Card key={post.id} className="rounded-3xl border border-border shadow-sm bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                      {post.userAvatar?.startsWith('data:image') ? (
                        <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{post.userAvatar || "🐱"}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-xs flex items-center gap-1 justify-end">
                        {post.userName} {post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </p>
                      <p className="text-[8px] text-muted-foreground font-bold">{new Date(post.timestamp).toLocaleString('ar-LY')}</p>
                    </div>
                  </div>
                  {(post.userId === user?.uid || userData?.name === 'admin') && (
                    <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed text-right">{post.text}</p>
                <div className="pt-2 flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id)} 
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-black transition-colors",
                      post.likes?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground hover:text-red-400"
                    )}
                  >
                    <Heart size={16} fill={post.likes?.[user?.uid || ''] ? "currentColor" : "none"} />
                    {Object.keys(post.likes || {}).length}
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
