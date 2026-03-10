
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast, update } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, ArrowLeft, Camera, X, Loader2, Globe, MessageSquare, Crown, Sparkles } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => postsRef ? query(postsRef, limitToLast(50)) : null, [postsRef]);
  const { data: postsData, isLoading: isPostsLoading } = useDatabase(postsQuery);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
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
    if ((!postText.trim() && !postImage) || !user || !userData || isSending) return;

    const isPremium = userData.isPremium === 1 || userData.name === 'admin';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyCount = userData.dailyPostsCount?.[todayStr] || 0;

    if (!isPremium && dailyCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "يسمح بنشر منشورين فقط يومياً للأعضاء العاديين. اشترك في بريميوم للنشر غير المحدود! 👑" 
      });
      return;
    }

    setIsSending(true);
    playSound('click');

    const newPost = {
      userId: user.uid,
      userName: userData.name,
      userAvatar: userData.avatar || "🐱",
      userIsPremium: isPremium,
      text: postText.trim(),
      image: postImage,
      timestamp: serverTimestamp()
    };

    try {
      await push(postsRef!, newPost);
      await update(ref(database, `users/${user.uid}`), {
        [`dailyPostsCount/${todayStr}`]: dailyCount + 1
      });
      setPostText('');
      setPostImage(null);
      toast({ title: "تم النشر بنجاح! 🌍✨" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSending(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA');
  const postsLeft = Math.max(0, 2 - (userData?.dailyPostsCount?.[todayStr] || 0));
  const isMePremium = userData?.isPremium === 1 || userData?.name === 'admin';

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shadow-inner">
              <Globe size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع الجميع 🌍</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <Card className="rounded-[2.5rem] p-5 shadow-xl border-none bg-card space-y-4 mx-2">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-primary flex items-center gap-2">
              <MessageSquare size={14} /> بماذا تفكر يا بطل؟
            </p>
            {!isMePremium && (
              <span className="text-[8px] font-black bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                المتبقي اليوم: {postsLeft}/2
              </span>
            )}
          </div>
          
          <form onSubmit={handleSendPost} className="space-y-3">
            <div className="relative">
              <textarea 
                placeholder="اكتب رسالتك الملهمة هنا..."
                className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                disabled={isSending}
              />
              
              {postImage && (
                <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary shadow-md animate-in zoom-in duration-300">
                  <img src={postImage} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setPostImage(null)} 
                    className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full"
                  >
                    <X size={12}/>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                size="icon" 
                variant="outline" 
                className="h-12 w-12 rounded-xl border-primary/20 text-primary"
                disabled={isCompressing || isSending}
              >
                {isCompressing ? <Loader2 className="animate-spin" size={18}/> : <Camera size={20}/>}
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20 gap-2"
                disabled={isSending || (!postText.trim() && !postImage)}
              >
                {isSending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="rotate-180" /> انشر الآن</>}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4 mx-2 pb-20">
          {isPostsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">كن أول من ينشر في المجتمع! 🐱✨</div>
          ) : posts.map((post: any) => (
            <Card key={post.id} className="rounded-[2rem] border border-border shadow-md bg-card overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${post.userId}`}>
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl overflow-hidden border border-border">
                        {post.userAvatar?.startsWith('data:image') || post.userAvatar?.startsWith('http') ? (
                          <img src={post.userAvatar} className="w-full h-full object-cover" alt={post.userName} />
                        ) : (
                          <span>{post.userAvatar || "🐱"}</span>
                        )}
                      </div>
                    </Link>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <h3 className="font-black text-primary text-xs">{post.userName}</h3>
                        {post.userIsPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground">
                        {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-secondary/20 p-2 rounded-xl text-primary/40">
                    <Sparkles size={14} />
                  </div>
                </div>

                {post.text && (
                  <p className="text-sm font-bold text-slate-700 leading-relaxed text-right whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}

                {post.image && (
                  <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm bg-black/5">
                    <img 
                      src={post.image} 
                      className="w-full max-h-[400px] object-contain" 
                      alt="Post content" 
                      loading="lazy"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
