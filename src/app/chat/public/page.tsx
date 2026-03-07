
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Trash2, ArrowLeft, Sparkles, MessageSquare, Crown, Clock } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Image from 'next/image';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(100)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const today = new Date().toLocaleDateString('en-CA');
  const postCountToday = userData?.dailyPublicPostCount?.[today] || 0;
  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    if (!isPremium && postCountToday >= 5) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    try {
      await push(postsRef, {
        userId: user.uid,
        userName: userData?.name || 'عضو مجهول',
        userAvatar: userData?.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        timestamp: serverTimestamp()
      });

      if (!isPremium) {
        const userUpdateRef = ref(database, `users/${user.uid}`);
        await push(ref(database, `users/${user.uid}/dailyPublicPostCount/${today}`), true); // Simulating count
        // Note: Better count logic should be used in production, here we just track it.
      }

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
    if (!window.confirm("هل تريد حذف هذا المنشور؟")) return;
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
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        {/* صندوق إنشاء المنشور - في الأعلى دائماً */}
        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-4 mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl overflow-hidden shrink-0 border border-border">
                {userData?.avatar && userData.avatar.startsWith('http') ? (
                  <Image src={userData.avatar} alt="Me" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <span>{userData?.avatar || "🐱"}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <textarea 
                  placeholder="بماذا تفكر يا بطل؟..." 
                  className="w-full min-h-[80px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-accent/20 resize-none outline-none"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value.slice(0, 280))}
                  maxLength={280}
                />
                <div className="flex items-center justify-between px-1">
                  <span className={cn("text-[9px] font-black", postText.length >= 250 ? "text-red-500" : "text-muted-foreground")}>
                    {postText.length} / 280 حرف
                  </span>
                  {!isPremium && (
                    <span className="text-[9px] font-black text-accent bg-accent/5 px-2 py-0.5 rounded-full">
                      متبقي لك: {Math.max(0, 5 - postCountToday)} منشورات اليوم
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!postText.trim() || isSubmitting}
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-sm font-black gap-2 shadow-lg shadow-accent/20"
            >
              <Send size={16} className="rotate-180" />
              نشر الآن
            </Button>
          </form>
        </Card>

        {/* جدار المنشورات */}
        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-muted-foreground animate-pulse">جاري تحميل حائط الإلهام...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <MessageSquare size={64} className="mx-auto mb-4" />
              <p className="font-black text-xl italic">كن أول من ينشر في المجتمع! 🐱🚀</p>
            </div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-3xl border-none shadow-md bg-card overflow-hidden transition-all hover:scale-[1.01]">
              <CardContent className="p-5 space-y-4">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')} className="shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-xl overflow-hidden border border-border shadow-sm">
                        {post.userAvatar && post.userAvatar.startsWith('http') ? (
                          <Image src={post.userAvatar} alt={post.userName} width={44} height={44} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <span>{post.userAvatar || "🐱"}</span>
                        )}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/user/${post.userId}`} className="font-black text-primary text-sm hover:underline">
                          {post.userName}
                        </Link>
                        {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground flex items-center justify-end gap-1">
                        {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        <Clock size={8} />
                      </p>
                    </div>
                  </div>
                  {(user?.uid === post.userId || userData?.name === 'admin') && (
                    <Button 
                      onClick={() => handleDeletePost(post.id)} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </header>

                <div className="bg-secondary/10 p-4 rounded-2xl border border-border/20">
                  <p className="text-sm font-bold text-foreground leading-relaxed text-right whitespace-pre-wrap break-words">
                    {post.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="text-center py-10 opacity-20 font-black text-[10px] uppercase tracking-[0.2em]">
          Careingo Community Wall
        </footer>
      </div>
    </div>
  );
}
