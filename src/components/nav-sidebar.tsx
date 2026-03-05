
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, User, BookMarked, Settings, LogOut, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/' },
  { label: 'المتصدرون', icon: Trophy, href: '/leaderboard' },
  { label: 'الموارد', icon: BookMarked, href: '/resources' },
  { label: 'الملف الشخصي', icon: User, href: '/profile' },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج", description: "نراك قريباً!" });
    router.push('/login');
  };

  return (
    <>
      {/* القائمة الجانبية لسطح المكتب (على اليمين في RTL) */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-64 bg-white border-l border-border z-40 p-6 shadow-2xl shadow-primary/5">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20">C</div>
          <span className="text-3xl font-black text-primary tracking-tighter">Careingo</span>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                pathname === item.href 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", pathname === item.href ? "text-white" : "group-hover:scale-110 transition-transform")} />
              <span className="font-black text-lg">{item.label}</span>
              {pathname === item.href && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-8 border-t border-secondary mt-auto space-y-3">
          {user ? (
            <>
              <Link href="/settings" className={cn(
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
                <span className="font-black text-lg">تسجيل الخروج</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary text-white shadow-xl">
              <LogIn className="w-6 h-6" />
              <span className="font-black text-lg">تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </aside>

      {/* شريط التنقل السفلي للجوال (ستايل PWA الأصلي) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/20 flex justify-around items-center h-24 px-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all w-full py-2",
              pathname === item.href ? "text-primary scale-110" : "text-muted-foreground opacity-60"
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl transition-all",
              pathname === item.href ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent"
            )}>
              <item.icon className={cn("w-7 h-7", pathname === item.href && "stroke-[2.5px]")} />
            </div>
            <span className="text-[10px] font-black">{item.label}</span>
          </Link>
        ))}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all w-full py-2",
            pathname === '/settings' ? "text-primary scale-110" : "text-muted-foreground opacity-60"
          )}
        >
          <div className={cn(
            "p-3 rounded-2xl transition-all",
            pathname === '/settings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent"
          )}>
            <Settings className={cn("w-7 h-7", pathname === '/settings' && "stroke-[2.5px]")} />
          </div>
          <span className="text-[10px] font-black">الإعدادات</span>
        </Link>
      </nav>
    </>
  );
}
