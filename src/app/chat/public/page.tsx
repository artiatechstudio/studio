
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, Camera, Send, Loader2, Globe, Crown, X } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

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
    setImage(compressed);
    setIsCompressing(false);
    playSound('click');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !image) || !user || isSending) return;

    const today = new Date().toLocaleDateString('en-CA');
    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const dailyCount = userData?.dailyPostCount?.[today] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "يسمح بـ 2 منشور يومياً للأعضاء العاديين. اشترك في بريميوم للنشر غير المحدود! 👑" });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      await push(ref(database, 'publicPosts'), {
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar,
        isPremium: isPremium,
        text: text.trim(),
        image: image,
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      if (!isPremium) {
        await update(ref(database, `users/${user.uid}`), {
          [`dailyPostCount/${today}`]: dailyCount + 1
        });
      }

      setText('');
      setImage(null);
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center"><Globe size={24} /></div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
            </div>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><X className="opacity-40" /></Button></Link>
        </header>

        <Card className="mx-2 rounded-[2rem] border-none shadow-xl bg-card overflow-hidden">
          <CardContent className="p-4 space-y-4">
            {image && (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-lg animate-in zoom-in">
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12}/></button>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2">
              <div className="flex-1 relative">
                <Input 
                  placeholder="ماذا يدور في ذهنك؟..." 
                  className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-right pr-4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={20}/> : <Camera size={20}/>}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <Button type="submit" disabled={isSending || (!text.trim() && !image)} className="h-14 w-14 rounded-2xl bg-primary shrink-0 shadow-lg">
                {isSending ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🌟</div>
          ) : posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database }: { post: any, currentUser: any, database: any }) {
  const isMine = post.userId === currentUser?.uid;
  const isAdmin = currentUser?.displayName === 'admin'; 
  const canDelete = isMine || isAdmin;

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likedBy/${currentUser.uid}`);
    const countRef = ref(database, `publicPosts/${post.id}/likesCount`);
    
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

  const handleDelete = async () => {
    if (!canDelete) return;
    if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      playSound('click');
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    }
  };

  const isLiked = post.likedBy?.[currentUser?.uid || ''];

  return (
    <Card className="rounded-[2rem] border-none shadow-lg bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Link href={`/user/${post.userId}`}>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl overflow-hidden border border-border">
                {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" alt="Avatar" /> : <span>{post.userAvatar || "🐱"}</span>}
              </div>
            </Link>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <p className="font-black text-primary text-xs">{post.userName}</p>
                {post.isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
            </div>
          </div>
          {canDelete && <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive"><Trash2 size={14}/></Button>}
        </div>
        
        <div className="px-4 pb-4 space-y-3">
          {post.text && <p className="text-sm font-bold text-primary/80 leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
          {post.image && (
            <div className="rounded-2xl overflow-hidden shadow-md border border-border">
              <img src={post.image} className="w-full h-auto max-h-[400px] object-cover" alt="Post" />
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-secondary/10 flex items-center justify-end gap-4">
          <button onClick={handleLike} className={cn("flex items-center gap-1.5 transition-transform active:scale-125", isLiked ? "text-red-500" : "text-muted-foreground")}>
            <span className="text-xs font-black">{post.likesCount || 0}</span>
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
