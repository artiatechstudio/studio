
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Image as ImageIcon, Send, Trash2, Heart, Crown, Loader2, Camera, X, ArrowLeft } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicChatPage() {
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
    if (!user || isSending || (!postText.trim() && !postImage)) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({
        variant: "destructive",
        title: "وصلت للحد اليومي 🛑",
        description: "اشترك في بريميوم للنشر غير المحدود ودعم نموك!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>,
      });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      const newPost = {
        userId: user.uid,
        userName: userData?.name || 'بطل مجهول',
        userAvatar: userData?.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp(),
        likesCount: 0
      };

      await push(postsRef, newPost);
      
      // تحديث عداد المنشورات اليومي
      await runTransaction(ref(database, `users/${user.uid}/dailyPostCount/${todayStr}`), (curr) => (curr || 0) + 1);

      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر بنجاح! 🌍" });
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
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shadow-inner"><ImageIcon size={24} /></div>
            <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <Card className="rounded-[2.5rem] p-4 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handleSendPost} className="space-y-4">
            <textarea 
              placeholder="بماذا تفكر يا بطل؟..." 
              className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus:ring-2 ring-primary/20 transition-all outline-none"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            {postImage && (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-md">
                <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                <button type="button" onClick={() => setPostImage(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12}/></button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl h-12 border-primary/20 text-primary gap-2" disabled={isCompressing}>
                  {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={18}/>}
                  صورة
                </Button>
              </div>
              <Button type="submit" disabled={isSending} className="h-12 px-8 rounded-xl bg-primary font-black shadow-lg shadow-primary/20 gap-2">
                {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} className="rotate-180" />}
                انشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من يلهم المجتمع! 🌍✨</div>
          ) : posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const isLiked = post.likedBy?.[currentUser?.uid || ''];
  const canDelete = post.userId === currentUser?.uid || isAdmin;

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likedBy/${currentUser.uid}`);
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

  const handleDelete = () => {
    if (!canDelete) return;
    playSound('click');
    if (confirm("هل تريد حذف هذا المنشور؟")) {
      remove(ref(database, `publicPosts/${post.id}`));
      toast({ title: "تم حذف المنشور" });
    }
  };

  return (
    <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-lg bg-card">
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canDelete && <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive"><Trash2 size={18} /></Button>}
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Link href={`/user/${post.userId}`}>
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : <span>{post.userAvatar}</span>}
              </div>
            </Link>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <p className="font-black text-primary text-xs">{post.userName}</p>
                {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground opacity-60">
                {post.timestamp ? new Date(post.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
              </p>
            </div>
          </div>
        </div>
        
        {post.text && <p className="px-6 pb-4 text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
        {post.image && <img src={post.image} className="w-full max-h-[400px] object-cover bg-secondary/20" alt="Post" />}
        
        <div className="p-4 border-t border-border flex items-center justify-end">
          <Button onClick={handleLike} variant="ghost" className={cn("rounded-full gap-2 font-black text-xs", isLiked ? "text-red-500" : "text-muted-foreground")}>
            <span>{post.likesCount || 0}</span>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
