
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, User, BookMarked, Settings, LogOut, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Resources', icon: BookMarked, href: '/resources' },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "Logged out", description: "See you soon!" });
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-border z-40 p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">C</div>
          <span className="text-2xl font-black text-primary tracking-tight">Careingo</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-white" : "group-hover:scale-110 transition-transform")} />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-border mt-auto space-y-2">
          {user ? (
            <>
              <Link href="/settings" className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                pathname === '/settings' ? "bg-accent text-white shadow-lg" : "text-muted-foreground hover:bg-secondary"
              )}>
                <Settings className="w-5 h-5" />
                <span className="font-bold">Settings</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold">Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg">
              <LogIn className="w-5 h-5" />
              <span className="font-bold">Log In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around p-3 z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === item.href ? "text-primary scale-110" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            pathname === '/settings' ? "text-primary scale-110" : "text-muted-foreground"
          )}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Settings</span>
        </Link>
      </nav>
    </>
  );
}
