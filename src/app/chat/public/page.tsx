
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, remove, update } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Globe, Sparkles, Crown, Clock, AlertCircle, MessageSquarePlus } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicChatPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;
  const today = new Date().toLocaleDateString('en-CA');
  const dailyCount = userData?.dailyPostCount?.[today] || 0;
  const maxPosts = 5;
  const remainingPosts = isPremium ? Infinity : Math.max(0, maxPosts - dailyCount);

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;

    if (!isPremium && remainingPosts <= 0) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لنشر غير محدود! 👑" });
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    try {
      const newPost = {
        senderId: user.uid,
        senderName: userData?.name || 'عضو مجهول',
        senderAvatar: userData?.avatar || '🐱',
        content: postText.trim(),
        timestamp: serverTimestamp(),
        isPremium: isPremium
      };

      await push(postsRef, newPost);
      
      // تحديث عداد المنشورات اليومي
      await update(ref(database, `users/${user.uid}/dailyPostCount`), {
        [today]: dailyCount + 1
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    playSound('click');
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟ 🗑️")) return;
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
        
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Globe size={28} className="animate-pulse" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المجتمع العام</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">شارك إلهامك مع العالم ✨</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageSquarePlus className="rotate-180" />
            </Button>
          </Link>
        </header>

        {/* صندوق إنشاء منشور - نظام فيسبوك */}
        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2 border-t-4 border-primary">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-border shadow-sm">
                {userData?.avatar && userData.avatar.startsWith('http') ? (
                  <Image src={userData.avatar} alt="Me" width={48} height={48} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <span>{userData?.avatar || "🐱"}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder={`بماذا تفكر يا ${userData?.name?.split(' ')[0] || 'بطل'}؟...`}
                  className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right text-sm focus-visible:ring-primary resize-none p-4"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value.slice(0, 280))}
                  maxLength={280}
                />
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[9px] font-black", postText.length >= 250 ? "text-destructive" : "text-muted-foreground")}>
                      {postText.length}/280 حرف
                    </span>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                      <span className="text-[8px] font-black text-muted-foreground">المتبقي اليوم:</span>
                      {isPremium ? <Crown size={10} className="text-yellow-500" fill="currentColor" /> : <span className="text-[10px] font-black text-primary">{remainingPosts}</span>}
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendPost} 
                    disabled={!postText.trim() || isSubmitting}
                    className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 font-black shadow-lg gap-2"
                  >
                    {isSubmitting ? "جاري النشر..." : "نشر الآن"}
                    <Send size={16} className="rotate-180" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* سجل المنشورات - الأحدث أولاً */}
        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-muted-foreground uppercase">جاري مزامنة المجتمع...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 opacity-30 space-y-4">
              <Globe size={64} className="mx-auto" />
              <p className="font-black text-xl">كن أول من ينشر في المجتمع! 🐱🌍</p>
            </div>
          ) : (
            posts.map((post) => {
              const isMyPost = post.senderId === user?.uid;
              const canDelete = isMyPost || isAdmin;
              const isPostPremium = post.isPremium === true;

              return (
                <Card key={post.id} className="rounded-[2rem] border-none shadow-md bg-card overflow-hidden group transition-all hover:shadow-xl">
                  <CardContent className="p-5 space-y-4">
                    <header className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link href={`/user/${post.senderId}`} onClick={() => playSound('click')}>
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0 overflow-hidden border border-border shadow-sm hover:scale-110 transition-transform">
                            {post.senderAvatar && post.senderAvatar.startsWith('http') ? (
                              <Image src={post.senderAvatar} alt={post.senderName} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                            ) : (
                              <span>{post.senderAvatar || "🐱"}</span>
                            )}
                          </div>
                        </Link>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <h3 className="font-black text-primary text-xs">{post.senderName}</h3>
                            {isPostPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                            <Clock size={8} />
                            {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                          </div>
                        </div>
                      </div>
                      {canDelete && (
                        <Button 
                          onClick={() => handleDeletePost(post.id)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </header>

                    <div className="bg-secondary/20 p-5 rounded-2xl border-r-4 border-primary/20">
                      <p className="text-sm font-bold text-foreground leading-relaxed whitespace-pre-wrap text-right">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-4 px-2">
                       <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Careingo Community Feed</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {!isPremium && (
          <section className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10 mx-2 space-y-3">
            <div className="flex items-center gap-2 text-primary font-black text-[10px]">
              <AlertCircle size={12} /> نظام النشر المحدود
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/70 leading-relaxed">
              لحماية جودة المحتوى، يمنحك النظام {maxPosts} منشورات يومياً فقط. للحصول على نشر غير محدود وتمييز ملفك بالتاج الملكي، اشترك في بريميوم الآن! 👑✨
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
