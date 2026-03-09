
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, set, runTransaction, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, MessageSquare, Heart, Clock, User, Crown, Swords, Vote, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  const [isPosting, setIsPosting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const today = new Date().toLocaleDateString('en-CA');
  const dailyPostCount = userData?.dailyPostCount?.[today] || 0;

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isPosting) return;

    if (!isPremium && dailyPostCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "يمكن للمستخدمين العاديين نشر منشورين فقط يومياً." });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await set(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || "🐱",
        text: postText.trim(),
        likes: {},
        timestamp: serverTimestamp(),
        type: 'standard'
      });

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${today}`), (count) => (count || 0) + 1);
      
      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shadow-inner">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <form onSubmit={handlePost} className="p-6 space-y-4">
            <Textarea 
              placeholder="بماذا تفكر اليوم؟ شاركنا رحلة نموك..." 
              className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right p-4 focus-visible:ring-primary"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-muted-foreground">
                {isPremium ? "نشر غير محدود 👑" : `المتبقي اليوم: ${Math.max(0, 2 - dailyPostCount)}`}
              </p>
              <Button type="submit" disabled={isPosting || !postText.trim()} className="rounded-xl px-8 font-black gap-2">
                {isPosting ? "جاري النشر..." : <><Send size={16} className="rotate-180" /> انشر</>}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any) => (
            post.type === 'dispute' ? (
              <DisputePost key={post.id} post={post} currentUser={user} database={database} />
            ) : (
              <StandardPost key={post.id} post={post} currentUser={user} database={database} />
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function StandardPost({ post, currentUser, database }: { post: any, currentUser: any, database: any }) {
  const likesCount = post.likes ? Object.keys(post.likes).length : 0;
  const isLiked = currentUser && post.likes?.[currentUser.uid];

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    if (isLiked) {
      remove(likeRef);
    } else {
      set(likeRef, true);
      playSound('success');
    }
  };

  return (
    <Card className="rounded-[2rem] border border-border shadow-md bg-card overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Link href={`/user/${post.userId}`} className="flex items-center gap-3 flex-row-reverse">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
              {post.userAvatar?.startsWith('data:') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userAvatar}
            </div>
            <div className="text-right">
              <p className="font-black text-primary text-xs leading-none">{post.userName}</p>
              <p className="text-[8px] font-bold text-muted-foreground mt-1">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
            </div>
          </Link>
        </div>
        <p className="text-sm font-bold text-slate-700 leading-relaxed text-right">{post.text}</p>
        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <button onClick={handleLike} className={cn("flex items-center gap-1.5 transition-colors", isLiked ? "text-red-500" : "text-muted-foreground")}>
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-black">{likesCount}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function DisputePost({ post, currentUser, database }: { post: any, currentUser: any, database: any }) {
  const votesA = post.votes?.[post.challengerId] || 0;
  const votesB = post.votes?.[post.defenderId] || 0;
  const hasVoted = currentUser && post.voters?.[currentUser.uid];

  const handleVote = (targetId: string) => {
    if (!currentUser || hasVoted) return;
    playSound('click');
    const postRef = ref(database, `publicPosts/${post.id}`);
    runTransaction(postRef, (p) => {
      if (p) {
        if (!p.voters) p.voters = {};
        p.voters[currentUser.uid] = true;
        if (!p.votes) p.votes = {};
        p.votes[targetId] = (p.votes[targetId] || 0) + 1;
      }
      return p;
    });
    toast({ title: "شكراً لتصويتك! ⚖️" });
  };

  return (
    <Card className="rounded-[2.5rem] border-2 border-red-100 shadow-xl bg-red-50/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 left-0 bg-red-600 text-white p-3 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest">محاكمة مجتمعية ⚖️</h3>
        </div>
        <AlertTriangle size={16} className="animate-pulse" />
      </div>
      
      <CardContent className="p-6 pt-16 space-y-6">
        <div className="text-center space-y-2">
          <h4 className="text-lg font-black text-red-900 leading-tight">{post.title}</h4>
          <p className="text-[10px] font-bold text-red-700/70">هل يستحق {post.defenderName} الفوز؟ راجع الدليل وصوت.</p>
        </div>

        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-inner border-4 border-white bg-black/5 flex items-center justify-center">
          <img src={post.proof} className="w-full h-full object-contain" alt="دليل النزاع" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Button 
              onClick={() => handleVote(post.defenderId)} 
              disabled={hasVoted}
              className={cn("w-full h-14 rounded-2xl font-black gap-2 shadow-lg", hasVoted ? "bg-slate-200" : "bg-green-600")}
            >
              يستحق الفوز ✅
            </Button>
            <p className="text-center font-black text-green-700 text-xs">{votesB} صوت</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => handleVote(post.challengerId)} 
              disabled={hasVoted}
              className={cn("w-full h-14 rounded-2xl font-black gap-2 shadow-lg", hasVoted ? "bg-slate-200" : "bg-red-600")}
            >
              الدليل غير كافٍ ❌
            </Button>
            <p className="text-center font-black text-red-700 text-xs">{votesA} صوت</p>
          </div>
        </div>

        <div className="bg-white/60 p-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2">
          <Clock size={14} className="text-red-600" />
          <p className="text-[10px] font-bold text-red-900/60">تنتهي المحاكمة خلال 24 ساعة من تاريخ النشر</p>
        </div>
      </CardContent>
    </Card>
  );
}
