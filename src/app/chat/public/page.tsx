
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, runTransaction, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Trash2, Send, Camera, Globe, Crown, Loader2, X, Clock, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
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
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
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
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "يسمح بـ 2 منشور يومياً للأعضاء العاديين. اشترك في بريميوم للنشر غير المحدود! 👑" });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      await push(postsRef, {
        userId: user.uid,
        userName: userData?.name || 'بطل مجهول',
        userAvatar: userData?.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp(),
        likes: {}
      });

      // تحديث عداد المنشورات اليومي
      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (curr) => (curr || 0) + 1);

      setPostText('');
      setPostImage(null);
      toast({ title: "تم النشر في المجتمع! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = (postId: string) => {
    if (!user) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${postId}/likes/${user.uid}`);
    runTransaction(likeRef, (curr) => curr ? null : true);
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

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2 p-4">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="relative">
              <textarea 
                placeholder="بماذا تفكر يا بطل؟" 
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 rounded-xl text-primary bg-white shadow-sm"
                  disabled={isCompressing}
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20}/>}
                </Button>
              </div>
            </div>

            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-inner">
                <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => setPostImage(null)} 
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={16}/>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-[9px] font-black text-muted-foreground flex items-center gap-1">
                <AlertCircle size={10} />
                {!isPremium ? `متبقي لك اليوم: ${2 - dailyPostCount}` : "نشر غير محدود للأبطال الملكيين 👑"}
              </div>
              <Button type="submit" disabled={isPosting || (!postText.trim() && !postImage)} className="h-12 px-8 rounded-xl bg-primary font-black gap-2 shadow-lg">
                {isPosting ? <Loader2 className="animate-spin" /> : <><Send size={18} className="rotate-180" /> انشر الآن</>}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6 mx-2">
          {isPostsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🐱🚀</div>
          ) : posts.map((post) => {
            const isLiked = post.likes?.[user?.uid || ''];
            const likesCount = Object.keys(post.likes || {}).length;
            const canDelete = post.userId === user?.uid || isAdmin;

            return (
              <Card key={post.id} className="rounded-[2.5rem] border-none shadow-xl bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <CardContent className="p-0">
                  <div className="p-5 flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <Link href={`/user/${post.userId}`}>
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl overflow-hidden border-2 border-white shadow-sm">
                          {post.userAvatar?.startsWith('data:image') ? (
                            <img src={post.userAvatar} className="w-full h-full object-cover" alt="avatar" />
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
                        <p className="text-[8px] font-bold text-muted-foreground flex items-center gap-1 justify-end">
                          {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                          <Clock size={8} />
                        </p>
                      </div>
                    </div>
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full"><Trash2 size={18}/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem]" dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-right">حذف المنشور؟</AlertDialogTitle>
                            <AlertDialogDescription className="text-right">لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive">نعم، احذف</AlertDialogAction>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <div className="px-6 pb-4">
                    {post.text && <p className="text-sm font-bold text-foreground leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
                  </div>

                  {post.image && (
                    <div className="w-full bg-black/5 flex items-center justify-center overflow-hidden">
                      <img src={post.image} className="w-full h-auto max-h-[500px] object-contain" alt="Post content" />
                    </div>
                  )}

                  <div className="p-4 border-t border-border/50 bg-secondary/5 flex items-center justify-between flex-row-reverse px-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleLike(post.id)}
                      className={cn("flex items-center gap-2 rounded-full px-4 transition-all", isLiked ? "text-red-500 bg-red-50" : "text-muted-foreground")}
                    >
                      <span className="font-black text-xs">{likesCount}</span>
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </Button>
                    <div className="flex gap-2">
                       {/* أيقونات تفاعلية إضافية مستقبلاً */}
                    </div>
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
