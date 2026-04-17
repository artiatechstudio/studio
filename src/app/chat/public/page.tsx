
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, remove, runTransaction, get, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Send, Camera, Heart, Trash2, Crown, Loader2, Image as ImageIcon, X, ChevronDown, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { UserAvatar } from '@/components/user-avatar';
import Link from 'next/link';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(100)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, displayLimit);
  }, [postsData, displayLimit]);

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

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postText.trim() && !postImage) || isPosting || !user) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
    const dailyCount = userData?.dailyPostCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", title: "وصلت للحد اليومي 🛑", 
        description: "اشترك في بريميوم لنشر غير محدود وتطوير مجتمعك!",
        action: <ToastAction altText="اشترك الآن" onClick={() => (window.location.href='/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsPosting(true);
    playSound('click');
    try {
      await push(postsRef, {
        userId: user.uid,
        userName: userData.name || 'بطل',
        userAvatar: userData.avatar || '🐱',
        isPremium: isPremium,
        text: postText.trim(),
        image: postImage,
        timestamp: serverTimestamp()
      });
      
      update(ref(database, `users/${user.uid}`), {
        [`dailyPostCount/${todayStr}`]: dailyCount + 1
      });

      setPostText('');
      setPostImage(null);
      playSound('success');
      toast({ title: "تم النشر في المجتمع! 🌍" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsPosting(true); // تعمدت إبقاؤها true لفترة قصيرة أو إعادة تعيينها
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg"><Globe size={24} /></div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="rounded-[2rem] p-4 shadow-xl border-none bg-card mx-2">
          <form onSubmit={handlePost} className="space-y-4">
            <div className="flex gap-3">
              <UserAvatar user={userData} size="md" />
              <textarea 
                placeholder="بماذا تفكر يا بطل؟..." 
                className="flex-1 bg-secondary/30 rounded-2xl p-4 text-sm font-bold text-right outline-none min-h-[100px] resize-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
            {postImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 bg-black/5">
                <img src={postImage} className="w-full h-full object-contain" alt="Preview" />
                <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()} className="rounded-xl gap-2 text-primary font-bold h-11">
                <ImageIcon size={18} /> <span className="text-xs">إرفاق صورة</span>
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setPostImage(await compressImage(file));
              }} />
              <Button type="submit" disabled={isPosting || (!postText.trim() && !postImage)} className="rounded-xl px-8 bg-primary font-black h-11 gap-2 shadow-lg">
                {isPosting ? <Loader2 className="animate-spin" size={18}/> : <Send className="rotate-180" size={18}/>}
                نشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر هنا! 🐱🖋️</div>
          ) : posts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
          
          {postsData && Object.keys(postsData).length > displayLimit && (
            <Button onClick={() => setDisplayLimit(prev => prev + 10)} variant="ghost" className="w-full h-14 rounded-2xl font-black text-primary gap-2">
              <ChevronDown size={20} /> عرض المزيد من المنشورات
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    get(likeRef).then(snap => {
      if (snap.exists()) remove(likeRef);
      else update(ref(database, `publicPosts/${post.id}/likes`), { [currentUser.uid]: true });
    });
  };

  const handleDelete = () => {
    if (!window.confirm("حذف هذا المنشور نهائياً؟")) return;
    playSound('click');
    remove(ref(database, `publicPosts/${post.id}`)).then(() => toast({ title: "تم الحذف بنجاح" }));
  };

  const likesCount = post.likes ? Object.keys(post.likes).length : 0;
  const isLiked = post.likes?.[currentUser?.uid || ''];

  return (
    <Card className="rounded-[2.5rem] border-none shadow-lg bg-card overflow-hidden transition-all hover:shadow-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          {(post.userId === currentUser?.uid || isAdmin) && (
            <Button onClick={handleDelete} variant="ghost" size="icon" className="text-destructive/30 hover:text-destructive rounded-full"><Trash2 size={16}/></Button>
          )}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="flex items-center gap-1 justify-end">
                <p className="font-black text-primary text-sm">{post.userName}</p>
                {post.isPremium && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
              <p className="text-[8px] font-bold text-muted-foreground">{post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}</p>
            </div>
            <Link href={`/user/${post.userId}`}>
              <UserAvatar user={{ id: post.userId, avatar: post.userAvatar, isPremium: post.isPremium }} size="md" />
            </Link>
          </div>
        </div>

        {post.text && <p className="text-sm font-bold text-primary leading-relaxed text-right whitespace-pre-wrap">{post.text}</p>}
        
        {post.image && (
          <div className="rounded-3xl overflow-hidden border border-border shadow-inner bg-black/5">
            <img src={post.image} className="w-full h-auto max-h-[500px] object-contain" alt="Post Content" />
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <button onClick={handleLike} className={cn("flex items-center gap-1.5 font-black text-xs transition-colors", isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400")}>
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground font-black text-xs">
            <MessageSquare size={16} /> 0
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
