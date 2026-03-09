
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, update, runTransaction, set, get } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Globe, Send, Heart, Trash2, ArrowLeft, ShieldAlert, Swords, Clock, CheckCircle2, XCircle, Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyPostCount = userData?.dailyPostCount?.[todayStr] || 0;

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    if (!isPremium && dailyPostCount >= 2) {
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
      await set(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || "🐱",
        text: postText.trim(),
        type: 'normal',
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: {}
      });

      await update(ref(database, `users/${user.uid}/dailyPostCount`), {
        [todayStr]: dailyPostCount + 1
      });

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
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const likesCountRef = ref(database, `publicPosts/${postId}/likes`);

    runTransaction(postLikeRef, (exists) => {
      if (exists) {
        runTransaction(likesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(likesCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل تريد حذف هذا المنشور؟ 🐱🗑️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleVoteDispute = async (postId: string, voteForId: string) => {
    if (!user) return;
    playSound('click');
    const voteRef = ref(database, `publicPosts/${postId}/votes/${user.uid}`);
    
    try {
      await set(voteRef, voteForId);
      toast({ title: "تم تسجيل تصويتك ✅" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التصويت" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
              <Globe size={24} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-primary uppercase">بماذا تفكر يا بطل؟ 🐱✨</p>
              {!isPremium && (
                <span className="text-[8px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  المتبقي اليوم: {Math.max(0, 2 - dailyPostCount)}
                </span>
              )}
            </div>
            <Textarea 
              placeholder="اكتب شيئاً ملهماً للمجتمع..."
              className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right focus-visible:ring-primary text-sm p-4"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              maxLength={280}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !postText.trim()}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} className="rotate-180" />}
              نشر في المجتمع
            </Button>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🌟</div>
          ) : posts.map((post: any) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              isAdmin={isAdmin}
              onLike={() => handleLike(post.id)}
              onDelete={() => handleDeletePost(post.id)}
              onVote={(id: string) => handleVoteDispute(post.id, id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, isAdmin, onLike, onDelete, onVote }: any) {
  const isMine = post.userId === currentUser?.uid;
  const isLiked = post.likedBy?.[currentUser?.uid || ''];
  const isDispute = post.type === 'dispute';

  const voteCounts = useMemo(() => {
    if (!post.votes) return { challenger: 0, defender: 0 };
    const votesArr = Object.values(post.votes);
    return {
      challenger: votesArr.filter(v => v === post.challengerId).length,
      defender: votesArr.filter(v => v === post.defenderId).length
    };
  }, [post.votes, post.challengerId, post.defenderId]);

  const myVote = post.votes?.[currentUser?.uid || ''];

  if (isDispute) {
    return (
      <Card className="rounded-[2.5rem] border-2 border-red-100 bg-red-50/30 overflow-hidden shadow-xl animate-in slide-in-from-bottom-4">
        <div className="bg-red-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="animate-pulse" />
            <h4 className="text-xs font-black uppercase">نزاع عام قيد التحكيم ⚖️</h4>
          </div>
          <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">{post.points}ن</span>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-black text-primary leading-tight">{post.title}</h3>
            <p className="text-[10px] font-bold text-muted-foreground italic">قام المجتمع بالتحكيم بين البطلين لضمان النزاهة.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn("p-4 rounded-3xl text-center space-y-2 border-2 transition-all", myVote === post.challengerId ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-border")}>
              <p className="text-[8px] font-black uppercase opacity-60">المدعي (صاحب الدليل)</p>
              <p className="font-black text-xs truncate">{post.challengerName}</p>
              <p className="text-xl font-black">{voteCounts.challenger}</p>
              <Button 
                onClick={() => onVote(post.challengerId)} 
                disabled={!!myVote}
                variant={myVote === post.challengerId ? "secondary" : "outline"}
                className="w-full h-8 rounded-xl text-[10px] font-black"
              >
                صدّقه ✅
              </Button>
            </div>
            <div className={cn("p-4 rounded-3xl text-center space-y-2 border-2 transition-all", myVote === post.defenderId ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-border")}>
              <p className="text-[8px] font-black uppercase opacity-60">المدعى عليه</p>
              <p className="font-black text-xs truncate">{post.defenderName}</p>
              <p className="text-xl font-black">{voteCounts.defender}</p>
              <Button 
                onClick={() => onVote(post.defenderId)} 
                disabled={!!myVote}
                variant={myVote === post.defenderId ? "secondary" : "outline"}
                className="w-full h-8 rounded-xl text-[10px] font-black"
              >
                كذّبه ❌
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-center text-primary uppercase">دليل الإنجاز المرفوع 📸</p>
            <div className="aspect-video rounded-[2rem] overflow-hidden border-4 border-white shadow-inner bg-secondary flex items-center justify-center">
              {post.proof ? (
                <img src={post.proof} alt="Proof" className="w-full h-full object-cover" />
              ) : (
                <ShieldAlert size={40} className="opacity-20" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock size={12} />
            <span className="text-[10px] font-black uppercase">ينتهي التصويت: {new Date(post.expiresAt).toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] bg-card border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xl overflow-hidden border border-border">
              {post.userAvatar?.startsWith('data:image') ? (
                <img src={post.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{post.userAvatar || "🐱"}</span>
              )}
            </div>
            <div className="text-right">
              <h4 className="font-black text-primary text-xs leading-none">{post.userName}</h4>
              <p className="text-[8px] font-bold text-muted-foreground mt-1">
                {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
              </p>
            </div>
          </div>
          {(isMine || isAdmin) && (
            <Button onClick={onDelete} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg">
              <Trash2 size={14} />
            </Button>
          )}
        </div>

        <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">
          {post.text}
        </p>

        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <button 
            onClick={onLike}
            className={cn(
              "flex items-center gap-1.5 transition-colors group",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
            )}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={cn(isLiked && "animate-bounce")} />
            <span className="text-xs font-black">{post.likes || 0}</span>
          </button>
          <div className="text-muted-foreground/30 flex items-center gap-1">
            <MessageSquare size={16} />
            <span className="text-[10px] font-black italic">قريباً</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
