
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, User, BookMarked, Settings, LogOut, LogIn, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/' },
  { label: 'الحماسة', icon: Flame, href: '/streak' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'أنت', icon: User, href: '/profile' },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج", description: "نراك قريباً!" });
    router.replace('/login');
  };

  const playClickSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.play().catch(() => {});
  };

  return (
    <>
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-64 bg-card border-l border-border z-40 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-12" dir="rtl">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">🐱</div>
          <span className="text-3xl font-black text-primary tracking-tighter">كارينجو</span>
        </div>

        <nav className="flex-1 space-y-3" dir="rtl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={playClickSound}
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
              <Link href="/settings" onClick={playClickSound} className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
                pathname === '/settings' ? "bg-accent text-white shadow-xl" : "text-muted-foreground hover:bg-secondary"
              )}>
                <Settings className="w-6 h-6" />
                <span className="font-black text-lg">الإعدادات</span>
              </Link>
              <button 
                onClick={() => { playClickSound(); handleLogout(); }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-all w-full text-right"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-black text-lg">خروج</span>
              </button>
            </>
          ) : (
            <Link href="/login" onClick={playClickSound} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary text-white shadow-xl">
              <LogIn className="w-6 h-6" />
              <span className="font-black text-lg">دخول</span>
            </Link>
          )}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border flex justify-around items-center h-20 px-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={playClickSound}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all flex-1 py-2 h-full",
              pathname === item.href ? "text-primary scale-110" : "text-muted-foreground opacity-60"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all",
              pathname === item.href ? "bg-primary/10 shadow-sm" : "bg-transparent"
            )}>
              <item.icon className={cn("w-7 h-7", pathname === item.href && "stroke-[2.5px]")} />
            </div>
            <span className="text-[11px] font-black">{item.label}</span>
          </Link>
        ))}
        <Link
          href="/settings"
          onClick={playClickSound}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all flex-1 py-2 h-full",
            pathname === '/settings' ? "text-primary scale-110" : "text-muted-foreground opacity-60"
          )}
        >
          <div className={cn(
            "p-2 rounded-2xl transition-all",
            pathname === '/settings' ? "bg-primary/10 shadow-sm" : "bg-transparent"
          )}>
            <Settings className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-black">الإعدادات</span>
        </Link>
      </nav>
    </>
  );
}
