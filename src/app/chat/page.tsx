
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, MessageCircle, ArrowLeft, Clock, Sparkles, Send, Users, Globe, User } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function ChatListPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // جلب المستخدمين
  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData, isLoading } = useDatabase(usersRef);

  // جلب الدردشات الخاصة
  const chatsRef = useMemoFirebase(() => ref(database, 'chats'), [database]);
  const { data: chatsData } = useDatabase(chatsRef);

  // جلب المناشير العامة
  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limitToLast(20)), [postsRef]);
  const { data: postsData } = useDatabase(postsQuery);

  const recentChatUsers = useMemo(() => {
    if (!usersData || !chatsData || !user) return [];
    const userIdsWithChats = Object.keys(chatsData)
      .filter(chatId => chatId.includes(user.uid))
      .filter(chatId => chatsData[chatId].messages)
      .map(chatId => chatId.split('_').find(id => id !== user.uid))
      .filter(Boolean) as string[];

    return Object.values(usersData)
      .filter((u: any) => userIdsWithChats.includes(u.id))
      .slice(0, 10);
  }, [usersData, chatsData, user]);

  const filteredUsers = useMemo(() => {
    if (!usersData || !searchTerm.trim()) return [];
    return Object.values(usersData)
      .filter((u: any) => 
        u.id !== user?.uid && 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  }, [usersData, searchTerm, user]);

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
      toast({ variant: "destructive", title: "تنبيه", description: "يجب أن يكون المنشور 150 حرفاً على الأقل لنشره في التواصل الاجتماعي." });
      return;
    }

    setIsPosting(true);
    playSound('click');
    
    try {
      const userData = usersData?.[user.uid];
      await push(ref(database, 'publicPosts'), {
        userId: user.uid,
        userName: userData?.name || 'عضو مجهول',
        userAvatar: userData?.avatar || '🐱',
        content: postText,
        timestamp: serverTimestamp()
      });
      setPostText('');
      toast({ title: "تم النشر بنجاح! 🚀", description: "منشورك متاح الآن للجميع لمدة 24 ساعة." });
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
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-3xl font-black text-primary">الدردشة والمجتمع</h1>
        </header>

        {/* كرت المساعد الذكي */}
        <div className="mx-2">
          <Link href="/chat/ai" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/30">
                  🐱
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">كارينجو المساعد الذكي</p>
                  <p className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                    <Sparkles size={10} /> مدعوم بالذكاء الاصطناعي
                  </p>
                </div>
              </div>
              <ArrowLeft className="rotate-180 opacity-50" />
            </div>
          </Link>
        </div>

        {/* البحث والدردشات */}
        <Card className="rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardHeader className="p-8 border-b border-border bg-secondary/10 flex flex-row items-center justify-between flex-row-reverse">
            <CardTitle className="text-xl font-black text-primary flex items-center gap-2">الرسائل الخاصة <Users size={20}/></CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="ابحث باسم المستخدم لبدء محادثة..." 
                className="h-14 pr-12 rounded-2xl bg-secondary/50 border-none font-bold text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm.trim() && (
              <div className="space-y-3">
                <p className="text-xs font-black text-muted-foreground px-2">نتائج البحث</p>
                {filteredUsers.length > 0 ? filteredUsers.map((u: any) => (
                  <UserChatListItem key={u.id} user={u} />
                )) : (
                  <p className="text-center p-4 text-muted-foreground font-bold">لا يوجد مستخدمين بهذا الاسم</p>
                )}
              </div>
            )}

            {!searchTerm.trim() && recentChatUsers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-black text-muted-foreground px-2 flex items-center gap-2">
                  <Clock size={14} /> دردشات سابقة
                </p>
                {recentChatUsers.map((u: any) => (
                  <UserChatListItem key={u.id} user={u} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* التواصل الاجتماعي العام */}
        <section className="space-y-6 mx-2">
          <div className="flex items-center gap-3 text-primary px-4">
            <Globe className="text-accent" />
            <h2 className="text-2xl font-black">التواصل الاجتماعي</h2>
          </div>

          <Card className="rounded-[2.5rem] shadow-xl border-none bg-card p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground text-right px-2">اكتب شيئاً ملهماً للمجتمع (150 حرفاً على الأقل)</p>
              <Textarea 
                placeholder="شاركنا أفكارك، نصيحة، أو تجربة اليوم..."
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

            <div className="pt-6 space-y-4">
              <p className="text-xs font-black text-primary border-b border-border pb-2 flex items-center gap-2">
                <Users size={14}/> آخر المناشير خلال 24 ساعة
              </p>
              
              {publicPosts.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground font-bold italic opacity-40">
                  كن أول من ينشر في التواصل الاجتماعي اليوم! 🐱✨
                </div>
              ) : (
                <div className="space-y-4">
                  {publicPosts.map((post) => (
                    <div key={post.id} className="bg-secondary/20 p-5 rounded-[2rem] border border-transparent hover:border-accent/10 transition-all">
                      <div className="flex items-center justify-between mb-3 flex-row-reverse">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Link href={`/user/${post.userId}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-border">
                            {post.userAvatar}
                          </Link>
                          <div className="text-right">
                            <p className="font-black text-primary text-xs leading-none">{post.userName}</p>
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

function UserChatListItem({ user }: { user: any }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
      <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border border-border shadow-sm hover:scale-110 transition-transform">
          {user.avatar || "🐱"}
        </div>
      </Link>
      <Link href={`/chat/${user.id}`} onClick={() => playSound('click')} className="flex-1 flex items-center justify-between mr-4">
        <div className="text-right">
          <p className="font-black text-primary">{user.name}</p>
          <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[150px]">
            {user.bio || "عضو في كارينجو 🌱"}
          </p>
        </div>
        <ArrowLeft className="text-primary opacity-30 rotate-180" />
      </Link>
    </div>
  );
}
