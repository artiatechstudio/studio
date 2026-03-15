
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Camera, Heart, Trash2, Crown, Loader2, X, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastAction } from "@/components/ui/toast";

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
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
    if (!user || isSending || (!postText.trim() && !postImage)) return;

    if (!isPremium && dailyPostCount >= 2) {
      toast({
        variant: "destructive",
        title: "وصلت للحد اليومي 🛑",
        description: "الأعضاء العاديون يمكنهم نشر منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsSending(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'بطل مجهول',
      userAvatar: userData?.avatar || '🐱',
      isPremium: isPremium ? 1 : 0,
      text: postText.trim(),
      image: postImage,
      likes: 0,
      timestamp: serverTimestamp()
    };

    try {
      await push(postsRef, newPost);
      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (c) => (c || 0) + 1);
      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر في المجتمع! 🌍" });
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
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shadow-inner">
              <Globe size={24} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
            </div>
          </div>
          {!isPremium && (
            <div className="bg-secondary/50 px-3 py-1.5 rounded-full text-[9px] font-black text-primary flex items-center gap-1">
              <AlertCircle size={10} /> {2 - dailyPostCount} منشور متبقي
            </div>
          )}
        </header>

        <Card className="rounded-[2rem] p-4 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-border">
                {userData?.avatar?.startsWith('data:image') ? (
                  <img src={userData.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{userData?.avatar || "🐱"}</span>
                )}
              </div>
              <textarea 
                placeholder="بماذا تشعر اليوم يا بطل؟"
                className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm resize-none py-2 text-right"
                rows={3}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>

            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 bg-secondary/30">
                <img src={postImage} className="w-full h-full object-contain" alt="Preview" />
                <button 
                  onClick={() => setPostImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing || isSending}
                className="text-primary font-black gap-2 h-10 rounded-xl px-4 hover:bg-primary/5"
              >
                {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={18} />}
                <span className="text-xs">إرفاق صورة</span>
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              
              <Button 
                type="submit" 
                disabled={isSending || isCompressing || (!postText.trim() && !postImage)}
                className="bg-primary hover:bg-primary/90 text-white font-black px-6 h-10 rounded-xl gap-2 shadow-lg"
              >
                {isSending ? <Loader2 className="animate-spin" /> : <Send size={16} className="rotate-180" />}
                نشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا يوجد منشورات حالياً.. كن أول المنشورين! 🌍✨</div>
          ) : posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likedBy/${currentUser.uid}`);
    const countRef = ref(database, `publicPosts/${post.id}/likes`);
    
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
    if (!window.confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const isLiked = post.likedBy?.[currentUser?.uid || ''];
  const canDelete = post.userId === currentUser?.uid || isAdmin;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-md bg-card overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.userId}`} className="shrink-0">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                {post.userAvatar?.startsWith('data:image') ? (
                  <img src={post.userAvatar} className="w-full h-full object-cover" />
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
              <p className="text-[8px] font-bold text-muted-foreground opacity-60">
                {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
              </p>
            </div>
          </div>
          {canDelete && (
            <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive rounded-full">
              <Trash2 size={16} />
            </Button>
          )}
        </div>

        <div className="px-6 pb-4">
          <p className="text-sm font-bold text-primary leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>
        </div>

        {post.image && (
          <div className="w-full aspect-auto max-h-[400px] bg-secondary/20 flex items-center justify-center overflow-hidden border-y border-border">
            <img src={post.image} className="w-full h-full object-contain" alt="Post" />
          </div>
        )}

        <div className="p-4 flex items-center gap-4 bg-secondary/5">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 transition-all active:scale-125",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
            )}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-black">{post.likes || 0}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
