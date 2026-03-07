
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, get, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Globe, Clock, User, MessageSquareQuote } from 'lucide-react';
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
  const [isPosting, setIsPosting] = useState(false);

  const postsRef = useMemoFirebase(() => query(ref(database, 'publicPosts'), limitToLast(50)), [database]);
  const { data: rawPosts, isLoading } = useDatabase(postsRef);

  const activePosts = useMemo(() => {
    if (!rawPosts) return [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    return Object.entries(rawPosts)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(post => post.timestamp && (now - post.timestamp) < dayInMs)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [rawPosts]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postText.trim() || isPosting || postText.length > 150) return;

    setIsPosting(true);
    playSound('click');

    try {
      // جلب بيانات المستخدم لمرة واحدة بشكل آمن
      const userSnap = await get(ref(database, `users/${user.uid}`));
      const userData = userSnap.val();

      const newPost = {
        userId: user.uid,
        userName: userData?.name || 'عضو مجهول',
        userAvatar: userData?.avatar || '🐱',
        content: postText.trim(),
        timestamp: serverTimestamp()
      };

      await push(ref(database, 'publicPosts'), newPost);
      setPostText('');
      toast({ title: "تم النشر في المجتمع! 🌍" });
      playSound('success');
    } catch (error) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground">تختفي المناشير تلقائياً بعد 24 ساعة ⏳</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSendPost} className="space-y-3">
              <div className="relative">
                <Textarea 
                  placeholder="ما الذي يلهمك اليوم؟ (شاركه مع الجميع...)" 
                  className="min-h-[120px] rounded-2xl bg-secondary/30 border-none font-bold text-right p-4 resize-none focus-visible:ring-accent text-sm"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value.slice(0, 150))}
                  disabled={isPosting}
                />
                <div className={cn(
                  "absolute bottom-3 left-4 text-[10px] font-black",
                  postText.length >= 140 ? "text-red-500" : "text-muted-foreground opacity-40"
                )}>
                  {postText.length}/150
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isPosting || !postText.trim() || postText.length > 150}
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 font-black shadow-lg shadow-accent/20 gap-2"
              >
                {isPosting ? "جاري النشر..." : "انشر للإلهام ✨"}
                <Send size={18} className="rotate-180" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 px-2">
          <div className="flex items-center gap-2 text-primary font-black text-xs px-2">
            <MessageSquareQuote size={16} />
            آخر المستجدات
          </div>

          {isLoading ? (
            <div className="flex justify-center p-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePosts.length === 0 ? (
            <div className="text-center py-20 opacity-30 space-y-4">
              <div className="text-7xl">🍃</div>
              <p className="font-black text-lg">الساحة هادئة حالياً... كن أول من ينشر!</p>
            </div>
          ) : (
            activePosts.map((post) => (
              <Card key={post.id} className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden hover:scale-[1.01] transition-transform">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/user/${post.userId}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm hover:scale-110 transition-transform">
                        {post.userAvatar}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-xs leading-none">{post.userName}</p>
                        <p className="text-[8px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
                          <Clock size={8} />
                          {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed text-right">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
