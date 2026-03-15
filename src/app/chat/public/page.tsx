
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, remove, runTransaction, orderByKey, endAt, get } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Send, Heart, Trash2, Crown, Loader2, Camera, X, Globe, MessageCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
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

  // Pagination Logic: Fetch limited posts
  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(displayLimit)), [postsRef, displayLimit]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyPostCount = userData?.dailyPostCount?.[todayStr] || 0;

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

    if (!isPremium && dailyPostCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "العضوية العادية تسمح بمنشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsPosting(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'بطل مجهول',
      userAvatar: userData?.avatar || '🐱',
      isPremium: isPremium ? 1 : 0,
      text: postText.trim(),
      image: postImage,
      timestamp: serverTimestamp(),
      likesCount: 0
    };

    try {
      await push(ref(database, 'publicPosts'), newPost);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPostCount/${todayStr}`]: dailyPostCount + 1
      });
      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍✨" });
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
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary leading-none">المجتمع العام</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">انشر إلهامك وصورك للعالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-4 mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea 
              placeholder="بماذا تفكر اليوم يا بطل؟" 
              className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right focus-visible:ring-primary"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            
            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md group">
                <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => setPostImage(null)} 
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
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
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="h-12 rounded-xl border-2 border-primary/20 text-primary font-black gap-2 hover:bg-primary/5"
                  disabled={isCompressing}
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20} />}
                  صورة
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={isPosting || (!postText.trim() && !postImage)}
                className="h-12 px-8 rounded-xl bg-primary text-white font-black gap-2 shadow-lg shadow-primary/20"
              >
                {isPosting ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" size={18} />}
                نشر الآن
              </Button>
            </div>
          </form>
          {!isPremium && (
            <div className="pt-2 flex items-center justify-between border-t border-border mt-2">
              <p className="text-[10px] font-bold text-muted-foreground">منشورات اليوم: {dailyPostCount}/2</p>
              {dailyPostCount >= 2 && <Link href="/settings"><span className="text-[9px] font-black text-accent underline">اشترك لفتح القيود 👑</span></Link>}
            </div>
          )}
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading && posts.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا توجد منشورات بعد.. كن الأول! 🐱🚀</div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={isAdmin} />
              ))}
              
              <div className="flex justify-center py-6">
                <Button 
                  variant="ghost" 
                  onClick={() => { playSound('click'); setDisplayLimit(prev => prev + 10); }}
                  className="rounded-full gap-2 text-primary font-black"
                >
                  <ChevronDown size={18} /> عرض المزيد من الإلهام
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const isMine = currentUser?.uid === post.userId;
  const isLikedByMe = post.likedBy?.[currentUser?.uid || ''];
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likedBy/${currentUser.uid}`);
    const countRef = ref(database, `publicPosts/${post.id}/likesCount`);
    
    runTransaction(likeRef, (curr) => {
      if (curr) {
        runTransaction(countRef, (c) => (c || 1) - 1);
        return null;
      } else {
        runTransaction(countRef, (c) => (c || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا المنشور؟ 🐱⚠️")) return;
    
    setIsDeleting(true);
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe Rendering of count to avoid React child objects error
  const likesCount = post.likesCount || 0;

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="p-5 flex flex-row items-center justify-between flex-row-reverse space-y-0">
        <div className="flex items-center gap-3 flex-row-reverse">
          <Link href={`/user/${post.userId}`}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm overflow-hidden">
              {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                <img src={post.userAvatar} className="w-full h-full object-cover" alt="Ava" />
              ) : (
                <span>{post.userAvatar || "🐱"}</span>
              )}
            </div>
          </Link>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <h3 className="font-black text-primary text-sm">{post.userName}</h3>
              {post.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[8px] font-bold text-muted-foreground flex items-center gap-1 justify-end">
              {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
              <MessageCircle size={8} />
            </p>
          </div>
        </div>
        {(isMine || isAdmin) && (
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive/30 hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        {post.text && <p className="text-right text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{post.text}</p>}
        {post.image && (
          <div className="rounded-2xl overflow-hidden border border-border bg-black/5">
            <img src={post.image} className="w-full h-auto max-h-[400px] object-contain" alt="Post" />
          </div>
        )}
        <div className="pt-2 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleLike}
            className={cn("rounded-full gap-2 font-black text-xs h-9 px-4", isLikedByMe ? "bg-red-50 text-red-600" : "text-muted-foreground hover:bg-secondary")}
          >
            <Heart size={18} fill={isLikedByMe ? "currentColor" : "none"} />
            {likesCount}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
