
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, ArrowLeft, Clock, Users, Gavel, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';
import { UserAvatar } from '@/components/user-avatar';

export default function ChatListPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  // الحل الجذري لخطأ الصلاحيات: القراءة من فهرس المستخدم الخاص (activeChats)
  // القواعد تسمح للمستخدم بقراءة مساره الخاص فقط
  const activeChatsRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/activeChats`) : null, [database, user]);
  const { data: activeChatsData } = useDatabase(activeChatsRef);

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData } = useDatabase(usersRef);

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData } = useDatabase(postsRef);

  const disputeCount = useMemo(() => {
    if (!postsData) return 0;
    return Object.values(postsData).filter((p: any) => p.type === 'dispute').length;
  }, [postsData]);

  const recentChatUsers = useMemo(() => {
    if (!usersData || !activeChatsData) return [];
    return Object.keys(activeChatsData)
      .map(chatId => {
        const otherId = chatId.split('_').find(id => id !== user?.uid);
        return usersData[otherId || ''];
      })
      .filter(Boolean)
      .sort((a, b) => {
        const t1 = activeChatsData[a.id + '_' + user?.uid]?.timestamp || activeChatsData[user?.uid + '_' + a.id]?.timestamp || 0;
        const t2 = activeChatsData[b.id + '_' + user?.uid]?.timestamp || activeChatsData[user?.uid + '_' + b.id]?.timestamp || 0;
        return t2 - t1;
      });
  }, [usersData, activeChatsData, user]);

  const filteredUsers = useMemo(() => {
    if (!usersData || !searchTerm.trim()) return [];
    return Object.values(usersData)
      .filter((u: any) => 
        u.id !== user?.uid && 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  }, [usersData, searchTerm, user]);

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center gap-4 bg-card p-5 rounded-[2rem] shadow-xl border border-border mx-2 mt-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <MessageCircle size={24} />
          </div>
          <h1 className="text-2xl font-black text-primary">الدردشة والمجتمع</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-2">
          <Link href="/chat/ai" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:scale-[1.02] transition-transform h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/30"> 🐱 </div>
                <div className="text-right">
                  <p className="font-black text-sm">كارينجو الذكي</p>
                  <p className="text-[8px] font-bold opacity-80">مساعدك الشخصي</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/chat/public" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-gradient-to-r from-accent to-pink-500 text-white shadow-lg hover:scale-[1.02] transition-transform h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/30"> 🌍 </div>
                <div className="text-right">
                  <p className="font-black text-sm">التواصل العام</p>
                  <p className="text-[8px] font-bold opacity-80">انشر إلهامك</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/chat/trials" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg hover:scale-[1.02] transition-transform h-full relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/30"> <Gavel size={24} /> </div>
                <div className="text-right">
                  <p className="font-black text-sm">المحاكمة</p>
                  <p className="text-[8px] font-bold opacity-80">احكم بين الأبطال</p>
                </div>
              </div>
              {disputeCount > 0 && (
                <span className="absolute top-2 left-2 bg-white text-red-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">{disputeCount}</span>
              )}
            </div>
          </Link>
        </div>

        <Card className="rounded-[2rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardHeader className="p-6 border-b border-border bg-secondary/10 flex flex-row items-center justify-between flex-row-reverse">
            <CardTitle className="text-lg font-black text-primary flex items-center gap-2">الرسائل الخاصة <Users size={18}/></CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="ابحث باسم المستخدم..." 
                className="h-12 pr-10 rounded-xl bg-secondary/50 border-none font-bold text-right text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm.trim() && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground px-2 uppercase tracking-widest">نتائج البحث</p>
                {filteredUsers.length > 0 ? filteredUsers.map((u: any) => (
                  <UserChatListItem key={u.id} user={u} lastMessage="ابدأ المحادثة الآن" />
                )) : (
                  <p className="text-center p-4 text-muted-foreground font-bold text-xs italic">لا يوجد مستخدمين بهذا الاسم</p>
                )}
              </div>
            )}

            {!searchTerm.trim() && recentChatUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground px-2 flex items-center gap-2 uppercase tracking-widest">
                  <Clock size={12} /> دردشات سابقة
                </p>
                {recentChatUsers.map((u: any) => (
                  <UserChatListItem key={u.id} user={u} lastMessage={activeChatsData?.[u.id + '_' + user?.uid]?.lastMessage || activeChatsData?.[user?.uid + '_' + u.id]?.lastMessage} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserChatListItem({ user, lastMessage }: { user: any, lastMessage?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
      <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
        <UserAvatar user={user} size="md" />
      </Link>
      <Link href={`/chat/${user.id}`} onClick={() => playSound('click')} className="flex-1 flex items-center justify-between mr-3">
        <div className="text-right flex-1 min-w-0">
          <div className="flex items-center gap-1 justify-end">
            <p className="font-black text-primary text-sm truncate">{user.name}</p>
            {(user.isPremium === 1 || user.name === 'admin') && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
          </div>
          <p className="text-[9px] text-muted-foreground font-bold truncate">
            {lastMessage || "عضو في كارينجو 🌱"}
          </p>
        </div>
        <ArrowLeft className="text-primary opacity-30 rotate-180 mr-3" size={14} />
      </Link>
    </div>
  );
}
