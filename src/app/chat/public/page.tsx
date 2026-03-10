
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, update, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Send, Camera, Heart, Trash2, Crown, Loader2, X, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
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
  const [isPosting, setIsPosting] = useState(false);
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
    setPostImage(compressed);
    setIsCompressing(false);
    playSound('click');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!postText.trim() && !postImage) || isPosting) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const postCount = userData?.dailyPostsCount?.[todayStr] || 0;

    if (!isPremium && postCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "يمكنك نشر منشورين فقط يومياً. اشترك في بريميوم للنشر بلا حدود! 👑" });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await update(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData?.name || 'بطل مجهول',
        userAvatar: userData?.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      await update(ref(database, `users/${user.uid}`), {
        [`dailyPostsCount/${todayStr}`]: postCount + 1
      });

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

  const toggleLike = (postId: string, currentLikes: any) => {
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

  const deletePost = async (postId: string) => {
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${postId}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
        </header>

        <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl overflow-hidden">
                {userData?.avatar?.startsWith('data:image') ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.avatar || "🐱"}
              </div>
              <textarea 
                placeholder="بماذا تفكر يا بطل؟..." 
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-bold text-sm text-right min-h-[80px]"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
            
            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-inner">
                <img src={postImage} className="w-full h-full object-cover" />
                <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="ghost" 
                  size="icon" 
                  disabled={isCompressing}
                  className="rounded-xl text-primary"
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20}/>}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <Button type="submit" disabled={isPosting || (!postText.trim() && !postImage)} className="rounded-xl bg-primary font-black gap-2 px-6">
                {isPosting ? <Loader2 className="animate-spin" /> : <><Send className="rotate-180" size={16}/> نشر</>}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر إلهامه هنا! 🌍✨</div>
          ) : posts.map((post) => (
            <Card key={post.id} className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${post.userId}`} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl overflow-hidden border border-border">
                      {post.userAvatar?.startsWith('data:image') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userAvatar || "🐱"}
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-primary text-sm">{post.userName}</span>
                        {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
                    </div>
                  </div>
                  {(post.userId === user?.uid || userData?.name === 'admin') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive"><Trash2 size={16}/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem]" dir="rtl">
                        <AlertDialogHeader><AlertDialogTitle className="text-right">حذف المنشور؟</AlertDialogTitle><AlertDialogDescription className="text-right">هل أنت متأكد من حذف هذا المنشور نهائياً؟</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter className="gap-2"><AlertDialogAction onClick={() => deletePost(post.id)} className="bg-destructive">نعم، احذف</AlertDialogAction><AlertDialogCancel>إلغاء</AlertDialogCancel></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {post.text && <p className="text-sm font-bold text-primary leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
                
                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-border bg-black/5">
                    <img src={post.image} className="w-full max-h-[400px] object-contain" alt="Post" />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={() => toggleLike(post.id, post.likes)} 
                    className={cn("flex items-center gap-1.5 font-black text-xs transition-colors", post.likes?.[user?.uid || ''] ? "text-red-500" : "text-muted-foreground hover:text-red-400")}
                  >
                    <Heart fill={post.likes?.[user?.uid || ''] ? "currentColor" : "none"} size={18} />
                    <span>{post.likesCount || 0}</span>
                  </button>
                  <Link href={`/chat/${post.userId}`} className="flex items-center gap-1.5 font-black text-xs text-muted-foreground hover:text-primary">
                    <MessageSquare size={18} />
                    <span>تواصل</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
