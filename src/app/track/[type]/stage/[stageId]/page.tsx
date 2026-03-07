
"use client"

import React, { use, useState, useEffect, useCallback, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, Zap, Trophy, Timer, Play } from 'lucide-react';
import Link from 'next/link';
import { Mascot } from '@/components/mascot';
import { toast } from '@/hooks/use-toast';
import { STATIC_CHALLENGES, TrackKey } from '@/lib/challenges';
import { useFirebase, useUser, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, get, push, serverTimestamp } from 'firebase/database';
import { playSound } from '@/lib/sounds';
import { useRouter } from 'next/navigation';

export default function StageDetailPage({ params }: { params: Promise<{ type: string, stageId: string }> }) {
  const resolvedParams = use(params);
  const trackKey = resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1) as TrackKey;
  const stageId = parseInt(resolvedParams.stageId);
  const router = useRouter();
  
  const { database } = useFirebase();
  const { user } = useUser();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [onCooldown, setOnCooldown] = useState(false);
  const [bonusValue, setBonusValue] = useState(0);

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const challenge = STATIC_CHALLENGES[trackKey][stageId - 1];

  const progressRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/trackProgress/${trackKey}`) : null, [user, database, trackKey]);
  const { data: progressData } = useDatabase(progressRef);

  const calculateBonus = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 5) return 75;
    if (hour >= 20) return 0;
    return Math.max(0, (20 - hour) * 5); 
  }, []);

  useEffect(() => {
    setBonusValue(calculateBonus());
  }, [calculateBonus]);

  useEffect(() => {
    if (progressData) {
      const isDone = progressData.completedStages?.includes(stageId);
      setCompleted(!!isDone);
      
      const todayStr = new Date().toLocaleDateString('en-CA');
      const hasCompletedTodayInThisTrack = progressData.lastCompletedDate === todayStr;
      
      if (hasCompletedTodayInThisTrack && !isDone && stageId > 1) {
        setOnCooldown(true);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [progressData, stageId]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const startChallenge = () => {
    playSound('click');
    setTimerActive(true);
    setTimeLeft((challenge?.time || 5) * 60);
    toast({ title: "بدأ التحدي!" });
  };

  const cancelChallenge = () => {
    playSound('click');
    setTimerActive(false);
    setTimeLeft(0);
  };

  const handleComplete = useCallback(async () => {
    if (!user || !database || isUpdating || completed || onCooldown) return;
    setIsUpdating(true);
    playSound('click');
    
    try {
      const currentProgress = progressData || { currentStage: 1, completedStages: [] };
      const completedStages = [...(currentProgress.completedStages || [])];
      const todayStr = new Date().toLocaleDateString('en-CA');
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
      
      const pointsEarned = 100 + calculateBonus();
      
      if (!completedStages.includes(stageId)) {
        completedStages.push(stageId);
      }

      // منطق التقدم: لا ترفع المرحلة الحالية إلا إذا أكملت المرحلة المطلوبة فعلياً
      let nextStage = currentProgress.currentStage;
      if (stageId === currentProgress.currentStage) {
        nextStage = stageId + 1;
      }

      const userRef = ref(database, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();

      let newStreak = userData.streak || 0;
      if (!userData.lastActiveDate) newStreak = 1;
      else if (userData.lastActiveDate !== todayStr) {
        newStreak = userData.lastActiveDate === yesterdayStr ? newStreak + 1 : 1;
      }

      await update(userRef, {
        points: (userData.points || 0) + pointsEarned,
        streak: newStreak,
        lastActiveDate: todayStr,
        [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + pointsEarned,
        [`trackProgress/${trackKey}`]: {
          completedStages,
          currentStage: nextStage,
          lastCompletedDate: todayStr
        }
      });

      const notifRef = ref(database, `users/${user.uid}/notifications`);
      push(notifRef, {
        type: 'achievement',
        title: 'إنجاز جديد مذهل! 🏆',
        message: `لقد أكملت اليوم ${stageId} في مسار ${trackKey === 'Fitness' ? 'اللياقة' : trackKey === 'Nutrition' ? 'التغذية' : trackKey === 'Behavior' ? 'السلوك' : 'الدراسة'}. استمر يا بطل!`,
        isRead: false,
        timestamp: serverTimestamp()
      });

      setCompleted(true);
      setTimerActive(false);
      playSound('success');
      toast({ title: "تم الإنجاز! 🎉", description: `حصلت على ${pointsEarned} نقطة.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsUpdating(false);
    }
  }, [user, database, isUpdating, completed, progressData, trackKey, stageId, onCooldown, calculateBonus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (onCooldown) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <div className="max-w-xs space-y-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-float">
            <Timer size={36} />
          </div>
          <h1 className="text-xl font-black text-primary">وقت الاستراحة!</h1>
          <p className="text-sm font-bold text-muted-foreground">أكملت مرحلة في هذا المسار اليوم. نراك غداً لفتح التحدي القادم!</p>
          <Button onClick={() => router.back()} size="lg" className="w-full rounded-xl font-black">العودة للمسار</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-24" dir="rtl">
      <NavSidebar />
      <div className="app-container py-4 space-y-4">
        <div className="flex justify-end">
          <Link href={`/track/${resolvedParams.type}`} onClick={() => playSound('click')}>
            <Button variant="ghost" size="sm" className="rounded-full gap-1 text-primary font-bold">
              رجوع للمسار
              <ArrowLeft size={14} />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <header className="text-right space-y-1">
              <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[8px] font-black inline-block uppercase">المستوى {stageId}</div>
              <h1 className="text-xl font-black text-primary leading-tight">{challenge.title}</h1>
            </header>

            <Card className="rounded-[1.5rem] overflow-hidden bg-card border border-border text-right shadow-lg">
              <CardHeader className="bg-primary text-white p-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <CardTitle className="text-sm font-bold">مهمة اليوم</CardTitle>
                  <div className="flex gap-2 text-[10px] font-black opacity-90">
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full"><Clock size={10} /> {challenge.time}د</span>
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full"><Zap size={10} /> {challenge.difficulty}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="text-sm leading-relaxed text-muted-foreground font-bold whitespace-pre-wrap">
                  {challenge.description}
                </div>
                
                {!completed ? (
                  <div className="space-y-4">
                    {!timerActive ? (
                      <Button onClick={startChallenge} className="w-full h-14 rounded-xl bg-primary text-base font-black shadow-lg">
                        ابدأ التحدي 🐱
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center">
                          <p className="text-[10px] font-black text-primary uppercase">الوقت المتبقي</p>
                          <p className="text-4xl font-black text-primary font-mono">{formatTime(timeLeft)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={handleComplete} disabled={isUpdating} className="h-12 rounded-xl bg-accent text-xs font-black shadow-lg">
                            أنهيت المهمة 🔥
                          </Button>
                          <Button onClick={cancelChallenge} variant="outline" className="h-12 rounded-xl border-destructive text-destructive text-xs font-black">
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md">
                      <CheckCircle size={28} />
                    </div>
                    <h3 className="text-lg font-black text-green-700">مذهل يا بطل!</h3>
                    <p className="text-green-600 font-bold text-xs">حافظ على اشتعال الشعلة غداً.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] bg-card p-4 border border-border shadow-md">
              <h3 className="text-xs font-black text-primary flex items-center justify-end gap-2 mb-3">
                مكافأة الإنجاز اليومي
                <Trophy size={14} className="text-yellow-500" />
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/30 p-2 rounded-xl text-center">
                  <span className="font-black text-primary text-base">100</span>
                  <p className="text-[8px] font-bold text-muted-foreground">نقطة أساسية</p>
                </div>
                <div className="bg-accent/10 p-2 rounded-xl text-center border border-accent/10">
                  <span className="font-black text-accent text-base">+{bonusValue}</span>
                  <p className="text-[8px] font-bold text-accent">بونص تبكير</p>
                </div>
              </div>
            </Card>
            <Mascot messageOnly />
          </div>
        )}
      </div>
    </div>
  );
}
