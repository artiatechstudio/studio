
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, update, runTransaction, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Globe, Heart, Trash2, Camera, X, Loader2, Crown, MessageSquare, ChevronDown, Clock } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [msgText, setMsgText] = useState('');
  const [msgImage, setMsgImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(displayLimit)), [postsRef, displayLimit]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 600;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    const compressed = await compressImage(file);
    setMsgImage(compressed);
    setIsCompressing(false);
    playSound('click');
  };

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!msgText.trim() && !msgImage) || isSending) return;

    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayCount = userData?.dailyPostsCount?.[todayStr] || 0;

    if (!isPremium && todayCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "اشترك في بريميوم لنشر غير محدود وإلهام المجتمع دائماً!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsSending(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'بطل كارينجو',
      userAvatar: userData?.avatar || '🐱',
      isPremium: isPremium ? 1 : 0,
      text: msgText.trim(),
      image: msgImage,
      timestamp: serverTimestamp(),
      likes: {}
    };

    try {
      await push(ref(database, 'publicPosts'), newPost);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPostsCount/${todayStr}`]: todayCount + 1
      });
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

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-gradient-to-r from-accent to-pink-500 p-6 rounded-[2.5rem] shadow-xl text-white mx-2">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner"><Globe size={32} /></div>
          <div className="text-right">
            <h1 className="text-2xl font-black">المجتمع العام</h1>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden mx-2">
          <CardContent className="p-6">
            <form onSubmit={handleSendPost} className="space-y-4">
              <div className="flex gap-3">
                <Link href="/profile" className="shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl border-2 border-white shadow-md overflow-hidden">
                    {userData?.avatar?.startsWith('data:image') || userData?.avatar?.startsWith('http') ? (
                      <img src={userData.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <span>{userData?.avatar || "🐱"}</span>
                    )}
                  </div>
                </Link>
                <textarea 
                  placeholder="بماذا تشعر اليوم يا بطل؟"
                  className="flex-1 bg-secondary/30 rounded-2xl p-4 text-sm font-bold text-right border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
              </div>
              
              {msgImage && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 group">
                  <img src={msgImage} className="w-full h-full object-cover" alt="Preview" />
                  <button onClick={() => setMsgImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"><X size={16}/></button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="ghost" 
                  className="rounded-xl text-primary font-black gap-2 hover:bg-primary/5 h-12"
                  disabled={isCompressing}
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20} />}
                  صورة
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                
                <Button 
                  type="submit" 
                  disabled={isSending || (!msgText.trim() && !msgImage)}
                  className="h-12 px-8 rounded-xl bg-primary text-white font-black gap-2 shadow-lg shadow-primary/20"
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} className="rotate-180" />}
                  نشر
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
          
          {posts.length >= displayLimit && (
            <Button 
              onClick={() => { setDisplayLimit(prev => prev + 10); playSound('click'); }}
              variant="ghost" 
              className="w-full h-14 rounded-2xl font-black text-primary gap-2 bg-secondary/20"
            >
              <ChevronDown size={20} /> عرض منشورات أقدم
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const [isLiking, setIsLiking] = useState(false);
  const isMyPost = currentUser?.uid === post.userId;
  const isLikedByMe = post.likes?.[currentUser?.uid || ''];
  const likesCount = post.likes ? Object.keys(post.likes).length : 0;

  const handleLike = async () => {
    if (!currentUser || isLiking) return;
    setIsLiking(true);
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    try {
      await runTransaction(likeRef, (curr) => {
        if (curr) return null;
        return true;
      });
      if (!isLikedByMe) playSound('success');
    } catch (e) {} finally { setIsLiking(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("هل تريد حذف هذا المنشور؟ 🗑️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const isUserPremium = post.isPremium === 1 || post.userName === 'admin';

  return (
    <Card className="rounded-[2rem] border-none shadow-lg bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.userId}`} onClick={() => playSound('click')}>
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xl border border-white shadow-sm overflow-hidden">
                {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                  <img src={post.userAvatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span>{post.userAvatar || "🐱"}</span>
                )}
              </div>
            </Link>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <h3 className="font-black text-primary text-xs leading-none">{post.userName}</h3>
                {isUserPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                <Clock size={8} /> {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
              </p>
            </div>
          </div>
          {(isMyPost || isAdmin) && (
            <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full">
              <Trash2 size={16} />
            </Button>
          )}
        </div>

        {post.text && <p className="px-6 pb-4 text-sm font-bold text-muted-foreground text-right leading-relaxed whitespace-pre-wrap">{post.text}</p>}
        
        {post.image && (
          <div className="w-full bg-black/5 flex items-center justify-center">
            <img src={post.image} className="w-full h-auto object-contain max-h-[500px]" alt="Post" />
          </div>
        )}

        <div className="p-4 bg-secondary/5 border-t border-border/50 flex items-center gap-6">
          <button 
            onClick={handleLike} 
            disabled={isLiking}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
              isLikedByMe ? "bg-red-50 text-red-600 shadow-inner" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <Heart size={20} fill={isLikedByMe ? "currentColor" : "none"} className={cn(isLikedByMe && "animate-bounce")} />
            <span className="text-xs font-black">{likesCount}</span>
          </button>
          
          <div className="flex items-center gap-2 text-muted-foreground opacity-40">
            <MessageSquare size={18} />
            <span className="text-[10px] font-black">تعليق (قريباً)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
