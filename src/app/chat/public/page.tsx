
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, Heart, Crown, User, Clock } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1;

  // تنظيف تلقائي للمنشورات القديمة (أكثر من 24 ساعة)
  useEffect(() => {
    if (!postsData || !isAdmin) return;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    Object.entries(postsData).forEach(([id, post]: [string, any]) => {
      if (post.timestamp && (now - post.timestamp > oneDay)) {
        remove(ref(database, `publicPosts/${id}`));
      }
    });
  }, [postsData, isAdmin, database]);

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      // فلترة المنشورات التي مضى عليها أكثر من 24 ساعة في الواجهة أيضاً
      .filter(p => !p.timestamp || (now - p.timestamp < oneDay))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || !userData) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && !isAdmin && dailyCount >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    playSound('click');
    const newPost = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar || "🐱",
      text: postText.trim(),
      timestamp: Date.now(),
      likes: 0,
      isPremiumPost: isPremium
    };

    try {
      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}/dailyPostCount`), {
        [todayStr]: dailyCount + 1
      });
      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm("هل تريد حذف هذا المنشور؟");
    if (!confirmed) return;
    
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleLike = (postId: string, currentLikes: number) => {
    playSound('click');
    update(ref(database, `publicPosts/${postId}`), {
      likes: (currentLikes || 0) + 1
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Globe size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
            </div>
          </div>
        </header>

        <Card className="rounded-[2.5rem] p-5 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <Input 
                placeholder="ماذا يدور في ذهنك اليوم؟..." 
                className="h-14 pr-4 pl-12 rounded-2xl bg-secondary/50 border-none font-bold text-right text-sm focus-visible:ring-primary"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <Button type="submit" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary shadow-lg">
                <Send size={18} className="rotate-180" />
              </Button>
            </div>
            {!isPremium && !isAdmin && (
              <p className="text-[8px] font-black text-muted-foreground text-center uppercase">
                المتبقي لك اليوم: <span className="text-primary">{3 - (userData?.dailyPostCount?.[new Date().toLocaleDateString('en-CA')] || 0)}/3</span> منشورات
              </p>
            )}
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <Globe size={64} className="mx-auto mb-4" />
              <p className="font-black text-lg italic">كن أول من ينشر إلهامه هنا!</p>
            </div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border border-border shadow-sm bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${post.userId}`} className="shrink-0 hover:scale-105 transition-transform">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xl shadow-sm border border-border">
                        {post.userAvatar}
                      </div>
                    </Link>
                    <div className="text-right">
                      <Link href={`/user/${post.userId}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <h3 className="font-black text-primary text-xs">{post.userName}</h3>
                        {post.isPremiumPost && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </Link>
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                        <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </div>
                    </div>
                  </div>
                  {(isAdmin || post.userId === user?.uid) && (
                    <Button 
                      onClick={() => handleDeletePost(post.id)} 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 font-black text-xs"
                    >
                      X
                    </Button>
                  )}
                </div>

                <p className="text-sm font-bold text-foreground leading-relaxed text-right pr-2">
                  {post.text}
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id, post.likes)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group"
                  >
                    <Heart className={cn("w-4 h-4 transition-transform group-active:scale-125", post.likes > 0 && "text-red-500 fill-current")} />
                    <span className="text-[10px] font-black">{post.likes || 0}</span>
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
