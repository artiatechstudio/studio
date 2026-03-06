
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, User, BookMarked, Settings, LogOut, LogIn, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';

const sideNavItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/' },
  { label: 'الحماسة', icon: Flame, href: '/streak' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'أنت', icon: User, href: '/profile' },
];

const mobileNavItems = [
  { label: 'الحماسة', icon: Flame, href: '/streak' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/', isCenter: true },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'أنت', icon: User, href: '/profile' },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    playSound('click');
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج", description: "نراك قريباً!" });
    router.replace('/login');
  };

  return (
    <>
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-64 bg-card border-l border-border z-40 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-12 justify-end" dir="rtl">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">🐱</div>
          <span className="text-3xl font-black text-primary tracking-tighter">كارينجو</span>
        </div>

        <nav className="flex-1 space-y-3" dir="rtl">
          {sideNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => playSound('click')}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                pathname === item.href 
                  ? "bg-primary text-white shadow-xl" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", pathname === item.href ? "text-white" : "group-hover:scale-110")} />
              <span className="font-black text-lg">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-8 border-t border-secondary mt-auto space-y-3" dir="rtl">
          {user ? (
            <>
              <Link href="/settings" onClick={() => playSound('click')} className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
                pathname === '/settings' ? "bg-accent text-white shadow-xl" : "text-muted-foreground hover:bg-secondary"
              )}>
                <Settings className="w-6 h-6" />
                <span className="font-black text-lg">الإعدادات</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-all w-full text-right"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-black text-lg">خروج</span>
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => playSound('click')} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary text-white shadow-xl">
              <LogIn className="w-6 h-6" />
              <span className="font-black text-lg">دخول</span>
            </Link>
          )}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border flex justify-around items-center h-24 px-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] rounded-t-[3rem]">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => playSound('click')}
            className={cn(
              "flex flex-col items-center justify-center transition-all flex-1 h-full",
              item.isCenter ? "relative -top-4" : "pt-2",
              pathname === item.href ? "text-primary" : "text-muted-foreground opacity-60"
            )}
          >
            <div className={cn(
              "transition-all",
              item.isCenter 
                ? "w-16 h-16 bg-primary text-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-card scale-110" 
                : "p-2 rounded-2xl",
              pathname === item.href && !item.isCenter ? "bg-primary/10" : ""
            )}>
              <item.icon className={cn(item.isCenter ? "w-8 h-8" : "w-7 h-7", pathname === item.href && "stroke-[2.5px]")} />
            </div>
            <span className={cn(
              "text-[10px] font-black mt-1",
              item.isCenter ? "mt-2 text-primary" : ""
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
