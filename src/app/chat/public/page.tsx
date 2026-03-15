
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Image as ImageIcon, Heart, Trash2, Camera, Loader2, Crown, ArrowLeft, MessageCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;

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
    setPostImage(compressed);
    setIsCompressing(false);
    playSound('click');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postText.trim() && !postImage) || !user || isPosting) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({
        variant: "destructive",
        title: "وصلت للحد اليومي 🛑",
        description: "اشترك في بريميوم لنشر غير محدود وإلهام الجميع دائماً!",
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
      isPremiumUser: isPremium,
      text: postText.trim(),
      image: postImage,
      timestamp: serverTimestamp(),
      likes: 0
    };

    try {
      await push(postsRef!, newPost);
      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (c) => (c || 0) + 1);
      setPostText('');
      setPostImage(null);
      toast({ title: "تم النشر بنجاح! 🌍✨" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
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
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <h1 className="text-xl font-black text-primary">المجتمع العام</h1>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-card overflow-hidden mx-2">
          <form onSubmit={handleCreatePost} className="p-5 space-y-4">
            <textarea
              placeholder="بماذا تفكر يا بطل؟ انشر إلهامك هنا... 🌍"
              className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary shadow-lg group">
                <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => setPostImage(null)} 
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                >
                  <Trash2 size={16} />
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
                  className="rounded-xl border-primary/20 text-primary font-black gap-2 h-11"
                  disabled={isCompressing}
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={16} /> : <Camera size={18} />}
                  صورة
                </Button>
              </div>
              <Button 
                type="submit" 
                className="rounded-xl bg-primary hover:bg-primary/90 font-black gap-2 px-8 h-11 shadow-lg"
                disabled={isPosting || (!postText.trim() && !postImage)}
              >
                {isPosting ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" size={18} />}
                نشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🌍🐱</div>
          ) : posts.map((post) => (
            <PostItem key={post.id} post={post} currentUser={user} isAdmin={isAdmin} database={database} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostItem({ post, currentUser, isAdmin, database }: { post: any, currentUser: any, isAdmin: boolean, database: any }) {
  const isMine = post.userId === currentUser?.uid;
  const canDelete = isMine || isAdmin;

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const postLikeRef = ref(database, `publicPosts/${post.id}/likedBy/${currentUser.uid}`);
    const postCountRef = ref(database, `publicPosts/${post.id}/likes`);

    runTransaction(postLikeRef, (current) => {
      if (current) {
        runTransaction(postCountRef, (c) => Math.max(0, (c || 1) - 1));
        return null;
      } else {
        runTransaction(postCountRef, (c) => (c || 0) + 1);
        return true;
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟ ⚠️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const isLiked = post.likedBy?.[currentUser?.uid || ''];

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-card overflow-hidden transition-all hover:translate-y-[-2px]">
      <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.userId}`} className="shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-primary/10 overflow-hidden bg-secondary flex items-center justify-center text-xl">
              {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                <img src={post.userAvatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span>{String(post.userAvatar || "🐱")}</span>
              )}
            </div>
          </Link>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <p className="font-black text-primary text-sm">{String(post.userName)}</p>
              {post.isPremiumUser && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[8px] font-bold text-muted-foreground opacity-60">
              {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
            </p>
          </div>
        </div>
        {canDelete && (
          <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/10 rounded-full">
            <Trash2 size={16} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        {post.text && <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">{String(post.text)}</p>}
        {post.image && (
          <div className="rounded-3xl overflow-hidden shadow-md border border-border">
            <img src={post.image} className="w-full h-auto max-h-[400px] object-cover" alt="Post" />
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <Button 
            onClick={handleLike} 
            variant="ghost" 
            className={cn("rounded-2xl gap-2 font-black text-xs", isLiked ? "text-red-500 bg-red-50" : "text-muted-foreground")}
          >
            <Heart fill={isLiked ? "currentColor" : "none"} size={18} />
            {post.likes || 0} إعجاب
          </Button>
          <Button variant="ghost" className="rounded-2xl gap-2 text-muted-foreground font-black text-xs">
            <MessageCircle size={18} />
            تفاعل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
