
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Heart, Trash2, ShieldAlert, Swords, Trophy, Loader2, Clock, Globe, User } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setTodoText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const today = new Date().toLocaleDateString('en-CA');
  const dailyPostCount = userData?.dailyPostCount?.[today] || 0;

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || isPosting || !user || !userData) return;

    if (!isPremium && dailyPostCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "المستخدم العادي يمكنه نشر منشورين فقط يومياً. اشترك في بريميوم للنشر بلا حدود!" });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await push(ref(database, 'publicPosts'), {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || "🐱",
        text: postText.trim(),
        likes: 0,
        likedBy: {},
        timestamp: serverTimestamp(),
        type: 'standard'
      });

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${today}`), (count) => (count || 0) + 1);
      
      setTodoText('');
      toast({ title: "تم النشر بنجاح! 🚀" });
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
    const postLikeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const postLikesCountRef = ref(database, `publicPosts/${postId}/likes`);

    runTransaction(postLikeRef, (isLiked) => {
      if (isLiked) {
        runTransaction(postLikesCountRef, (count) => (count || 1) - 1);
        return null;
      } else {
        runTransaction(postLikesCountRef, (count) => (count || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("هل أنت متأكد من حذف المنشور؟")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleVote = async (postId: string, candidateId: string) => {
    if (!user) return;
    playSound('click');
    const voteRef = ref(database, `publicPosts/${postId}/votes/${candidateId}`);
    runTransaction(voteRef, (count) => (count || 0) + 1);
    toast({ title: "شكراً لتصويتك! 🗳️" });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">انشر إلهامك وشارك في التحكيم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handlePost} className="space-y-4">
            <Textarea 
              placeholder="بماذا تشعر اليوم؟ ألهم غيرك بكلمة... ✨" 
              className="min-h-[100px] rounded-[1.5rem] bg-secondary/30 border-none font-bold text-right p-4 focus-visible:ring-primary"
              value={postText}
              onChange={(e) => setTodoText(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isPosting || !postText.trim()} className="h-12 px-8 rounded-xl bg-primary font-black shadow-lg">
                {isPosting ? <Loader2 className="animate-spin" /> : "انشر الآن"}
              </Button>
              {!isPremium && (
                <p className="text-[9px] font-black text-muted-foreground">المتبقي لك اليوم: {Math.max(0, 2 - dailyPostCount)} منشور</p>
              )}
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
              <DisputeCard key={post.id} post={post} onVote={handleVote} isAdmin={isAdmin} onDelete={handleDelete} />
            ) : (
              <StandardPostCard key={post.id} post={post} currentUserId={user?.uid} onLike={handleLike} onDelete={handleDelete} isAdmin={isAdmin} />
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function StandardPostCard({ post, currentUserId, onLike, onDelete, isAdmin }: any) {
  const isLiked = post.likedBy?.[currentUserId || ''];
  const canDelete = post.userId === currentUserId || isAdmin;

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl overflow-hidden border border-border">
              {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" alt="A" /> : <span>{post.userAvatar || "🐱"}</span>}
            </div>
            <div className="text-right">
              <p className="font-black text-primary text-sm leading-none">{post.userName}</p>
              <p className="text-[8px] font-bold text-muted-foreground mt-1 flex items-center gap-1 justify-end"> <Clock size={8} /> {new Date(post.timestamp).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })} </p>
            </div>
          </div>
          {canDelete && <Button onClick={() => onDelete(post.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"><Trash2 size={14} /></Button>}
        </div>
        <p className="text-sm font-bold text-muted-foreground leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>
        <div className="flex items-center gap-4 border-t border-border/50 pt-3">
          <button onClick={() => onLike(post.id)} className={cn("flex items-center gap-1.5 transition-colors", isLiked ? "text-red-500" : "text-muted-foreground")}>
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-black">{post.likes || 0}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function DisputeCard({ post, onVote, isAdmin, onDelete }: any) {
  return (
    <Card className="rounded-[2.5rem] border-2 border-red-100 shadow-xl bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 rounded-bl-2xl text-[9px] font-black z-10 flex items-center gap-1">
        <ShieldAlert size={10} /> نزاع علني ⚖️
      </div>
      <CardHeader className="bg-red-50 p-6 pt-10 text-center">
        <CardTitle className="text-lg font-black text-red-900 leading-tight">تصويت: من الفائز في "{post.title}"؟</CardTitle>
        <p className="text-[10px] font-bold text-red-700/70 mt-2">التحدي بقيمة {post.points} نقطة. صوت بناءً على الدليل المعروض!</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-secondary/20 p-4 rounded-2xl border border-border">
          <p className="text-[10px] font-black text-primary mb-3 text-right">📸 الدليل المقدم من {post.challengerName}:</p>
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-black flex items-center justify-center">
            {post.proof ? <img src={post.proof} className="w-full h-full object-contain" alt="Proof" /> : <Loader2 className="text-white animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Button onClick={() => onVote(post.id, post.challengerId)} className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-xs gap-2"> <Trophy size={14}/> {post.challengerName} </Button>
            <p className="text-center font-black text-primary text-sm">{post.votes?.[post.challengerId] || 0} صوت</p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => onVote(post.id, post.defenderId)} className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 font-black text-xs gap-2"> <XCircle size={14}/> {post.defenderName} </Button>
            <p className="text-center font-black text-primary text-sm">{post.votes?.[post.defenderId] || 0} صوت</p>
          </div>
        </div>

        {isAdmin && <Button onClick={() => onDelete(post.id)} variant="ghost" className="w-full text-destructive font-black text-[10px] mt-4">حذف النزاع يدوياً</Button>}
      </CardContent>
    </Card>
  );
}
