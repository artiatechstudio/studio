
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, Heart, Trash2, Clock, Crown, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

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
      .filter((p: any) => p.type !== 'dispute') // لا نعرض النزاعات هنا، لها صفحة خاصة
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    const today = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData?.dailyPostCount?.[today] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "يمكنك نشر منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود! 👑" 
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
        userName: userData.name,
        userAvatar: userData.avatar || "🐱",
        isPremium: isPremium,
        text: postText.trim(),
        likes: 0,
        likedBy: {},
        timestamp: serverTimestamp(),
        type: 'regular'
      }));

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${today}`), (count) => (count || 0) + 1);

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
    const postLikesRef = ref(database, `publicPosts/${postId}/likes`);
    const likedByRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    runTransaction(likedByRef, (current) => {
      if (current) {
        runTransaction(postLikesRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("هل تريد حذف هذا المنشور؟")) return;
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
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full rotate-180"><Send size={20} className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2rem] border-none shadow-lg bg-card overflow-hidden mx-2">
          <CardContent className="p-6">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Textarea 
                placeholder="بماذا تفكر يا بطل؟ انشر إلهامك هنا..." 
                className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right p-4 focus-visible:ring-primary"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="flex items-center justify-between">
                {!isPremium && (
                  <p className="text-[10px] font-black text-muted-foreground flex items-center gap-1">
                    <AlertCircle size={12} /> متبقي لك: {Math.max(0, 2 - (userData?.dailyPostCount?.[new Date().toLocaleDateString('en-CA')] || 0))} منشور اليوم
                  </p>
                )}
                <Button 
                  type="submit" 
                  disabled={!postText.trim() || isSubmitting}
                  className="rounded-xl bg-primary hover:bg-primary/90 font-black gap-2 pr-6 pl-6 h-11 mr-auto"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} className="rotate-180" />}
                  انشر الآن
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any) => (
            <Card key={post.id} className="rounded-3xl border-none shadow-md bg-card overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xl overflow-hidden border border-border">
                        {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userAvatar}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="font-black text-primary text-xs">{post.userName}</p>
                        {post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                        <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </div>
                    </div>
                  </div>
                  {(post.userId === user?.uid || isAdmin) && (
                    <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">
                  {post.text}
                </p>

                <div className="pt-2 border-t border-border flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-black transition-colors",
                      post.likedBy?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground hover:text-red-400"
                    )}
                  >
                    <Heart size={16} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
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
