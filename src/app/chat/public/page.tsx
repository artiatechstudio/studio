
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, get, update } from 'firebase/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Send, Trash2, Heart, Clock, Crown, Infinity, Camera, X, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const todayStr = new Date().toLocaleDateString('en-CA');
  const dailyCount = userData?.dailyPostsCount?.[todayStr] || 0;
  const remainingPosts = isPremium ? Infinity : Math.max(0, 2 - dailyCount);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((p: any) => !p.type) // عرض المنشورات العادية فقط
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
      reader.onerror = reject;
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
    } catch (e) {
      toast({ variant: "destructive", title: "فشل معالجة الصورة" });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postText.trim() && !postImage) || !user || isSending) return;

    if (!isPremium && remainingPosts <= 0) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "يسمح بمنشورين فقط يومياً للأعضاء العاديين. 👑" });
      return;
    }

    setIsSending(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData?.name || 'مستخدم مجهول',
      userAvatar: userData?.avatar || '🐱',
      isPremium: isPremium ? 1 : 0,
      text: postText.trim(),
      image: postImage,
      timestamp: serverTimestamp(),
      likes: {}
    };

    try {
      await push(postsRef, newPost);
      if (!isPremium) {
        await update(ref(database, `users/${user.uid}/dailyPostsCount`), { [todayStr]: dailyCount + 1 });
      }
      setPostText('');
      setPostImage(null);
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likes/${user.uid}`);
    get(likeRef).then(snap => {
      if (snap.exists()) remove(likeRef);
      else update(ref(database, `publicPosts/${postId}/likes`), { [user.uid]: true });
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك بالصور والكلمات 📸🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSendPost} className="space-y-4">
              <div className="flex items-start gap-3">
                <Link href="/profile">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                    {userData?.avatar?.startsWith('data:image') || userData?.avatar?.startsWith('http') ? (
                      <img src={userData.avatar} className="w-full h-full object-cover" alt="Me" />
                    ) : (
                      <span>{userData?.avatar || "🐱"}</span>
                    )}
                  </div>
                </Link>
                <div className="flex-1 space-y-3">
                  <textarea 
                    placeholder={`بماذا تفكر يا ${userData?.name?.split(' ')[0]}؟`}
                    className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus:ring-2 focus:ring-primary/20 resize-none outline-none"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    maxLength={280}
                  />
                  {postImage && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-secondary shadow-inner">
                      <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                      <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="rounded-xl border-2 border-primary/20 text-primary h-12 w-12" disabled={isCompressing}>
                    {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20} />}
                  </Button>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase">المتبقي</span>
                    <div className="font-black text-primary text-xs">{isPremium ? <Infinity size={12}/> : remainingPosts}</div>
                  </div>
                </div>
                <Button type="submit" disabled={(!postText.trim() && !postImage) || isSending || (!isPremium && remainingPosts <= 0)} className="h-12 px-8 rounded-xl bg-primary font-black gap-2">
                  {isSending ? "جاري النشر..." : "نشر الآن"} <Send size={16} className="rotate-180" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-20 font-black text-xl">كن أول من ينشر! 🐱✨</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] shadow-md border border-border bg-card overflow-hidden">
              <div className="p-5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/user/${post.userId}`}>
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm overflow-hidden">
                      {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                        <img src={post.userAvatar} className="w-full h-full object-cover" alt={post.userName} />
                      ) : (
                        <span>{post.userAvatar || "🐱"}</span>
                      )}
                    </div>
                  </Link>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <p className="font-black text-primary text-sm">{post.userName}</p>
                      {post.isPremium === 1 && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
                  </div>
                </div>
                {(post.userId === user?.uid || isAdmin) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive/40"><Trash2 size={16}/></Button></AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem]" dir="rtl">
                      <AlertDialogHeader><AlertDialogTitle className="text-right">حذف المنشور؟</AlertDialogTitle><AlertDialogDescription className="text-right">سيتم حذف هذا المنشور نهائياً من المجتمع.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter className="gap-2"><AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive">نعم، احذف</AlertDialogAction><AlertDialogCancel>إلغاء</AlertDialogCancel></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <CardContent className="p-5 pt-2 space-y-4">
                {post.text && <p className="text-sm font-bold text-primary/80 leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-black/5">
                    <img src={post.image} className="w-full max-h-[400px] object-contain" alt="Post" />
                  </div>
                )}
                <div className="pt-3 border-t border-border/50 flex items-center gap-4">
                  <button onClick={() => handleToggleLike(post.id)} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full transition-all", post.likes?.[user?.uid || ''] ? "bg-red-50 text-red-600 font-black" : "text-muted-foreground hover:bg-secondary font-bold")}>
                    <Heart size={18} fill={post.likes?.[user?.uid || ''] ? "currentColor" : "none"} />
                    <span className="text-xs">{Object.keys(post.likes || {}).length}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
