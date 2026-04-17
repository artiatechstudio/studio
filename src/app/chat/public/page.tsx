
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, set, runTransaction, remove } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Camera, Heart, Trash2, Crown, Loader2, X, Globe, Sparkles, ChevronDown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/user-avatar';
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
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card } from '@/components/ui/card';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(displayLimit)), [postsRef, displayLimit]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

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

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!postText.trim() && !postImage) || isSending) return;

    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي 🛑", description: "المستخدم العادي له منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود!" });
      return;
    }

    setIsSending(true);
    playSound('click');
    try {
      const newPostRef = push(ref(database, 'publicPosts'));
      await set(newPostRef, {
        userId: user.uid,
        userName: userData.name,
        userAvatar: userData.avatar,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp(),
        likesCount: 0
      });

      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (c) => (c || 0) + 1);
      
      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍✨" });
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
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg"><Globe size={32} /></div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">تواصل مع الأبطال حول العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card mx-2 space-y-4">
          <form onSubmit={handleSendPost} className="space-y-4">
            <textarea 
              placeholder="بماذا تشعر اليوم؟ انشر إلهامك... ✨" 
              className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus:ring-2 focus:ring-accent transition-all"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-accent shadow-md">
                <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                <button type="button" onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2 border-accent/20 text-accent" disabled={isCompressing}>
                  {isCompressing ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
                </Button>
              </div>
              <Button type="submit" disabled={isSending} className="h-12 px-8 rounded-xl bg-accent hover:bg-accent/90 font-black text-white gap-2 shadow-lg flex-1">
                {isSending ? <Loader2 className="animate-spin" /> : <><Send className="rotate-180" size={18} /> انشر الآن</>}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
          
          {posts.length >= displayLimit && (
            <Button onClick={() => { setDisplayLimit(prev => prev + 10); playSound('click'); }} variant="ghost" className="w-full h-14 rounded-2xl font-black text-primary gap-2 bg-primary/5">
              <ChevronDown size={20} /> عرض المزيد من المنشورات
            </Button>
          )}

          {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (post.likes && currentUser) {
      setLiked(!!post.likes[currentUser.uid]);
    }
  }, [post.likes, currentUser]);

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
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
    playSound('click');
    try {
      await remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const isOwner = post.userId === currentUser?.uid;
  const showDelete = isOwner || isAdmin;

  return (
    <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-card transition-all hover:shadow-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.userId}`}>
              <UserAvatar user={{ id: post.userId, avatar: post.userAvatar, name: post.userName }} size="md" />
            </Link>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <h3 className="font-black text-primary text-sm">{post.userName}</h3>
                {(post.isPremium === 1 || post.userName === 'admin') && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
            </div>
          </div>
          {showDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive hover:bg-destructive/10 rounded-full"><Trash2 size={18}/></Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem]" dir="rtl">
                <AlertDialogHeader><AlertDialogTitle className="text-right">حذف المنشور؟</AlertDialogTitle><AlertDialogDescription className="text-right">لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter className="gap-2"><AlertDialogAction onClick={handleDelete} className="bg-destructive">نعم، احذف</AlertDialogAction><AlertDialogCancel>إلغاء</AlertDialogCancel></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <p className="text-sm font-bold text-primary leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>
        
        {post.image && (
          <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border-2 border-secondary/50">
            <img src={post.image} className="w-full h-auto object-contain bg-black/5" alt="Post" />
          </div>
        )}

        <div className="pt-2 flex items-center gap-4">
          <button onClick={handleLike} className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all", liked ? "bg-red-50 text-red-600" : "bg-secondary/50 text-muted-foreground")}>
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
            <span className="font-black text-xs">{post.likesCount || 0}</span>
          </button>
          <div className="bg-secondary/30 px-4 py-2 rounded-full flex items-center gap-2">
             <Sparkles size={16} className="text-accent" />
             <span className="text-[10px] font-black text-muted-foreground uppercase">إلهام</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
