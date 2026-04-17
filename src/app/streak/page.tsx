
"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, CheckCircle2, TrendingUp, Crown, Share2, Snowflake, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StreakPage() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [todayStr, setTodayStr] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isUserDataLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  const stats = useMemo(() => {
    if (!allUsersData || !user || !userData) return { rank: 0, total: 0 };
    const usersArray = Object.values(allUsersData)
      .filter((u: any) => u.name !== 'admin')
      .sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
    const rank = usersArray.findIndex((u: any) => u.id === user.uid) + 1;
    return { rank: rank > 0 ? rank : 1, total: usersArray.length };
  }, [allUsersData, user, userData]);

  const getRankName = (points: number = 0) => {
    if (userData?.name === 'admin') return "مدير النظام الرسمي 🛡️";
    if (points >= 10000) return "الأسطورة 👑";
    if (points >= 5000) return "نخبة كاري 🏅";
    if (points >= 2000) return "بطل صاعد 🔥";
    if (points >= 500) return "مكافح مجتهد 🐱";
    return "مكتشف جديد 🌱";
  };

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';

  const generateCardAndShare = async () => {
    if (!user || !userData) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyShareCount = userData.monthlyShareCount?.[currentMonth] || 0;

    if (!isPremium && monthlyShareCount >= 2) {
      toast({ 
        variant: "destructive", title: "وصلت للحد الشهري 🛑", 
        description: "اشترك في بريميوم لمشاركة غير محدودة دائماً!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    setIsGenerating(true);
    playSound('click');

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#4F46E5'; ctx.fillRect(0, 0, 400, 600);
      ctx.fillStyle = 'white'; ctx.textAlign = 'center';
      ctx.font = 'bold 30px Arial'; ctx.fillText(String(userData?.name || 'Hero'), 200, 200);
      ctx.font = 'bold 20px Arial'; ctx.fillText(`الحماسة: ${userData?.streak || 0} يوم`, 200, 300);
      ctx.font = 'bold 20px Arial'; ctx.fillText(`الترتيب: #${stats.rank}`, 200, 400);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'streak.png', { type: 'image/png' });
        if (navigator.share) await navigator.share({ files: [file], title: 'إنجازي في كاري! 🔥' });
        else { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'streak.png'; a.click(); }
        await update(ref(database, `users/${user.uid}/monthlyShareCount`), { [currentMonth]: monthlyShareCount + 1 });
        setIsGenerating(false);
      });
    } catch (e) { setIsGenerating(false); }
  };

  if (isUserLoading || isUserDataLoading || !todayStr) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <canvas ref={canvasRef} width="400" height="600" className="hidden" />
        <header className="bg-gradient-to-br from-primary to-accent p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden mx-2">
          <div className="flex items-center justify-between relative z-10">
            <div className="text-right">
              <h1 className="text-3xl font-black">سجل الحماسة</h1>
              <p className="text-xs font-bold opacity-80">كارينجو | تواصل، تحدى، تطور</p>
            </div>
            <div className="bg-white/20 px-5 py-3 rounded-2xl text-center border border-white/20">
              <p className="text-2xl font-black">{userData?.streak || 0}</p>
              <p className="text-[10px] font-black opacity-70">يوم متصل</p>
            </div>
          </div>
        </header>

        <div className="px-2">
          <Card className={cn("rounded-[2rem] border-none shadow-xl p-6 relative overflow-hidden", isPremium ? "bg-blue-600 text-white" : "bg-slate-100 border-dashed border-2 border-slate-300")}>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-right">
                <h3 className="font-black text-sm flex items-center gap-2 justify-end">تجميد الحماسة 🧊 <Snowflake size={18} /></h3>
                <p className={cn("text-[10px] font-bold mt-1", isPremium ? "text-blue-100" : "text-slate-500")}>
                  {isPremium ? `رصيدك: ${userData?.streakFreezes || 2} شهرياً.` : "اشترك في بريميوم لتحصل على تجميد حماسة شهري."}
                </p>
              </div>
              {!isPremium && <Link href="/settings"><Button size="sm" className="bg-primary text-[10px] h-8 rounded-xl font-black">اشترك الآن</Button></Link>}
            </div>
          </Card>
        </div>

        <div className="px-2">
          <Card className={cn("rounded-[2.5rem] border-4 p-8 shadow-2xl relative overflow-hidden", isPremium ? "border-yellow-400 bg-white" : "border-primary/20 bg-secondary/10")}>
            <div className="text-center space-y-4 relative z-10">
              {isPremium ? <Crown className="w-12 h-12 text-yellow-500 mx-auto" /> : <Sparkles className="w-12 h-12 text-primary mx-auto opacity-40" />}
              <h3 className="text-2xl font-black text-primary">بطاقة التميز {isPremium && "الملكية"}</h3>
              <p className="text-sm font-black text-muted-foreground italic">{getRankName(userData?.points)}</p>
              <Button onClick={generateCardAndShare} disabled={isGenerating} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Share2 size={20} />}
                مشاركة إنجازي
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
