
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, ArrowLeft, Clock, Sparkles, Users, Globe } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';

export default function ChatListPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  // جلب المستخدمين
  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData } = useDatabase(usersRef);

  // جلب الدردشات الخاصة
  const chatsRef = useMemoFirebase(() => ref(database, 'chats'), [database]);
  const { data: chatsData } = useDatabase(chatsRef);

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

        {/* كروت الوصول السريع */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2">
          <Link href="/chat/ai" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:scale-[1.02] transition-transform h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/30">
                  🐱
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">كارينجو الذكي</p>
                  <p className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                    <Sparkles size={10} /> مساعدك الشخصي
                  </p>
                </div>
              </div>
              <ArrowLeft className="rotate-180 opacity-50" />
            </div>
          </Link>

          <Link href="/chat/public" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-r from-accent to-pink-500 text-white shadow-lg hover:scale-[1.02] transition-transform h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/30">
                  🌍
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">المجتمع العام</p>
                  <p className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                    <Globe size={10} /> انشر إلهامك للجميع
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
