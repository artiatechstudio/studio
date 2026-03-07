
"use client"

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Trophy, User, BookMarked, Settings, LogOut, LogIn, Flame, MessageCircle, Bell, Star, Crown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { ref } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';

const sideNavItems = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'الدردشة', icon: MessageCircle, href: '/chat' },
  { label: 'الإشعارات', icon: Bell, href: '/notifications' },
  { label: 'الحماسة', icon: Flame, href: '/streak' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'الملف الشخصي', icon: User, href: '/profile' },
];

const mobileNavItems = [
  { label: 'الدردشة', icon: MessageCircle, href: '/chat' },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'الرئيسية', icon: Home, href: '/', isCenter: true },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'أنت', icon: User, href: '/profile' },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { database } = useFirebase();
  const auth = useAuth();

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const chatsRef = useMemoFirebase(() => ref(database, 'chats'), [database]);
  const { data: chatsData } = useDatabase(chatsRef);

  const notificationsRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/notifications`) : null, [database, user]);
  const { data: notificationsData } = useDatabase(notificationsRef);

  const unreadChatCount = useMemo(() => {
    if (!chatsData || !user) return 0;
    let totalUnread = 0;
    Object.keys(chatsData).forEach(chatId => {
      if (chatId.includes(user.uid)) {
        const chat = chatsData[chatId];
        const messages: any[] = Object.values(chat.messages || {});
        const lastSeen = chat.lastSeen?.[user.uid] || 0;
        const unreadInThisChat = messages.filter(m => 
          m.senderId !== user.uid && m.timestamp > lastSeen
        ).length;
        totalUnread += unreadInThisChat;
      }
    });
    return totalUnread;
  }, [chatsData, user]);

  const unreadNotifCount = useMemo(() => {
    if (!notificationsData) return 0;
    return Object.values(notificationsData).filter((n: any) => !n.isRead).length;
  }, [notificationsData]);

  const isPremium = userData?.isPremium === 1;
  const isAdmin = userData?.name === 'admin';

  const handleLogout = async () => {
    playSound('click');
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج", description: "نراك قريباً!" });
    router.replace('/login');
  };

  const isHome = pathname === '/';

  return (
    <>
      {/* Top Header for Mobile Only */}
      {isHome && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-xl border-b border-border z-[60] flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Link href="/notifications" onClick={() => playSound('click')} className="relative p-2 rounded-xl bg-secondary/50">
              <Bell className={cn("w-5 h-5 text-primary", unreadNotifCount > 0 && "animate-pulse")} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-black min-w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce border border-white">
                  {unreadNotifCount}
                </span>
              )}
            </Link>
          </div>

          {!isAdmin ? (
            <div className="flex items-center gap-2">
              <Link href="/streak" onClick={() => playSound('click')} className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full border border-orange-100 shadow-inner">
                <Flame size={14} className="text-orange-600" fill="currentColor" />
                <span className="text-[10px] font-black text-orange-600">{userData?.streak || 0}</span>
              </Link>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100 shadow-inner">
                <Star size={14} className="text-yellow-600" fill="currentColor" />
                <span className="text-[10px] font-black text-yellow-600">{userData?.points || 0}</span>
              </div>
            </div>
          ) : (
            <div className="bg-primary/10 px-3 py-1 rounded-full text-[9px] font-black text-primary border border-primary/20">
              وضع الإدارة 🛡️
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-primary">كارينجو</span>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xs shadow-md">
              {isAdmin ? "🛡️" : isPremium ? "👑" : "🐱"}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-72 bg-card border-l border-border z-40 p-8 shadow-2xl overflow-y-auto">
        <div className="flex items-center gap-4 mb-10 justify-end" dir="rtl">
          <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center text-white font-black text-4xl shadow-xl">
            {isAdmin ? "🛡️" : isPremium ? "👑" : "🐱"}
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-primary tracking-tight block">كارينجو</span>
            {isAdmin && <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Super Admin</span>}
            {isPremium && !isAdmin && <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">Premium</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-3" dir="rtl">
          {sideNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => playSound('click')}
              className={cn(
                "flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group relative",
                pathname === item.href 
                  ? "bg-primary text-white shadow-xl scale-[1.02]" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon className={cn("w-7 h-7", pathname === item.href ? "text-white" : "group-hover:scale-110")} />
              <span className="font-black text-xl">{item.label}</span>
              
              {item.label === 'الدردشة' && unreadChatCount > 0 && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
                  {unreadChatCount > 99 ? "+99" : unreadChatCount}
                </span>
              )}

              {item.label === 'الإشعارات' && unreadNotifCount > 0 && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-accent text-white text-[10px] font-black min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white">
                  {unreadNotifCount}
                </span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => playSound('click')}
              className={cn(
                "flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group mt-6 border-2 border-dashed border-primary/20",
                pathname === '/admin' ? "bg-red-600 text-white shadow-xl" : "text-red-600 hover:bg-red-50"
              )}
            >
              <ShieldCheck className="w-7 h-7" />
              <span className="font-black text-xl">الإدارة</span>
            </Link>
          )}
        </nav>

        <div className="pt-8 border-t border-border mt-auto space-y-4" dir="rtl">
          {user ? (
            <>
              <Link href="/settings" onClick={() => playSound('click')} className={cn(
                "flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all",
                pathname === '/settings' ? "bg-accent text-white shadow-xl" : "text-muted-foreground hover:bg-secondary"
              )}>
                <Settings className="w-7 h-7" />
                <span className="font-black text-xl">الإعدادات</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-5 px-6 py-4 rounded-[1.5rem] text-destructive hover:bg-destructive/10 transition-all w-full text-right"
              >
                <LogOut className="w-7 h-7" />
                <span className="font-black text-xl">خروج</span>
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => playSound('click')} className="flex items-center gap-5 px-6 py-4 rounded-[1.5rem] bg-primary text-white shadow-xl">
              <LogIn className="w-7 h-7" />
              <span className="font-black text-xl">دخول</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-2xl border-t border-border flex justify-around items-center h-20 px-2 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] rounded-t-[2.5rem]">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => playSound('click')}
            className={cn(
              "flex flex-col items-center justify-center transition-all flex-1 relative",
              pathname === item.href && !item.isCenter ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "transition-all flex items-center justify-center",
              item.isCenter 
                ? "w-14 h-14 bg-primary text-white rounded-2xl shadow-lg border-[3px] border-background scale-110" 
                : "p-2 rounded-xl",
              pathname === item.href && !item.isCenter ? "bg-primary/10" : ""
            )}>
              <item.icon className={cn(item.isCenter ? "w-7 h-7" : "w-6 h-6", pathname === item.href && "stroke-[3px]")} />
              
              {item.label === 'الدردشة' && unreadChatCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[8px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                  {unreadChatCount > 99 ? "99+" : unreadChatCount}
                </span>
              )}
            </div>
            {!item.isCenter && (
              <span className={cn(
                "text-[9px] font-black mt-1",
                pathname === item.href ? "text-primary opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}
