
"use client"

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp } from 'firebase/database';
import { Activity, HeartPulse, Crown, ShieldCheck, Sparkles, Flame } from 'lucide-react';
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
  const [showTour, setShowTour] = useState(false);
  const hasCheckedStatus = useRef(false);
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;

  useEffect(() => {
    if (userData && user && !hasCheckedStatus.current) {
      hasCheckedStatus.current = true; 
      
      const todayStr = new Date().toLocaleDateString('en-CA');
      const now = Date.now();
      const updates: any = {};
      let needsUpdate = false;

      if (userData.hasSeenTour !== true) {
        setShowTour(true);
      }

      if (!userData.notificationsEnabled && Notification.permission === 'default') {
        requestNotificationPermission(auth, database);
      }

      if (userData.isPremium === 1 && userData.premiumUntil && now > userData.premiumUntil) {
        updates.isPremium = 0;
        updates.premiumUntil = null;
        updates[`premiumRequest/status`] = 'expired';
        if (userData.avatar?.startsWith('data:') || userData.avatar?.startsWith('http')) {
          updates.avatar = "🐱";
        }
        needsUpdate = true;
        toast({ title: "انتهى اشتراك بريميوم", description: "شكراً لثقتك، تم تجديد اشتراكك عبر الإعدادات! 🐱" });
      }

      if (userData.showPremiumCelebration) {
        setShowCelebration(true);
        playSound('success');
        updates.showPremiumCelebration = false;
        needsUpdate = true;
      }

      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
      const lastActive = userData.lastActiveDate;
      const lastPenaltyDate = userData.lastStreakPenaltyDate;

      if (!isPremium) {
        if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr && lastPenaltyDate !== todayStr) {
          const penalty = 150;
          const currentPoints = userData.points || 0;
          updates.points = Math.max(0, currentPoints - penalty);
          updates.streak = 0;
          updates.lastStreakPenaltyDate = todayStr;
          needsUpdate = true;
          if (currentPoints > 0) {
            push(ref(database, `users/${user.uid}/notifications`), {
              type: 'system',
              title: 'تنبيه كسر الحماسة 🛑',
              message: `لقد تغيبت عن التطبيق! تم خصم ${penalty} نقطة.`,
              isRead: false,
              timestamp: serverTimestamp()
            });
            toast({ variant: "destructive", title: "كسر الحماسة!", description: `تم خصم ${penalty} نقطة لغيابك.` });
          }
        }
      } else {
        if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr) {
          const currentFreezes = userData.streakFreezes ?? 2;
          if (currentFreezes > 0) {
            updates.streakFreezes = currentFreezes - 1;
            updates.lastActiveDate = yesterdayStr; 
            needsUpdate = true;
            push(ref(database, `users/${user.uid}/notifications`), {
              type: 'bonus',
              title: 'تم استخدام تجميد الحماسة 🧊',
              message: 'لقد حافظت العضوية الملكية على سجل التزامك اليوم رغم غيابك!',
              isRead: false,
              timestamp: serverTimestamp()
            });
          } else if (userData.lastStreakPenaltyDate !== todayStr) {
            updates.streak = 0;
            updates.lastStreakPenaltyDate = todayStr;
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        update(ref(database, `users/${user.uid}`), updates).catch(e => console.error("Update failed", e));
      }
    }
  }, [userData, user, database, auth, isAdmin, isPremium]);

  const bmiInfo = useMemo(() => {
    if (!userData?.weight || !userData?.height) return { value: "--", status: "غير محدد", color: "text-muted-foreground" };
    const bmi = userData.weight / ((userData.height / 100) * (userData.height / 100));
    const val = bmi.toFixed(1);
    if (bmi < 18.5) return { value: val, status: "نحافة", color: "text-blue-500" };
    if (bmi < 25) return { value: val, status: "مثالي", color: "text-green-500" };
    if (bmi < 30) return { value: val, status: "زيادة", color: "text-orange-500" };
    return { value: val, status: "سمنة", color: "text-red-500" };
  }, [userData]);

  if (isUserLoading || (user && isDataLoading) || (!user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black text-xl animate-pulse">Careingo</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

        {isAdmin ? (
          <section className="bg-card rounded-[2rem] p-6 border border-border mx-2 shadow-lg space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center text-4xl shadow-md border-2 border-white">🛡️</div>
              <div>
                <h1 className="text-2xl font-black text-primary leading-tight">لوحة الإدارة العليا</h1>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wide">أهلاً بك يا مدير النظام ✨</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/requests" onClick={() => playSound('click')} className="block">
                <Button className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-sm font-black gap-3 shadow-lg">
                  <Sparkles size={18} /> مراجعة طلبات الاشتراك
                </Button>
              </Link>
              <Link href="/admin" onClick={() => playSound('click')} className="block">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-primary text-primary text-sm font-black gap-3">
                  <ShieldCheck size={18} /> دخول لوحة التحكم
                </Button>
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mx-2">
              <Link href="/streak" className="block">
                <Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <Flame size={20} fill="currentColor" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">سجل الحماسة</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-orange-600">{userData?.streak || 0}ي</span>
                      <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, ((userData?.streak || 0) / 30) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/profile" className="block">
                <Card className="p-4 rounded-[1.5rem] shadow-md border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                    <HeartPulse size={20} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">مؤشر الكتلة</p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-black", bmiInfo.color)}>{bmiInfo.value}</span>
                      <span className={cn("text-[8px] font-black uppercase opacity-60", bmiInfo.color)}>{bmiInfo.status}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            <section className="bg-primary/5 rounded-[2rem] p-5 border border-primary/10 mx-2 shadow-inner">
              <Mascot />
            </section>

            <section className="space-y-4 mx-2">
              <h2 className="text-xl font-black text-primary px-2 text-right">مسارات النمو</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TrackCard type="Fitness" currentStage={userData?.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
                <TrackCard type="Nutrition" currentStage={userData?.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
                <TrackCard type="Behavior" currentStage={userData?.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
                <TrackCard type="Study" currentStage={userData?.trackProgress?.Study?.currentStage || 1} totalStages={30} />
              </div>
              
              <Link href="/track/master" onClick={() => playSound('click')} className="block mt-4">
                <Card className="p-5 rounded-[2rem] shadow-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform border-dashed">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary leading-tight">المسار العام</p>
                    <p className="text-[10px] font-bold text-primary/60">تحديات الأساطير والتدريب الحر 🔥</p>
                  </div>
                </Card>
              </Link>
            </section>
          </>
        )}

        <div className="mx-2">
          <AdBanner label="إعلان ممول" />
        </div>

        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="rounded-[3rem] p-10 text-center max-w-sm">
            <DialogHeader>
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Crown size={48} fill="currentColor" />
              </div>
              <DialogTitle className="text-3xl font-black text-primary">تهانينا يا بطل! 👑</DialogTitle>
              <DialogDescription className="text-lg font-bold text-muted-foreground mt-4 leading-relaxed">
                لقد تمت ترقية حسابك لعضوية **بريميوم الملكية**. استمتع الآن بكل الميزات بلا حدود!
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowCelebration(false)} className="w-full h-14 rounded-2xl bg-accent text-xl font-black shadow-lg mt-6">هيا لننطلق! 🚀</Button>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
