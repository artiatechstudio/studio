
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, get, orderByKey, endBefore } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Camera, Trash2, Heart, Globe, Crown, Loader2, X, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
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
  const [displayLimit, setDisplayLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(displayLimit)), [postsRef, displayLimit]);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!user || (!postText.trim() && !postImage) || isPosting) return;

    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "الأعضاء العاديون لهم منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
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
      await push(ref(database, 'publicPosts'), newPost);
      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (count) => (count || 0) + 1);
      
      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍" });
    } catch (e) {
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
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0 overflow-hidden border border-border">
                  {userData?.avatar?.startsWith('data:image') || userData?.avatar?.startsWith('http') ? (
                    <img src={userData.avatar} className="w-full h-full object-cover" alt="Me" />
                  ) : (
                    <span>{userData?.avatar || "🐱"}</span>
                  )}
                </div>
                <textarea 
                  placeholder="بماذا تفكر اليوم يا بطل؟..."
                  className="w-full min-h-[100px] bg-secondary/30 rounded-2xl p-4 text-sm font-bold border-none focus:ring-2 focus:ring-primary outline-none transition-all text-right"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
              </div>

              {postImage && (
                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-primary shadow-lg animate-in zoom-in-95">
                  <img src={postImage} className="w-full h-auto object-contain max-h-[300px] bg-black/5" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setPostImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="rounded-xl h-12 w-12 text-primary shadow-sm"
                  >
                    {isCompressing ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
                  </Button>
                </div>
                <Button 
                  disabled={isPosting || (!postText.trim() && !postImage)}
                  className="h-12 px-8 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20 gap-2"
                >
                  {isPosting ? <Loader2 className="animate-spin" /> : <Plus size={18} />} انشر الآن
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.length === 0 && !isPostsLoading ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🐱🚀</div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={user} 
                database={database} 
                isAdmin={userData?.name === 'admin'} 
              />
            ))
          )}
          
          {posts.length >= displayLimit && (
            <Button 
              onClick={() => { setDisplayLimit(prev => prev + 10); playSound('click'); }} 
              variant="ghost" 
              className="w-full h-14 rounded-2xl text-primary font-black gap-2 hover:bg-primary/5"
            >
              <ChevronDown size={18} /> عرض المزيد من المنشورات
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const isLikedByMe = post.likes?.[currentUser?.uid || ''];
  const likesCount = post.likes ? Object.keys(post.likes).length : 0;
  const isMyPost = post.userId === currentUser?.uid;

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    runTransaction(postLikeRef, (current) => {
      if (current) return null;
      return true;
    });
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟ 🗑️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <Card className="rounded-[2.5rem] border-none shadow-md bg-card overflow-hidden">
      <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          {(isMyPost || isAdmin) && (
            <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-full">
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <p className="font-black text-sm text-primary">{post.userName}</p>
              {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[8px] font-bold text-muted-foreground opacity-60">
              {post.timestamp ? new Date(post.timestamp).toLocaleString('ar-LY') : 'الآن'}
            </p>
          </div>
          <Link href={`/user/${post.userId}`}>
            <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border flex items-center justify-center text-xl">
              {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                <img src={post.userAvatar} className="w-full h-full object-cover" alt={post.userName} />
              ) : (
                <span>{post.userAvatar || "🐱"}</span>
              )}
            </div>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 space-y-4">
        {post.text && <p className="text-sm font-bold text-right leading-relaxed whitespace-pre-wrap">{post.text}</p>}
        {post.image && (
          <div className="w-full rounded-3xl overflow-hidden shadow-sm border border-border bg-black/5">
            <img src={post.image} className="w-full h-auto object-contain" alt="Post" />
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-black">
            <span>{likesCount} بطل أعجبهم هذا</span>
          </div>
          <Button 
            onClick={handleLike} 
            variant="ghost" 
            className={cn(
              "rounded-full gap-2 font-black text-xs px-4",
              isLikedByMe ? "text-red-500 bg-red-50" : "text-muted-foreground"
            )}
          >
            <Heart fill={isLikedByMe ? "currentColor" : "none"} size={18} />
            {isLikedByMe ? "أعجبني" : "أعجبني"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
