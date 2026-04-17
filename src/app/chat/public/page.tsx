
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, get, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Camera, X, Heart, Trash2, Loader2, Globe, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/user-avatar';
import Link from 'next/link';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [msgText, setMsgText] = useState('');
  const [msgImage, setMsgImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(displayLimit)), [postsRef, displayLimit]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!msgText.trim() && !msgImage) || isSending) return;

    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const today = new Date().toLocaleDateString('en-CA');
    const todayCount = userData?.dailyPostCount?.[today] || 0;

    if (!isPremium && todayCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "اشترك في بريميوم لنشر غير محدود!",
        action: <Button variant="outline" size="sm" className="bg-white text-primary font-black" onClick={() => window.location.href='/settings'}>اشترك الآن</Button>
      });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      const newPost = {
        userId: user.uid,
        userName: userData?.name || 'بطل كاري',
        avatar: userData?.avatar || "🐱",
        text: msgText.trim(),
        image: msgImage,
        timestamp: serverTimestamp(),
        likes: {}
      };

      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}/dailyPostCount`), { [today]: todayCount + 1 });
      
      setMsgText('');
      setMsgImage(null);
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
          else { if (h > MAX) { w *= MAX / h; h = MAX; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-gradient-to-r from-accent to-pink-500 p-6 rounded-[2.5rem] shadow-xl text-white mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner"><Globe size={32} /></div>
            <div className="text-right">
              <h1 className="text-2xl font-black">المجتمع العام</h1>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">تواصل مع أبطال العالم 🌍</p>
            </div>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-2xl border-none bg-card space-y-4 mx-2">
          <div className="flex items-center gap-3 mb-2">
             <UserAvatar user={userData} size="md" />
             <p className="font-black text-primary text-sm">بماذا تفكر يا بطل؟ ✨</p>
          </div>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea 
              placeholder="شارك رحلة نموك مع الجميع..."
              className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right outline-none focus:ring-2 ring-accent/20 transition-all"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
            {msgImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-accent/20">
                <img src={msgImage} className="w-full h-full object-cover" alt="Preview" />
                <button type="button" onClick={() => setMsgImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isCompressing} variant="outline" className="flex-1 h-12 rounded-xl border-2 border-accent/20 text-accent font-black gap-2">
                {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20}/>} إضافة صورة
              </Button>
              <Button type="submit" disabled={isSending || (!msgText.trim() && !msgImage)} className="flex-1 h-12 rounded-xl bg-accent hover:bg-accent/90 font-black gap-2 shadow-lg">
                {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send className="rotate-180" size={18}/>} انشر الآن
              </Button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setIsCompressing(true); const compressed = await compressImage(file); setMsgImage(compressed); setIsCompressing(false);
            }} />
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>}
          {!isLoading && posts.length >= displayLimit && (
            <Button onClick={() => { setDisplayLimit(prev => prev + 10); playSound('click'); }} variant="ghost" className="w-full h-14 rounded-2xl font-black text-accent gap-2"> <ChevronDown size={20} /> عرض المزيد من الإلهام </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const isLiked = post.likes?.[currentUser?.uid || ''] === true;
  const likeCount = Object.keys(post.likes || {}).length;

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    runTransaction(likeRef, (curr) => curr ? null : true);
  };

  const handleDelete = () => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنشور؟ 🛑")) {
      remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    }
  };

  return (
    <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-card">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.userId}`}>
            <UserAvatar user={{ id: post.userId, name: post.userName, avatar: post.avatar }} size="md" />
          </Link>
          <div className="text-right">
            <p className="font-black text-primary text-sm">{post.userName}</p>
            <p className="text-[8px] font-bold text-muted-foreground opacity-60">{new Date(post.timestamp).toLocaleString('ar-LY', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        {(currentUser?.uid === post.userId || isAdmin) && (
          <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full"><Trash2 size={18} /></Button>
        )}
      </div>
      <CardContent className="px-6 pb-6 space-y-4">
        {post.text && <p className="text-sm font-bold text-primary leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
        {post.image && (
          <div className="rounded-3xl overflow-hidden shadow-lg border border-secondary bg-secondary/10">
            <img src={post.image} className="w-full h-auto object-contain" alt="Post" />
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
           <div className="flex items-center gap-4">
              <button onClick={handleLike} className={cn("flex items-center gap-1.5 transition-all active:scale-125", isLiked ? "text-red-500" : "text-muted-foreground")}>
                <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                <span className="text-xs font-black">{likeCount}</span>
              </button>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MessageSquare size={20} />
                <span className="text-[10px] font-black">مجتمع</span>
              </div>
           </div>
           <div className="bg-secondary/40 px-3 py-1 rounded-full text-[9px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-1">
             <Sparkles size={10} /> ملهم
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
