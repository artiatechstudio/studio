
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Camera, Heart, Trash2, Crown, Globe, Loader2, X } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
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

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postText.trim() && !postImage) || !user || isPosting) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "يمكنك نشر منشورين فقط يومياً. اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      await push(ref(database, 'publicPosts'), {
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || '🐱',
        isPremium: isPremium ? 1 : 0,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (curr) => (curr || 0) + 1);

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

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("هل أنت متأكد من حذف المنشور؟")) {
      playSound('click');
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم الحذف" });
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likedBy/${user.uid}`);
    const countRef = ref(database, `publicPosts/${postId}/likesCount`);

    runTransaction(likeRef, (curr) => {
      if (curr) {
        runTransaction(countRef, c => (c || 1) - 1);
        return null;
      } else {
        runTransaction(countRef, c => (c || 0) + 1);
        return true;
      }
    });
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
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shadow-inner"><Globe size={24} /></div>
          <div className="text-right">
            <h1 className="text-xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">تواصل وألهم الأبطال 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] p-4 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-secondary shrink-0 overflow-hidden flex items-center justify-center text-xl">
                {userData?.avatar?.startsWith('data:image') ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <span>{userData?.avatar || '🐱'}</span>}
              </div>
              <textarea 
                placeholder="بماذا تفكر يا بطل؟..." 
                className="flex-1 min-h-[80px] bg-secondary/30 rounded-2xl p-4 border-none text-sm font-bold resize-none focus:ring-2 ring-primary/20 outline-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
            
            {postImage && (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-lg mr-12">
                <img src={postImage} className="w-full h-full object-cover" />
                <button onClick={() => setPostImage(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12}/></button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button type="button" onClick={() => fileInputRef.current?.click()} size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-primary" disabled={isCompressing}>
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20}/>}
                </Button>
              </div>
              <Button type="submit" disabled={isPosting || (!postText.trim() && !postImage)} className="h-10 px-6 rounded-xl bg-primary font-black gap-2">
                {isPosting ? <Loader2 className="animate-spin" size={16}/> : <Send size={16} className="rotate-180" />} نشر الإلهام
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🐱🚀</div>
          ) : posts.map((post) => {
            const isLiked = post.likedBy?.[user?.uid || ''];
            const isOwner = post.userId === user?.uid;
            const canDelete = isOwner || isAdmin;

            return (
              <Card key={post.id} className="rounded-[2rem] shadow-md border-none overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden text-xl shadow-inner">
                        {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : <span>{post.userAvatar}</span>}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <p className="font-black text-primary text-xs">{post.userName}</p>
                          {post.isPremium === 1 && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
                      </div>
                    </div>
                    {canDelete && (
                      <Button onClick={() => handleDeletePost(post.id)} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive h-8 w-8 rounded-full">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {post.text && <p className="text-sm font-bold text-primary/80 leading-relaxed whitespace-pre-wrap text-right">{post.text}</p>}
                    {post.image && (
                      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                        <img src={post.image} className="w-full max-h-96 object-contain bg-black/5" alt="Post content" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border/30">
                    <button 
                      onClick={() => handleLike(post.id)} 
                      className={cn("flex items-center gap-1.5 transition-all group", isLiked ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-400")}
                    >
                      <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={cn(isLiked && "animate-bounce")} />
                      <span className="text-[10px] font-black">{post.likesCount || 0}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
