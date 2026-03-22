
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, update, runTransaction, remove } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Heart, Trash2, Camera, Loader2, MessageSquare, Crown, Share2, ChevronDown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { UserAvatar } from '@/components/user-avatar';
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';

export default function PublicWallPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [msgText, setMsgText] = useState('');
  const [msgImage, setMsgImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!msgText.trim() && !msgImage) || isSending) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const postCountToday = userData?.dailyPostCount?.[todayStr] || 0;
    const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';

    if (!isPremium && postCountToday >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "الأعضاء العاديون يمكنهم نشر منشورين فقط يومياً. اشترك في بريميوم للنشر غير المحدود!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsSending(true);
    playSound('click');

    try {
      const newPost = {
        userId: user.uid,
        userName: userData.name || 'بطل',
        userAvatar: userData.avatar || '🐱',
        isPremium: isPremium ? 1 : 0,
        text: msgText.trim(),
        image: msgImage,
        timestamp: serverTimestamp(),
        likes: {}
      };

      await push(postsRef, newPost);
      await update(ref(database, `users/${user.uid}`), { [`dailyPostCount/${todayStr}`]: postCountToday + 1 });
      
      setMsgText(''); setMsgImage(null);
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner"><MessageSquare size={24} /></div>
          <div className="text-right">
            <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إنجازاتك مع العالم 🌍</p>
          </div>
        </header>

        <Card className="mx-2 p-4 rounded-[2rem] border-none shadow-xl bg-card space-y-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex gap-3">
              <UserAvatar user={userData} size="md" />
              <textarea 
                placeholder="ماذا يدور في ذهنك يا بطل؟"
                className="flex-1 bg-secondary/30 rounded-2xl p-3 text-xs font-bold text-right outline-none min-h-[80px] resize-none"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
              />
            </div>
            {msgImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md">
                <img src={msgImage} className="w-full h-full object-cover" alt="Preview" />
                <button onClick={() => setMsgImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><Trash2 size={14}/></button>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="h-10 px-4 rounded-xl border-primary/20 text-primary gap-2 text-[10px] font-black">
                <Camera size={16} /> أضف صورة
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const compressed = await compressImage(file); setMsgImage(compressed); playSound('click');
              }} />
              <Button type="submit" disabled={isSending} className="h-10 px-6 rounded-xl bg-primary font-black text-xs shadow-lg shadow-primary/20 gap-2">
                {isSending ? <Loader2 className="animate-spin" size={14}/> : <Send size={14} className="rotate-180" />} انشر الآن
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2">
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} database={database} isAdmin={userData?.name === 'admin'} />
          ))}
          {!isLoading && posts.length >= displayLimit && (
            <Button onClick={() => { setDisplayLimit(prev => prev + 10); playSound('click'); }} variant="ghost" className="w-full h-14 rounded-2xl font-black text-primary gap-2">
              <ChevronDown size={18} /> عرض المزيد من الإلهام
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUser, database, isAdmin }: { post: any, currentUser: any, database: any, isAdmin: boolean }) {
  const likesCount = post.likes ? Object.keys(post.likes).length : 0;
  const isLiked = currentUser && post.likes?.[currentUser.uid];

  const handleLike = () => {
    if (!currentUser) return;
    playSound('click');
    const likeRef = ref(database, `publicPosts/${post.id}/likes/${currentUser.uid}`);
    runTransaction(likeRef, (curr) => curr ? null : true);
  };

  const handleDelete = () => {
    if (!window.confirm("هل أنت متأكد من حذف المنشور؟")) return;
    playSound('click');
    remove(ref(database, `publicPosts/${post.id}`));
    toast({ title: "تم حذف المنشور" });
  };

  return (
    <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-lg bg-card">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(isAdmin || (currentUser && post.userId === currentUser.uid)) && (
            <button onClick={handleDelete} className="text-destructive/30 hover:text-destructive p-2"><Trash2 size={16}/></button>
          )}
          <div className="text-[9px] font-bold text-muted-foreground">
            {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <p className="font-black text-primary text-xs">{post.userName}</p>
              {post.isPremium === 1 && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">عضو مجتهد</p>
          </div>
          <Link href={`/user/${post.userId}`}>
            <UserAvatar user={{ id: post.userId, avatar: post.userAvatar, isPremium: post.isPremium, name: post.userName }} size="md" />
          </Link>
        </div>
      </div>
      <CardContent className="px-6 pb-6 space-y-4">
        {post.text && <p className="text-sm font-bold text-right leading-relaxed whitespace-pre-wrap">{post.text}</p>}
        {post.image && (
          <div className="rounded-3xl overflow-hidden border border-border shadow-inner bg-black/5">
            <img src={post.image} className="w-full h-auto max-h-[500px] object-contain" alt="Post" />
          </div>
        )}
        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <button onClick={handleLike} className={cn("flex items-center gap-1.5 transition-all", isLiked ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-400")}>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-black">{likesCount}</span>
          </button>
          <button onClick={() => { if (navigator.share) navigator.share({ title: `منشور ${post.userName} على كارينجو`, text: post.text, url: window.location.href }); }} className="text-muted-foreground hover:text-primary transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
