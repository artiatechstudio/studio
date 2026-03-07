
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, Clock, Globe, User } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsUpdating] = useState(false);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const activePosts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(post => post.timestamp && (now - post.timestamp) < oneDay)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !user || isSubmitting) return;
    
    if (postText.length > 150) {
      toast({ variant: "destructive", title: "المنشور طويل جداً", description: "الحد الأقصى هو 150 حرفاً." });
      return;
    }

    setIsUpdating(true);
    playSound('click');

    try {
      // جلب بيانات المستخدم الحالية للمنشور
      const userRef = ref(database, `users/${user.uid}`);
      const { data: userData } = await new Promise<any>((resolve) => {
        const unsubscribe = require('firebase/database').onValue(userRef, (snap: any) => {
          unsubscribe();
          resolve({ data: snap.val() });
        });
      });

      await push(postsRef, {
        userId: user.uid,
        userName: userData?.name || "عضو مجهول",
        userAvatar: userData?.avatar || "🐱",
        text: postText.trim(),
        timestamp: serverTimestamp()
      });

      setPostText('');
      toast({ title: "تم النشر بنجاح! 🌍" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-border mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div className="text-right">
            <h1 className="font-black text-primary leading-none">المجتمع العام</h1>
            <p className="text-[9px] text-muted-foreground font-bold mt-1">تختفي المنشورات بعد 24 ساعة</p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      <div className="app-container py-6 space-y-6">
        {/* Form */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-card overflow-hidden mx-2">
          <CardContent className="p-6 space-y-4">
            <div className="relative">
              <Textarea 
                placeholder="ماذا يدور في ذهنك؟ (بحد أقصى 150 حرفاً)"
                className="min-h-[100px] rounded-2xl bg-secondary/30 border-none font-bold text-right resize-none focus-visible:ring-primary p-4"
                value={postText}
                onChange={(e) => setPostText(e.target.value.slice(0, 150))}
                maxLength={150}
              />
              <div className={cn(
                "absolute bottom-3 left-4 text-[10px] font-black",
                postText.length >= 140 ? "text-red-500" : "text-muted-foreground"
              )}>
                {postText.length}/150
              </div>
            </div>
            <Button 
              onClick={handleSendPost}
              disabled={!postText.trim() || isSubmitting}
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 font-black gap-2 shadow-lg"
            >
              <Send size={18} className="rotate-180" />
              {isSubmitting ? "جاري النشر..." : "انشر الآن"}
            </Button>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4 mx-2">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePosts.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا توجد مناشير نشطة حالياً. كن أول من ينشر! 🌍✨</div>
          ) : (
            activePosts.map((post) => (
              <Card key={post.id} className="rounded-3xl border-none shadow-md bg-white overflow-hidden hover:scale-[1.01] transition-transform">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/user/${post.userId}`} onClick={() => playSound('click')} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl border border-border shadow-sm">
                        {post.userAvatar || "🐱"}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-sm leading-none">{post.userName}</p>
                        <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 mt-1">
                          <Clock size={8} />
                          {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                        </p>
                      </div>
                    </Link>
                    <Link href={`/user/${post.userId}`}>
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-primary/5">
                        <User size={16} />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed text-right">
                    {post.text}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
