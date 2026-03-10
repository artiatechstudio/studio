
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, get } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, Trash2, Heart, Crown, Camera, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading: isPostsLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

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
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPostImage(compressed);
      playSound('click');
    } catch (err) {
      toast({ variant: "destructive", title: "فشل معالجة الصورة" });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postText.trim() && !postImage) || !user || isSending) return;

    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "يمكن للمستخدمين العاديين نشر منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود! 👑" });
      return;
    }

    setIsSending(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'بطل مجهول',
      userAvatar: userData?.avatar || '🐱',
      isPremium: isPremium,
      text: postText.trim(),
      image: postImage,
      likes: {},
      likesCount: 0,
      timestamp: serverTimestamp()
    };

    try {
      await push(postsRef, newPost);
      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (c) => (c || 0) + 1);
      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍✨" });
    } catch (err) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likes/${user.uid}`);
    const countRef = ref(database, `publicPosts/${postId}/likesCount`);

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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("هل تريد حذف هذا المنشور؟ 🗑️")) return;
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center shadow-md">
              <Globe size={24} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الأبطال 🌍</p>
            </div>
          </div>
        </header>

        <section className="mx-2">
          <div className="bg-card p-4 rounded-[2rem] shadow-xl border border-border space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden border border-border">
                {userData?.avatar?.startsWith('data:image') ? <img src={userData.avatar} className="w-full h-full object-cover" alt="Me" /> : <span>{userData?.avatar || "🐱"}</span>}
              </div>
              <div className="flex-1 space-y-3">
                <Textarea 
                  placeholder="بماذا تفكر يا بطل؟..." 
                  className="min-h-[80px] bg-secondary/30 border-none rounded-2xl font-bold text-right text-xs"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                
                {postImage && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-accent/20 group">
                    <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <Button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl border-accent/20 text-accent h-10 w-10 hover:bg-accent/5"
                      disabled={isCompressing}
                    >
                      {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={18}/>}
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSendPost} 
                    disabled={isSending || (!postText.trim() && !postImage)} 
                    className="rounded-xl bg-accent hover:bg-accent/90 px-6 font-black h-10 gap-2"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={18}/> : <Send className="rotate-180" size={18}/>}
                    انشر الآن
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4 mx-2">
          {isPostsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🌟</div>
          ) : posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onLike={() => handleToggleLike(post.id)} onDelete={() => handleDeletePost(post.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, onLike, onDelete }: { post: any, currentUser: any, onLike: () => void, onDelete: () => void }) {
  const isLiked = post.likes?.[currentUser?.uid || ''];
  const canDelete = currentUser?.uid === post.userId || currentUser?.displayName === 'admin';

  return (
    <div className="bg-card rounded-[2rem] shadow-md border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.userId}`}>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border shadow-sm">
              {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                <img src={post.userAvatar} className="w-full h-full object-cover" alt="Ava" />
              ) : (
                <span>{post.userAvatar || "🐱"}</span>
              )}
            </div>
          </Link>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <p className="font-black text-primary text-xs">{post.userName}</p>
              {post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[8px] font-bold text-muted-foreground opacity-60">
              {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
            </p>
          </div>
        </div>
        {canDelete && (
          <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full">
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      <div className="px-5 pb-2">
        {post.text && <p className="text-sm font-bold text-foreground leading-relaxed whitespace-pre-wrap text-right">{post.text}</p>}
      </div>

      {post.image && (
        <div className="px-2 pb-2">
          <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden bg-secondary/30">
            <img src={post.image} className="w-full h-full object-contain" alt="Post" />
          </div>
        </div>
      )}

      <div className="p-3 border-t border-border/50 flex items-center justify-start gap-4 px-6">
        <button 
          onClick={onLike}
          className={cn(
            "flex items-center gap-1.5 transition-all active:scale-90",
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          )}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={cn(isLiked && "animate-bounce")} />
          <span className="text-xs font-black">{post.likesCount || 0}</span>
        </button>
        <div className="text-[10px] font-black text-muted-foreground/40 flex items-center gap-1">
          <Sparkles size={12} /> بطل كاري
        </div>
      </div>
    </div>
  );
}
