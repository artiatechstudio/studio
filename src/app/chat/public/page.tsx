
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, remove, runTransaction, get, orderByKey } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Camera, Heart, Trash2, Globe, Crown, X, Loader2, Sparkles, AlertCircle, ChevronDown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [limitCount, setLimitCount] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(limitCount)), [postsRef, limitCount]);
  const { data: postsData, isLoading: isPostsLoading } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    const compressed = await compressImage(file);
    setPostImage(compressed);
    setIsCompressing(false);
    playSound('click');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !postImage) return;
    if (!user || !userData) return;

    const isPremium = userData.isPremium === 1 || userData.name === 'admin';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "اشترك في بريميوم لنشر غير محدود وإلهام الجميع!",
        action: <Button onClick={() => router.push('/settings')} className="bg-primary text-xs h-8">اشترك الآن</Button>
      });
      return;
    }

    setIsPosting(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar || "🐱",
      isPremium: isPremium,
      text: postText.trim(),
      image: postImage,
      timestamp: serverTimestamp(),
      likes: {}
    };

    try {
      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPostCount/${todayStr}`]: dailyCount + 1
      });
      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (err) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md"><Globe size={24} /></div>
          <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
        </header>

        <Card className="rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea 
                placeholder="بماذا تفكر يا بطل؟ انشر إلهامك هنا..." 
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus:ring-2 ring-primary/20 outline-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              {postImage && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-inner">
                  <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                  <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="h-12 rounded-xl gap-2 font-black border-2 border-primary/10" disabled={isCompressing}>
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20} className="text-primary" />}
                  <span>صورة</span>
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
                <Button type="submit" disabled={isPosting || (!postText.trim() && !postImage)} className="flex-1 h-12 rounded-xl bg-primary text-lg font-black shadow-lg shadow-primary/20">
                  {isPosting ? <Loader2 className="animate-spin" /> : <><Send className="rotate-180 ml-2" size={18} /> انشر الآن</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
          {posts.length >= limitCount && (
            <Button onClick={() => setLimitCount(prev => prev + 10)} variant="ghost" className="w-full h-14 rounded-2xl font-black text-primary gap-2">
              <ChevronDown size={20} /> عرض المزيد من المنشورات
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const [liked, setLiked] = useState(false);
  const isOwner = currentUser?.uid === post.userId;

  useEffect(() => {
    if (currentUser && post.likes) {
      setLiked(!!post.likes[currentUser.uid]);
    }
  }, [currentUser, post.likes]);

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    if (liked) remove(likeRef);
    else set(likeRef, true);
  };

  const handleDelete = () => {
    if (confirm("هل أنت متأكد من حذف هذا المنشور؟ 🐱⚠️")) {
      remove(ref(database, `publicPosts/${post.id}`));
      playSound('click');
    }
  };

  const likesCount = post.likes ? Object.keys(post.likes).length : 0;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Link href={`/user/${post.userId}`} className="shrink-0">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-md overflow-hidden">
                {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                  <img src={post.userAvatar} className="w-full h-full object-cover" alt="Av" />
                ) : (
                  <span>{post.userAvatar || "🐱"}</span>
                )}
              </div>
            </Link>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <h3 className="font-black text-primary text-sm">{post.userName}</h3>
                {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground opacity-60">
                {post.timestamp ? new Date(post.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
              </p>
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/20 hover:text-destructive hover:bg-destructive/5 rounded-full"><Trash2 size={18}/></Button>
          )}
        </div>

        {post.text && <p className="px-6 pb-4 text-right font-bold text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{post.text}</p>}
        
        {post.image && (
          <div className="w-full bg-secondary/10">
            <img src={post.image} className="w-full h-auto object-contain max-h-[500px]" alt="Post" />
          </div>
        )}

        <div className="p-4 bg-secondary/5 flex items-center justify-between px-8">
          <button onClick={handleLike} className={cn("flex items-center gap-2 transition-all active:scale-125", liked ? "text-red-500" : "text-muted-foreground")}>
            <Heart size={22} fill={liked ? "currentColor" : "none"} />
            <span className="font-black text-xs">{likesCount}</span>
          </button>
          <div className="flex items-center gap-1 text-[10px] font-black text-primary/40">كارينجو إلهام <Sparkles size={12}/></div>
        </div>
      </CardContent>
    </Card>
  );
}
