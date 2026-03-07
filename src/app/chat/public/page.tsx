
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Globe, ArrowLeft, Send, Clock, Users } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function PublicPostsPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // جلب المستخدمين لمعرفة الاسم والافتار الحالي
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [database, user]);
  const { data: userData } = useDatabase(userRef);

  // جلب المناشير العامة
  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(50)), [postsRef]);
  const { data: postsData, isLoading } = useDatabase(postsQuery);

  const publicPosts = useMemo(() => {
    if (!postsData) return [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return Object.entries(postsData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter(post => post.timestamp && (now - post.timestamp < oneDay))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleSendPost = async () => {
    if (!user || postText.length < 150) {
      toast({ variant: "destructive", title: "تنبيه", description: "يجب أن يكون المنشور 150 حرفاً على الأقل." });
      return;
    }

    setIsPosting(true);
    playSound('click');
    
    try {
      await push(ref(database, 'publicPosts'), {
        userId: user.uid,
        userName: userData?.name || 'عضو مجهول',
        userAvatar: userData?.avatar || '🐱',
        content: postText,
        timestamp: serverTimestamp()
      });
      setPostText('');
      toast({ title: "تم النشر بنجاح! 🚀" });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في النشر" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 space-y-8">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Globe size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[10px] text-muted-foreground font-bold italic">مناشير تلهم الجميع لمدة 24 ساعة</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <section className="space-y-6 mx-2">
          <Card className="rounded-[2.5rem] shadow-xl border-none bg-card p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground text-right px-2">شاركنا شيئاً ملهماً (150 حرفاً على الأقل)</p>
              <Textarea 
                placeholder="اكتب هنا..."
                className="min-h-[120px] rounded-3xl bg-secondary/30 border-none font-bold text-right resize-none focus-visible:ring-accent"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="flex items-center justify-between px-2">
                <span className={`text-[10px] font-black ${postText.length >= 150 ? 'text-green-500' : 'text-red-400'}`}>
                  {postText.length} / 150
                </span>
                <Button 
                  onClick={handleSendPost} 
                  disabled={isPosting || postText.length < 150}
                  className="rounded-full px-6 bg-accent hover:bg-accent/90 font-black h-10 shadow-lg"
                >
                  {isPosting ? "جاري النشر..." : "نشر الآن 🚀"}
                </Button>
              </div>
            </div>

            <div className="pt-6 space-y-4 border-t border-border">
              <p className="text-xs font-black text-primary flex items-center gap-2">
                <Users size={14}/> نبض المجتمع حالياً
              </p>
              
              {isLoading ? (
                <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
              ) : publicPosts.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground font-bold italic opacity-40">
                  لا يوجد مناشير حالياً، كن أول من يلهمنا! 🐱✨
                </div>
              ) : (
                <div className="space-y-4">
                  {publicPosts.map((post) => (
                    <div key={post.id} className="bg-secondary/20 p-5 rounded-[2rem] border border-transparent hover:border-accent/10 transition-all shadow-sm">
                      <div className="flex items-center justify-between mb-3 flex-row-reverse">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Link href={`/user/${post.userId}`} onClick={() => playSound('click')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-border hover:scale-110 transition-transform">
                            {post.userAvatar}
                          </Link>
                          <div className="text-right">
                            <Link href={`/user/${post.userId}`} className="font-black text-primary text-xs leading-none hover:underline">{post.userName}</Link>
                            <p className="text-[8px] font-bold text-muted-foreground mt-1 flex items-center justify-end gap-1">
                              <Clock size={8} /> 
                              {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ar }) : 'الآن'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-muted-foreground leading-relaxed text-right whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
