
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, get } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, MessageCircle, Heart, Clock, User as UserIcon, Sparkles } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSending, setIsUpdating] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1;

  const posts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(p => (now - (p.timestamp || 0)) < dayInMs)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const todayPostsCount = useMemo(() => {
    if (!user || !postsData) return 0;
    const today = new Date().toLocaleDateString('en-CA');
    return Object.values(postsData).filter((p: any) => p.senderId === user.uid && p.dateStr === today).length;
  }, [postsData, user]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSending) return;

    if (!isPremium && todayPostsCount >= 3) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "المستخدم المجاني يمكنه إرسال 3 منشورات يومياً. اشترك في بريميوم للنشر غير المحدود! 👑" });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await push(postsRef, {
        id: newPostRef.key,
        senderId: user.uid,
        senderName: userData?.name || 'مجهول',
        senderAvatar: userData?.avatar || '🐱',
        isPremiumSender: isPremium ? 1 : 0,
        text: postText.trim(),
        timestamp: serverTimestamp(),
        dateStr: new Date().toLocaleDateString('en-CA'),
        likes: 0
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLikePost = (postId: string) => {
    if (!user) return;
    playSound('click');
    const postLikesRef = ref(database, `publicPosts/${postId}/likes`);
    const likedByRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    get(likedByRef).then(snap => {
      if (snap.exists()) {
        toast({ title: "لقد أعجبت بهذا المنشور سابقاً" });
      } else {
        const currentLikes = posts.find(p => p.id === postId)?.likes || 0;
        const updates: any = {};
        updates[`publicPosts/${postId}/likes`] = currentLikes + 1;
        updates[`publicPosts/${postId}/likedBy/${user.uid}`] = true;
        require('firebase/database').update(ref(database), updates);
        playSound('success');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Globe size={32} />
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <Clock size={10} /> منشورات آخر 24 ساعة تختفي تلقائياً
            </p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="بماذا تفكر اليوم؟ (حد أقصى 150 حرفاً)" 
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/50 border-none font-bold text-right text-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                value={postText}
                maxLength={150}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="absolute bottom-3 left-4 text-[10px] font-black text-muted-foreground">
                {postText.length} / 150
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-muted-foreground px-2">
                {!isPremium && <span className="text-accent">تبقى لك {Math.max(0, 3 - todayPostsCount)} منشورات اليوم</span>}
              </div>
              <Button 
                type="submit" 
                disabled={!postText.trim() || isSending}
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg gap-2"
              >
                {isSending ? "جاري النشر..." : "انشر للإلهام 🚀"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-20 font-black text-xl">لا يوجد ملهمون حالياً.. كن الأول! 🐱✨</div>
          ) : posts.map((p) => (
            <Card key={p.id} className="rounded-[2rem] border-none shadow-md overflow-hidden bg-card transition-all hover:scale-[1.01]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <Link href={`/user/${p.senderId}`} className="shrink-0">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl shadow-inner border border-border">
                        {p.senderAvatar || "🐱"}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="font-black text-primary text-sm">{p.senderName}</p>
                        {p.isPremiumSender === 1 && <Sparkles size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground">{p.timestamp ? formatDistanceToNow(p.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLikePost(p.id)}
                    className="rounded-full gap-2 text-red-500 hover:bg-red-50 bg-red-50/30"
                  >
                    <span className="font-black text-xs">{p.likes || 0}</span>
                    <Heart size={16} className={p.likes > 0 ? "fill-current" : ""} />
                  </Button>
                </div>
                <p className="text-right font-bold text-primary leading-relaxed bg-primary/5 p-4 rounded-2xl border-r-4 border-primary">
                  {p.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
