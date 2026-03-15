
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
    setTodayStr(new Date().toLocaleDateString('en-CA'));
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
  const streakFreezes = userData?.streakFreezes ?? 2;

  const generateCardAndShare = async () => {
    if (!user || !userData) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyShareCount = userData.monthlyShareCount?.[currentMonth] || 0;

    if (!isPremium && monthlyShareCount >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد الشهري 🛑", 
        description: "اشترك في بريميوم لمشاركة غير محدودة والحفاظ على حماستك دائماً!",
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

      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, '#4F46E5'); gradient.addColorStop(1, '#9333EA'); 
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 400, 600);

      ctx.save();
      ctx.beginPath(); ctx.arc(200, 120, 60, 0, Math.PI * 2); ctx.clip();
      const avatar = String(userData?.avatar || "🐱");
      if (avatar.startsWith('data:image') || avatar.startsWith('http')) {
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = avatar;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        ctx.drawImage(img, 140, 60, 120, 120);
      } else {
        ctx.fillStyle = 'white'; ctx.fillRect(140,60,120,120);
        ctx.font = '60px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(avatar, 200, 120);
      }
      ctx.restore();

      ctx.fillStyle = 'white'; ctx.textAlign = 'center';
      ctx.font = 'bold 28px Arial'; ctx.fillText(String(userData?.name || 'Hero'), 200, 220);
      ctx.font = 'bold 16px Arial'; ctx.fillText(`الرتبة: ${getRankName(userData.points)}`, 200, 255);

      const drawBox = (y: number, l: string, v: string, i: string) => {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(40, y, 320, 75);
        ctx.fillStyle = 'white'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right'; ctx.fillText(l, 340, y + 30);
        ctx.font = 'bold 24px Arial'; ctx.fillText(v, 340, y + 60);
        ctx.font = '30px Arial'; ctx.textAlign = 'left'; ctx.fillText(i, 60, y + 50);
      };
      drawBox(290, 'الحماسة الحالية', `${userData?.streak || 0} يوم`, '🔥');
      drawBox(380, 'إجمالي النقاط', `${(userData?.points || 0).toLocaleString()}ن`, '⭐');
      drawBox(470, 'الترتيب العالمي', `#${stats.rank}`, '🏆');

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'careingo-streak.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'إنجازي في كاري! 🔥' });
          await update(ref(database, `users/${user.uid}/monthlyShareCount`), { [currentMonth]: monthlyShareCount + 1 });
        } else {
          const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'careingo-streak.png'; a.click();
        }
        setIsGenerating(false);
      }, 'image/png');
    } catch (e) { setIsGenerating(false); }
  };

  const currentWeek = useMemo(() => {
    const week = [];
    const labels = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const base = new Date(); const day = base.getDay();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base); d.setDate(d.getDate() - (day - i));
      const dStr = d.toLocaleDateString('en-CA');
      week.push({ label: labels[i], isCompleted: !!(userData?.dailyPoints?.[dStr]), isToday: dStr === todayStr });
    }
    return week;
  }, [userData, todayStr]);

  if (isUserLoading || isUserDataLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <canvas ref={canvasRef} width="400" height="600" className="hidden" />
        <header className="bg-gradient-to-br from-primary to-accent p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden mx-2">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <div className="flex items-center justify-between relative z-10">
            <div className="text-right">
              <h1 className="text-3xl font-black">سجل الحماسة</h1>
              <p className="text-xs font-bold opacity-80">كارينجو | تواصل، تحدى، تطور</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/20">
              <p className="text-2xl font-black">{userData?.streak || 0}</p>
              <p className="text-[10px] font-black opacity-70">يوم متصل</p>
            </div>
          </div>
        </header>

        <div className="px-2">
          <Card className={cn("rounded-[2rem] border-none shadow-xl p-6 relative overflow-hidden", isPremium ? "bg-blue-600 text-white" : "bg-slate-100 border border-dashed border-slate-300")}>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-right">
                <h3 className="font-black text-sm flex items-center gap-2 justify-end">تجميد الحماسة 🧊 <Snowflake size={18} /></h3>
                <p className={cn("text-[10px] font-bold mt-1", isPremium ? "text-blue-100" : "text-slate-500")}>
                  {isPremium ? `رصيدك: ${streakFreezes} من أصل 2 تجميدات شهرياً.` : "اشترك في بريميوم لتحصل على 2 تجميد حماسة كل شهر."}
                </p>
              </div>
              {!isPremium && <Link href="/settings"><Button size="sm" className="bg-primary text-[10px] h-8 rounded-xl font-black">اشترك الآن</Button></Link>}
            </div>
          </Card>
        </div>

        <div className="px-2">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-card p-6">
            <h3 className="text-lg font-black text-primary mb-6 text-right flex items-center justify-end gap-2">زخم الأسبوع <Flame size={20} className="text-orange-500" /></h3>
            <div className="flex justify-between items-center gap-2">
              {currentWeek.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 text-center">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2", day.isCompleted ? "bg-orange-500 border-orange-400 text-white shadow-lg" : day.isToday ? "bg-secondary border-primary/30 text-primary" : "bg-secondary border-transparent text-muted-foreground/30")}>
                    {day.isCompleted ? <Flame size={14} fill="currentColor" /> : <span className="text-[10px] font-black">{day.label[0]}</span>}
                  </div>
                  <span className={cn("text-[8px] font-black", day.isToday ? "text-primary" : "text-muted-foreground opacity-60")}>{day.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="px-2">
          <Card className={cn("rounded-[2.5rem] border-4 p-8 shadow-2xl relative overflow-hidden group", isPremium ? "border-yellow-400 bg-white" : "border-primary/20 bg-secondary/10")}>
            <div className="text-center space-y-4 relative z-10">
              {isPremium ? <Crown className="w-12 h-12 text-yellow-500 mx-auto" /> : <Sparkles className="w-12 h-12 text-primary mx-auto opacity-40" />}
              <h3 className="text-2xl font-black text-primary">بطاقة التميز {isPremium && "الملكية"}</h3>
              <p className="text-sm font-black text-muted-foreground italic">{getRankName(userData?.points)}</p>
              <Button onClick={generateCardAndShare} disabled={isGenerating} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Share2 size={20} />}
                مشاركة إنجازي
              </Button>
              {!isPremium && <p className="text-[10px] font-bold text-muted-foreground">متبقي لك هذا الشهر: <span className="text-primary">{Math.max(0, 2 - (userData?.monthlyShareCount?.[new Date().toISOString().slice(0, 7)] || 0))} مشاركة</span></p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
