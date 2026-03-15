
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, update, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, Image as ImageIcon, Heart, Trash2, Crown, Loader2, Camera, X, ChevronDown, MessageCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsQuery = useMemoFirebase(() => query(ref(database, 'publicPosts'), limitToLast(displayLimit)), [database, displayLimit]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
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
        description: "يمكنك نشر منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsPosting(true);
    playSound('click');

    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await update(newPostRef, {
        id: newPostRef.key,
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar || "🐱",
        isPremium: isPremium,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      await update(ref(database, `users/${user.uid}`), {
        [`dailyPostCount/${todayStr}`]: dailyCount + 1
      });

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
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الأبطال 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea 
              placeholder="بماذا تفكر يا بطل؟..." 
              className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus-visible:ring-primary"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            
            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-inner group">
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

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="rounded-xl h-12 gap-2 border-primary/20 text-primary font-black"
                  disabled={isCompressing}
                >
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={18}/>}
                  صورة
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={isPosting || (!postText.trim() && !postImage)} 
                className="flex-1 h-12 rounded-xl bg-primary text-white font-black gap-3 shadow-lg shadow-primary/20"
              >
                {isPosting ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" size={18} />}
                نشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading && posts.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱✍️</div>
          ) : posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
        </div>

        {posts.length >= displayLimit && (
          <div className="mx-2 pb-10">
            <Button 
              onClick={() => { setDisplayLimit(prev => prev + 10); playSound('click'); }} 
              variant="ghost" 
              className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/20 text-primary font-black gap-2 hover:bg-primary/5"
            >
              <ChevronDown size={20} /> عرض المزيد من الإلهام
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const isMine = currentUser?.uid === post.userId;
  const likesCount = post.likes ? Object.keys(post.likes).length : 0;
  const isLikedByMe = post.likes?.[currentUser?.uid || ''];

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    runTransaction(likeRef, (curr) => {
      if (curr) return null;
      return true;
    });
  };

  const handleDelete = async () => {
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور بنجاح ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <Card className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden transition-all hover:shadow-xl">
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
              {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                <img src={post.userAvatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span>{post.userAvatar || "🐱"}</span>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <p className="font-black text-primary text-sm">{post.userName}</p>
                {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground opacity-60">
                {post.timestamp ? new Date(post.timestamp).toLocaleString('ar-LY', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'الآن'}
              </p>
            </div>
          </div>
          
          {(isMine || isAdmin) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full">
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] p-10 text-center" dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">حذف المنشور؟</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">هذا الإجراء نهائي ولا يمكن التراجع عنه. ⚠️</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl font-black">نعم، احذف</AlertDialogAction>
                  <AlertDialogCancel className="rounded-xl font-black">إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {post.text && (
          <div className="px-6 pb-4">
            <p className="text-sm font-bold text-primary/80 leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>
          </div>
        )}

        {post.image && (
          <div className="w-full bg-black/5 flex justify-center">
            <img 
              src={post.image} 
              className="w-full h-auto max-h-[500px] object-contain" 
              alt="Post Image" 
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4 border-t border-border/50 bg-secondary/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike} 
              className={cn(
                "flex items-center gap-1.5 transition-all active:scale-125",
                isLikedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-400"
              )}
            >
              <Heart size={20} fill={isLikedByMe ? "currentColor" : "none"} />
              <span className="text-xs font-black">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle size={20} />
              <span className="text-xs font-black">0</span>
            </div>
          </div>
          <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Careingo Community</p>
        </div>
      </CardContent>
    </Card>
  );
}
