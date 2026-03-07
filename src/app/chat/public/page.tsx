
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, runTransaction, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Heart, Trash2, Globe, Sparkles, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < oneDay) // تنظيف تلقائي (24 ساعة)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const todayPostsCount = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    return posts.filter(p => p.authorId === user?.uid && new Date(p.timestamp).toLocaleDateString('en-CA') === today).length;
  }, [posts, user]);

  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || !userData) return;

    if (!isPremium && todayPostsCount >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    playSound('click');
    const newPost = {
      authorId: user.uid,
      authorName: userData.name,
      authorAvatar: userData.avatar || "🐱",
      text: postText.trim(),
      likes: 0,
      timestamp: serverTimestamp(),
      isPremiumAuthor: isPremium
    };

    push(postsRef, newPost);
    setPostText('');
    toast({ title: "تم النشر بنجاح! 🚀" });
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likes`);
    const likedByRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    runTransaction(likedByRef, (alreadyLiked) => {
      if (alreadyLiked) return alreadyLiked;
      runTransaction(likeRef, (count) => (count || 0) + 1);
      return true;
    });
  };

  const handleDelete = (postId: string) => {
    if (!window.confirm("هل تريد حذف هذا المنشور؟ 🗑️")) return;
    playSound('click');
    remove(ref(database, `publicPosts/${postId}`));
    toast({ title: "تم حذف المنشور" });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
            <Globe size={32} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="بماذا تفكر اليوم؟ (حد أقصى 150 حرفاً)"
                maxLength={150}
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-accent outline-none resize-none text-foreground placeholder:text-muted-foreground/50"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="absolute bottom-3 left-4 text-[10px] font-black text-muted-foreground/40">
                {postText.length}/150
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <span className="text-[9px] font-black text-muted-foreground uppercase">المتبقي اليوم:</span>
                {isPremium ? <Crown size={12} className="text-yellow-500" /> : <span className="text-xs font-black text-accent">{3 - todayPostsCount}/3</span>}
              </div>
              <Button type="submit" className="rounded-xl bg-accent hover:bg-accent/90 font-black gap-2 px-6">
                نشر <Send size={16} className="rotate-180" />
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-20 font-black text-lg italic">لا توجد منشورات بعد.. كن أول الملهمين! ✨</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden group">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${post.authorId}`} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xl border border-border shadow-sm">
                      {post.authorAvatar}
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-black text-primary text-xs">{post.authorName}</span>
                        {post.isPremiumAuthor && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
                    </div>
                  </div>
                  {(isAdmin || post.authorId === user?.uid) && (
                    <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm font-bold text-foreground leading-relaxed text-right bg-secondary/10 p-4 rounded-2xl border-r-4 border-accent/20">
                  {post.text}
                </p>

                <div className="flex items-center justify-end gap-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group/like"
                  >
                    <span className="text-xs font-black">{post.likes || 0}</span>
                    <Heart size={18} className={cn("group-hover/like:scale-110 transition-transform", post.likedBy?.[user?.uid || ''] && "text-red-500 fill-current")} />
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
