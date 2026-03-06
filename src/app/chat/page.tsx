"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User as UserIcon, MessageCircle, ArrowLeft } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';

export default function ChatListPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  const usersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: usersData, isLoading } = useDatabase(usersRef);

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
    <div className="min-h-screen bg-background md:pr-72 pb-32" dir="rtl">
      <NavSidebar />
      <div className="app-container py-10 space-y-8">
        <header className="flex items-center gap-4 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-3xl font-black text-primary">الدردشة العامة</h1>
        </header>

        <Card className="rounded-[2.5rem] shadow-xl border-none bg-card overflow-hidden mx-2">
          <CardHeader className="p-8 border-b border-border bg-secondary/10">
            <CardTitle className="text-xl font-black text-primary">ابحث عن مستخدم للدردشة</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="ادخل اسم المستخدم..." 
                className="h-14 pr-12 rounded-2xl bg-secondary/50 border-none font-bold text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center p-10">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <Link key={u.id} href={`/chat/${u.id}`} onClick={() => playSound('click')}>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border border-border shadow-sm">
                          {u.avatar || "🐱"}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary">{u.name}</p>
                          <p className="text-xs text-muted-foreground font-bold">انقر لبدء الدردشة</p>
                        </div>
                      </div>
                      <ArrowLeft className="text-primary opacity-30" />
                    </div>
                  </Link>
                ))
              ) : searchTerm.trim() ? (
                <p className="text-center p-10 text-muted-foreground font-bold">لا يوجد مستخدمين بهذا الاسم</p>
              ) : (
                <div className="text-center p-10 space-y-4">
                  <div className="text-6xl opacity-20">🐱💬</div>
                  <p className="text-muted-foreground font-bold">ابدأ بالبحث عن أصدقائك في مجتمع كارينجو!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}