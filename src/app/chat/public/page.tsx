
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction, query, limitToLast } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, Heart, Crown, ArrowLeft } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const CHAR_LIMIT = 120;
const POST_LIMIT = 3;

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const today = new Date().toLocaleDateString('en-CA');
  const postsToday = userData?.dailyPublicPosts?.[today] || 0;
  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [postsData]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !user || !userData) return;

    if (!isPremium && postsToday >= POST_LIMIT) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    playSound('click');
    const newPost = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar,
      isPremium: userData.isPremium || 0,
      text: msgText.trim(),
      likes: 0,
      likedBy: {},
      timestamp: serverTimestamp()
    };

    push(postsRef, newPost);
    
    // تحديث عداد اليوم
    runTransaction(ref(database, `users/${user.uid}/dailyPublicPosts/${today}`), (count) => (count || 0) + 1);
    
    setMsgText('');
    toast({ title: "تم النشر بنجاح! 🌍" });
  };

  const handleDelete = (postId: string) => {
    if (!confirm("هل تريد حذف هذا المنشور؟")) return;
    playSound('click');
    remove(ref(database, `publicPosts/${postId}`));
    toast({ title: "تم حذف المنشور" });
  };

  const handleToggleLike = (postId: string, likedBy: any) => {
    if (!user) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${postId}/likes`);
    const postLikedByRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);

    const isLiked = likedBy && likedBy[user.uid];

    runTransaction(postLikedByRef, (current) => {
      if (current) {
        runTransaction(postLikeRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikeRef, (count) => (count || 0) + 1);
        playSound('success');
        return true;
      }
    });
  };

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [postsData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center shadow-md">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h2 className="font-black text-primary leading-none text-lg">المجتمع العام</h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">انشر إلهامك للعالم 🌍</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative pt-4">
        <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto pb-48">
          {posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🌍✨</div>
          ) : posts.map((post) => (
            <div key={post.id} className="flex flex-col gap-1">
              <div className={cn(
                "max-w-[90%] p-4 rounded-3xl shadow-sm relative group",
                post.userId === user?.uid ? "mr-auto bg-primary text-white rounded-br-none" : "ml-auto bg-white text-foreground rounded-bl-none border border-border"
              )}>
                {/* Header: Avatar and Name */}
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/user/${post.userId}`} className="shrink-0">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm border border-border shadow-inner hover:scale-110 transition-transform">
                      {post.userAvatar || "🐱"}
                    </div>
                  </Link>
                  <Link href={`/user/${post.userId}`} className="text-right overflow-hidden">
                    <div className="flex items-center gap-1">
                      <p className={cn("text-[10px] font-black truncate", post.userId === user?.uid ? "text-white" : "text-primary")}>
                        {post.userName}
                      </p>
                      {post.isPremium === 1 && <Crown size={8} className="text-yellow-500" fill="currentColor" />}
                    </div>
                  </Link>
                  
                  {/* Delete Button (X) */}
                  {(isAdmin || post.userId === user?.uid) && (
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="absolute top-2 left-2 text-red-500 font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      X
                    </button>
                  )}
                </div>

                <p className="text-sm font-bold leading-relaxed mb-3 break-words">{post.text}</p>

                {/* Footer: Time and Likes */}
                <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-current/10">
                  <span className="text-[8px] opacity-60 font-bold">
                    {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                  </span>
                  <button 
                    onClick={() => handleToggleLike(post.id, post.likedBy)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black transition-all",
                      post.likedBy?.[user?.uid || ''] 
                        ? "bg-red-500 text-white shadow-md scale-110" 
                        : "bg-black/5 text-current hover:bg-black/10"
                    )}
                  >
                    {post.likes || 0} <Heart size={10} fill={post.likedBy?.[user?.uid || ''] ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
          <Card className="p-3 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-3xl shadow-2xl space-y-2">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={cn("text-[9px] font-black", msgText.length > CHAR_LIMIT - 10 ? "text-red-500" : "text-muted-foreground")}>
                  {CHAR_LIMIT - msgText.length} حرف متبقٍ
                </span>
              </div>
              <div className="bg-secondary/50 px-2 py-0.5 rounded-lg text-[9px] font-black text-muted-foreground">
                المتبقي اليوم: {isPremium ? "∞" : `${POST_LIMIT - postsToday}/${POST_LIMIT}`}
              </div>
            </div>
            
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                placeholder="ماذا يدور في ذهنك؟..." 
                maxLength={CHAR_LIMIT}
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs md:text-sm focus-visible:ring-primary"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!msgText.trim()}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
              >
                <Send className="rotate-180" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
