
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, ArrowLeft, Clock, Sparkles, Users, Globe, Crown } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';

export default function ChatListPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData } = useDatabase(usersRef);

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
      .slice(0, 15);
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

  const getUnreadCount = (otherUserId: string) => {
    if (!chatsData || !user) return 0;
    const chatId = [user.uid, otherUserId].sort().join('_');
    const chat = chatsData[chatId];
    if (!chat || !chat.messages) return 0;
    
    const messages: any[] = Object.values(chat.messages);
    const lastSeen = chat.lastSeen?.[user.uid] || 0;
    
    return messages.filter(m => 
      m.senderId !== user.uid && m.timestamp > lastSeen
    ).length;
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mx-2">
          <Link href="/chat/ai" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:scale-[1.02] transition-transform h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/30">
                  🐱
                </div>
                <div className="text-right">
                  <p className="font-black text-base">كارينجو الذكي</p>
                  <p className="text-[8px] font-bold opacity-80 flex items-center gap-1">
                    <Sparkles size={8} /> مساعدك الشخصي
                  </p>
                </div>
              </div>
              <ArrowLeft className="rotate-180 opacity-50" size={16} />
            </div>
          </Link>

          <Link href="/chat/public" onClick={() => playSound('click')} className="block">
            <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-gradient-to-r from-accent to-pink-500 text-white shadow-lg hover:scale-[1.02] transition-transform h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/30">
                  🌍
                </div>
                <div className="text-right">
                  <p className="font-black text-base">المجتمع العام</p>
                  <p className="text-[8px] font-bold opacity-80 flex items-center gap-1">
                    <Globe size={8} /> انشر إلهامك للجميع
                  </p>
                </div>
              </div>
              <ArrowLeft className="rotate-180 opacity-50" size={16} />
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
                placeholder="ابحث باسم المستخدم لبدء محادثة..." 
                className="h-12 pr-10 rounded-xl bg-secondary/50 border-none font-bold text-right text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm.trim() && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground px-2 uppercase tracking-widest">نتائج البحث</p>
                {filteredUsers.length > 0 ? filteredUsers.map((u: any) => (
                  <UserChatListItem key={u.id} user={u} unreadCount={getUnreadCount(u.id)} />
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
                  <UserChatListItem key={u.id} user={u} unreadCount={getUnreadCount(u.id)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserChatListItem({ user, unreadCount }: { user: any, unreadCount: number }) {
  const isPremium = user.isPremium === 1 || user.name === 'admin';
  const avatar = user.avatar;
  const isImageAvatar = avatar?.startsWith('data:image') || avatar?.startsWith('http');

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
      <Link href={`/user/${user.id}`} onClick={() => playSound('click')} className="shrink-0">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border border-border shadow-sm hover:scale-110 transition-transform overflow-hidden relative">
          {isImageAvatar ? (
            <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{avatar || "🐱"}</span>
          )}
        </div>
      </Link>
      <Link href={`/chat/${user.id}`} onClick={() => playSound('click')} className="flex-1 flex items-center justify-between mr-3">
        <div className="text-right flex-1 min-w-0">
          <div className="flex items-center gap-1 justify-end">
            <p className="font-black text-primary text-sm truncate">{user.name}</p>
            {isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
          </div>
          <p className="text-[9px] text-muted-foreground font-bold truncate">
            {user.bio || "عضو في كارينجو 🌱"}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mr-2">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
              {unreadCount > 9 ? "+9" : unreadCount}
            </span>
          )}
          <ArrowLeft className="text-primary opacity-30 rotate-180" size={14} />
        </div>
      </Link>
    </div>
  );
}
