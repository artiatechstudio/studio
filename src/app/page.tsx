
"use client"

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { HeartPulse, Crown, ShieldCheck, Sparkles, Flame, Trophy, Share2, Loader2, XCircle, Swords, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdBanner } from '@/components/ad-banner';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { requestNotificationPermission } from '@/lib/fcm-setup';
import { OnboardingTour } from '@/components/onboarding-tour';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasCheckedStatus = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  const challengesRef = useMemoFirebase(() => ref(database, 'challenges'), [database]);
  const { data: allChallengesData } = useDatabase(challengesRef);

  const activeDuels = useMemo(() => {
    if (!allChallengesData || !user) return [];
    return Object.entries(allChallengesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((c: any) => (c.senderId === user.uid || c.receiverId === user.uid));
  }, [allChallengesData, user]);

  const allUsersRef = useMemoFirebase(() => userData?.name === 'admin' ? ref(database, 'users') : null, [database, userData]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  const pendingRequestsCount = useMemo(() => {
    if (!allUsersData || userData?.name !== 'admin') return 0;
    return Object.values(allUsersData).filter((u: any) => u.premiumRequest?.status === 'pending').length;
  }, [allUsersData, userData]);

  useEffect(() => {
    if (!isUserLoading && !user) router.replace('/login');
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userData && user && !hasCheckedStatus.current) {
      hasCheckedStatus.current = true; 
      const now = Date.now();
      const updates: any = {};
      let needsUpdate = false;

      if (userData.hasSeenTour !== true) setShowTour(true);
      if (userData.showChallengeResult) { setShowResultDialog(true); playSound('success'); updates.showChallengeResult = false; needsUpdate = true; }
      if (!userData.notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') requestNotificationPermission(auth, database);
      if (userData.isPremium === 1 && userData.premiumUntil && now > userData.premiumUntil) { updates.isPremium = 0; updates.premiumUntil = null; updates[`premiumRequest/status`] = 'expired'; needsUpdate = true; toast({ title: "انتهى اشتراك بريميوم" }); }
      if (userData.showPremiumCelebration) { setShowCelebration(true); playSound('success'); updates.showPremiumCelebration = false; needsUpdate = true; }

      if (needsUpdate) update(ref(database, `users/${user.uid}`), updates);
    }
  }, [userData, user, database, auth]);

  const res = userData?.latestChallengeResult;

  const handleShareResult = async () => {
    if (!res) return;
    setIsGenerating(true);
    playSound('click');
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const isWin = res.status === 'win', isTie = res.status === 'tie';
      const grad = ctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, isWin ? '#10B981' : isTie ? '#4F46E5' : '#EF4444'); grad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 400, 600);
      ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '900 40px Cairo'; ctx.fillText('كارينجو | CAREINGO', 200, 100);
      ctx.font = '700 30px Cairo'; ctx.fillText(isWin ? 'انتصار بطل! 🏆' : isTie ? 'تعادل عادل! ⚖️' : 'كبوة محارب! ⚔️', 200, 180);
      ctx.font = '400 20px Cairo'; ctx.fillText(`تحدي: ${res.title}`, 200, 240);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(50, 280, 300, 150);
      ctx.fillStyle = 'white'; ctx.font = '700 24px Cairo'; ctx.fillText(isWin ? `+${res.stake || 0} نقطة` : isTie ? '0 نقطة' : `-${res.stake || 0} نقطة`, 200, 350);
      ctx.font = '700 16px Cairo'; ctx.fillText('تواصل، تحدى، تطور مع كارينجو', 200, 500);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'careingo-result.png', { type: 'image/png' });
        if (navigator.share) await navigator.share({ files: [file], title: 'نتيجتي في كارينجو 🐱', text: 'انضم لرحلة النمو! 🔥' });
        else { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'careingo-result.png'; a.click(); }
        setIsGenerating(false);
      });
    } catch (e) { setIsGenerating(false); }
  };

  const bmiInfo = useMemo(() => {
    if (!userData?.weight || !userData?.height) return { value: "--", status: "غير محدد", color: "text-muted-foreground" };
    const bmi = userData.weight / ((userData.height / 100) * (userData.height / 100));
    const val = bmi.toFixed(1);
    if (bmi < 18.5) return { value: val, status: "نحافة", color: "text-blue-500" };
    if (bmi < 25) return { value: val, status: "مثالي", color: "text-green-500" };
    if (bmi < 30) return { value: val, status: "زيادة", color: "text-orange-500" };
    return { value: val, status: "سمنة", color: "text-red-500" };
  }, [userData]);

  if (isUserLoading || (user && isDataLoading)) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
        <canvas ref={canvasRef} width="400" height="600" className="hidden" />

        {userData?.name === 'admin' ? (
          <section className="bg-card rounded-[2rem] p-6 border border-border mx-2 shadow-lg space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center text-4xl shadow-md border-2 border-white">🛡️</div>
              <div><h1 className="text-2xl font-black text-primary leading-tight">لوحة الإدارة العليا</h1><p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wide">أهلاً بك يا مدير النظام ✨</p></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/requests"><Button className="w-full h-14 rounded-2xl bg-accent text-sm font-black gap-3 shadow-lg relative">
                <Sparkles size={18} /> مراجعة الطلبات {pendingRequestsCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xl animate-bounce border-2 border-white">{pendingRequestsCount}</span>}
              </Button></Link>
              <Link href="/admin"><Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-primary text-primary text-sm font-black gap-3"><ShieldCheck size={18} /> دخول لوحة التحكم</Button></Link>
            </div>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mx-2">
              <Link href="/streak"><Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 shrink-0"><Flame size={20} fill="currentColor" /></div>
                <div className="overflow-hidden flex-1"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">سجل الحماسة</p><div className="flex items-center gap-2"><span className="text-lg font-black text-orange-600">{userData?.streak || 0}ي</span><div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden"><div className="bg-orange-50 h-full transition-all duration-1000" style={{ width: `${Math.min(100, ((userData?.streak || 0) / 30) * 100)}%` }} /></div></div></div>
              </Card></Link>
              <Link href="/profile"><Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0"><HeartPulse size={20} /></div>
                <div className="overflow-hidden flex-1"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">مؤشر الكتلة</p><div className="flex items-center gap-2"><span className={cn("text-lg font-black", bmiInfo.color)}>{bmiInfo.value}</span><span className={cn("text-[8px] font-black uppercase opacity-60", bmiInfo.color)}>{bmiInfo.status}</span></div></div>
              </Card></Link>
            </div>
            
            <section className="bg-primary/5 rounded-[2rem] p-5 border border-primary/10 mx-2 shadow-inner"><Mascot /></section>

            <section className="space-y-4 mx-2">
              <h2 className="text-xl font-black text-primary px-2 text-right flex items-center justify-end gap-2">المبارزات <Swords size={20} className="text-red-500" /></h2>
              {activeDuels.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {activeDuels.map((duel: any) => (
                    <Link key={duel.id} href="/track/master">
                      <Card className="p-4 rounded-[1.5rem] border-2 border-red-100 bg-red-50/30 flex items-center justify-between hover:scale-[1.01] transition-transform">
                        <div className="flex items-center gap-3">
                           <div className="px-2 py-1 bg-red-500 text-white rounded-lg text-[8px] font-black animate-pulse">جاري التحدي</div>
                           <ArrowLeft size={14} className="text-primary opacity-30" />
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary text-xs">{duel.title}</p>
                          <p className="text-[9px] font-bold text-muted-foreground">الرهان: {duel.pointsStake}ن • ضد: {duel.senderId === user?.uid ? duel.receiverName : duel.senderName}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : userData?.latestChallengeResult ? (
                <Card className={cn(
                  "p-5 rounded-[2rem] border-none shadow-md relative overflow-hidden",
                  userData.latestChallengeResult.status === 'win' ? "bg-green-50" : "bg-red-50"
                )}>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                       <Trophy className={userData.latestChallengeResult.status === 'win' ? "text-green-600" : "text-red-600"} size={20}/>
                       <span className={cn("text-[10px] font-black", userData.latestChallengeResult.status === 'win' ? "text-green-700" : "text-red-700")}>آخر نتيجة</span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-xs">{userData.latestChallengeResult.title}</p>
                      <p className={cn("font-bold text-[10px]", userData.latestChallengeResult.status === 'win' ? "text-green-600" : "text-red-600")}>
                        {userData.latestChallengeResult.status === 'win' ? 'انتصار مستحق! 🏆' : userData.latestChallengeResult.status === 'tie' ? 'تعادل عادل ⚖️' : 'هزيمة مشرفة ⚔️'}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 opacity-20 font-black text-sm border-2 border-dashed rounded-[2rem] mx-2">لا توجد مبارزات نشطة</div>
              )}
            </section>

            <section className="space-y-4 mx-2">
              <h2 className="text-xl font-black text-primary px-2 text-right">مسارات النمو</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TrackCard type="Fitness" currentStage={userData?.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
                <TrackCard type="Nutrition" currentStage={userData?.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
                <TrackCard type="Behavior" currentStage={userData?.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
                <TrackCard type="Study" currentStage={userData?.trackProgress?.Study?.currentStage || 1} totalStages={30} />
              </div>
              <Link href="/track/master" className="block mt-4"><Card className="p-5 rounded-[2rem] shadow-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform border-dashed">
                <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md"><Sparkles size={24} /></div>
                <div className="text-right"><p className="text-lg font-black text-primary leading-tight">الماستر</p><p className="text-[10px] font-bold text-primary/60">تحديات الأساطير والتدريب الحر 🔥</p></div>
              </Card></Link>
            </section>
          </>
        )}

        <div className="mx-2"><AdBanner label="إعلان ممول" /></div>

        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="rounded-[2.5rem] p-8 text-center max-w-sm" dir="rtl">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce", res?.status === 'win' ? "bg-green-100 text-green-600" : res?.status === 'tie' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600")}>
              {res?.status === 'win' ? <Trophy size={48} /> : res?.status === 'tie' ? <Swords size={48} /> : <XCircle size={48} />}
            </div>
            <DialogTitle className="text-2xl font-black text-primary">{res?.status === 'win' ? 'انتصرت في المبارزة! 🏆' : res?.status === 'tie' ? 'تعادل سيد الأحكام! ⚖️' : 'خسرت التحدي.. ⚔️'}</DialogTitle>
            <DialogDescription className="text-sm font-bold text-muted-foreground mt-2">تحدي: {res?.title || "..."}</DialogDescription>
            <div className="py-6 space-y-4">
              <div className="bg-secondary/30 p-4 rounded-2xl flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase">النقاط</span><span className={cn("text-lg font-black", res?.status === 'win' ? "text-green-600" : "text-red-600")}>{res?.status === 'win' ? `+${res?.stake || 0}` : res?.status === 'tie' ? '0' : `-${res?.stake || 0}`}ن</span></div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleShareResult} disabled={isGenerating} className="w-full h-12 rounded-xl bg-accent font-black gap-2">{isGenerating ? <Loader2 className="animate-spin" /> : <Share2 size={18} />} مشاركة النتيجة</Button>
              <Button onClick={() => setShowResultDialog(false)} variant="ghost" className="w-full h-12 font-black">إغلاق</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="rounded-[3rem] p-10 text-center max-w-sm">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><Crown size={48} fill="currentColor" /></div>
            <DialogTitle className="text-3xl font-black text-primary">تهانينا يا بطل! 👑</DialogTitle>
            <DialogDescription className="text-lg font-bold text-muted-foreground mt-4 leading-relaxed">ترقيت لعضوية **بريميوم الملكية**.</DialogDescription>
            <Button onClick={() => setShowCelebration(false)} className="w-full h-14 rounded-2xl bg-accent text-xl font-black shadow-lg mt-6">هيا لننطلق! 🚀</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
