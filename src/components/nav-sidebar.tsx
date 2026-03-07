
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Trophy, User, BookMarked, Settings, LogOut, LogIn, Flame, MessageCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { ref } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';
import { useMemo } from 'react';

const sideNavItems = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'الدردشة', icon: MessageCircle, href: '/chat' },
  { label: 'الحماسة', icon: Flame, href: '/streak' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'الملف الشخصي', icon: User, href: '/profile' },
];

const mobileNavItems = [
  { label: 'الدردشة', icon: MessageCircle, href: '/chat' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الرئيسية', icon: Home, href: '/', isCenter: true },
  { label: 'الموارد', icon: BookOpen, href: '/resources' },
  { label: 'أنت', icon: User, href: '/profile' },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { database } = useFirebase();
  const auth = useAuth();

  // نظام إشعارات الدردشة الذكي
  const chatsRef = useMemoFirebase(() => ref(database, 'chats'), [database]);
  const { data: chatsData } = useDatabase(chatsRef);

  const unreadCount = useMemo(() => {
    if (!chatsData || !user) return 0;
    
    let count = 0;
    Object.keys(chatsData).forEach(chatId => {
      if (chatId.includes(user.uid)) {
        const chat = chatsData[chatId];
        const messages: any[] = Object.values(chat.messages || {});
        if (messages.length === 0) return;

        // العثور على طابع زمن آخر رسالة
        const lastMsg = messages.reduce((prev, curr) => (curr.timestamp > prev.timestamp ? curr : prev), messages[0]);
        const lastSeen = chat.lastSeen?.[user.uid] || 0;

        // إذا كانت الرسالة من شخص آخر وهي أحدث من آخر وقت دخول لي للدردشة
        if (lastMsg.senderId !== user.uid && lastMsg.timestamp > lastSeen) {
          count++;
        }
      }
    });
    return count;
  }, [chatsData, user]);

  const handleLogout = async () => {
    playSound('click');
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج", description: "نراك قريباً!" });
    router.replace('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-72 bg-card border-l border-border z-40 p-8 shadow-2xl overflow-y-auto">
        <div className="flex items-center gap-4 mb-10 justify-end" dir="rtl">
          <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center text-white font-black text-4xl shadow-xl">🐱</div>
          <span className="text-3xl font-black text-primary tracking-tight">كارينجو</span>
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
              
              {item.label === 'الدردشة' && unreadCount > 0 && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
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

      {/* Mobile Navigation */}
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
              
              {item.label === 'الدردشة' && unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                  {unreadCount}
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
