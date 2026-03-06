
"use client"

import React, { use, useState, useEffect, useCallback, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, Zap, Trophy, Timer, AlertTriangle, Play, XCircle, FastForward } from 'lucide-react';
import Link from 'next/link';
import { Mascot } from '@/components/mascot';
import { toast } from '@/hooks/use-toast';
import { STATIC_CHALLENGES, TrackKey } from '@/lib/challenges';
import { useFirebase, useUser, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, get } from 'firebase/database';
import { playSound } from '@/lib/sounds';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

  // Timer states
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const challenge = STATIC_CHALLENGES[trackKey][stageId - 1];

  const progressRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/trackProgress/${trackKey}`) : null, [user, database, trackKey]);
  const { data: progressData } = useDatabase(progressRef);

  useEffect(() => {
    if (progressData) {
      const isDone = progressData.completedStages?.includes(stageId);
      setCompleted(!!isDone);
      
      const todayStr = new Date().toLocaleDateString('en-CA');
      const hasCompletedToday = progressData.lastCompletedDate === todayStr;
      
      if (hasCompletedToday && !isDone && stageId > 1) {
        setOnCooldown(true);
      }
      
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [progressData, stageId]);

  // Handle countdown
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const startChallenge = () => {
    playSound('click');
    setTimerActive(true);
    setTimeLeft((challenge?.time || 5) * 60);
    toast({ title: "بدأ التحدي!", description: "ركز الآن على تنفيذ المهمة المطلوبة." });
  };

  const cancelChallenge = () => {
    playSound('click');
    setTimerActive(false);
    setTimeLeft(0);
    toast({ variant: "destructive", title: "تم إلغاء المهمة", description: "لا بأس، يمكنك المحاولة مرة أخرى لاحقاً." });
  };

  const calculateBonus = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 5) return 75;
    if (hour >= 20) return 0;
    return Math.max(0, (20 - hour) * 5); 
  };

  const handleComplete = useCallback(async () => {
    if (!user || !database || isUpdating || completed || onCooldown) return;

    setIsUpdating(true);
    playSound('click');
    
    try {
      const currentProgress = progressData || { currentStage: 1, completedStages: [] };
      const completedStages = [...(currentProgress.completedStages || [])];
      
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA');
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
      
      const basePoints = 100;
      const bonus = calculateBonus();
      const pointsEarned = basePoints + bonus;

      completedStages.push(stageId);
      const nextStage = Math.max(currentProgress.currentStage, stageId + 1);

      const userRef = ref(database, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();

      let newStreak = userData.streak || 0;
      const lastActiveDate = userData.lastActiveDate;

      if (!lastActiveDate) {
        newStreak = 1;
      } else if (lastActiveDate !== todayStr) {
        if (lastActiveDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      const currentDailyPoints = userData.dailyPoints || {};
      const todayPoints = (currentDailyPoints[todayStr] || 0) + pointsEarned;

      await update(userRef, {
        points: (userData.points || 0) + pointsEarned,
        streak: newStreak,
        lastActiveDate: todayStr,
        [`dailyPoints/${todayStr}`]: todayPoints,
        [`trackProgress/${trackKey}`]: {
          completedStages,
          currentStage: nextStage,
          lastCompletedDate: todayStr
        }
      });

      setCompleted(true);
      setTimerActive(false);
      playSound('success');
      toast({
        title: "تم الإنجاز! 🎉",
        description: `أحسنت! حصلت على ${pointsEarned} نقطة وحافظت على نموك.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ التقدم." });
    } finally {
      setIsUpdating(false);
    }
  }, [user, database, isUpdating, completed, progressData, trackKey, stageId, onCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (onCooldown) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="max-w-md space-y-8">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl animate-float">
            <Timer size={56} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-primary italic">حان وقت الراحة!</h1>
            <p className="text-xl font-bold text-muted-foreground leading-relaxed">لقد أكملت مرحلة في هذا المسار اليوم. لضمان نمو عاداتك بشكل صحي، نفتح لك المرحلة التالية غداً عند منتصف الليل.</p>
          </div>
          <div className="bg-secondary/20 p-6 rounded-[2.5rem] border border-border">
            <Mascot customMessage="النمو الحقيقي ليس بالسرعة، بل بالاستمرار اليومي. أراك غداً! 🐱🌙" />
          </div>
          <Button onClick={() => router.back()} className="w-full h-16 rounded-2xl bg-primary text-xl font-black shadow-xl">العودة للخلف</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 pb-32">
        <div className="flex justify-end">
          <Link href={`/track/${resolvedParams.type}`} onClick={() => playSound('click')}>
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              العودة للمسار
              <ArrowLeft size={18} className="rotate-0" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-6">
             <div className="text-9xl animate-bounce">🐱</div>
             <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-[1.5rem] animate-spin" />
             <p className="text-primary font-black text-2xl animate-pulse">كاري يفتح لك المهمة...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
              <header className="text-right">
                <div className="flex items-center justify-end gap-3 mb-4">
                  <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase border border-primary/20">{trackKey === 'Fitness' ? 'اللياقة' : trackKey === 'Nutrition' ? 'التغذية' : trackKey === 'Behavior' ? 'السلوك' : 'الدراسة'}</div>
                  <div className="px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-black uppercase border border-accent/20">اليوم {stageId}</div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">{challenge.title}</h1>
              </header>

              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card border border-border text-right group">
                <CardHeader className="bg-primary text-white p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
                  <div className="flex items-center justify-between flex-row-reverse relative z-10">
                    <CardTitle className="text-2xl font-bold">مهمة اليوم</CardTitle>
                    <div className="flex gap-4 text-sm font-black opacity-90">
                      <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><Clock size={16} /> {challenge.time}د</div>
                      <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><Zap size={16} /> {challenge.difficulty}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="text-xl leading-relaxed text-muted-foreground whitespace-pre-wrap font-medium">
                    {challenge.description}
                  </div>
                  
                  {!completed ? (
                    <div className="space-y-6">
                      {!timerActive ? (
                        <Button 
                          onClick={startChallenge}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-xl transition-all hover:scale-[1.02]"
                        >
                          <Play className="ml-2" /> ابدأ التحدي الآن 🐱
                        </Button>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/20 text-center space-y-4">
                            <p className="text-sm font-black text-primary uppercase tracking-widest">الوقت المتبقي</p>
                            <p className="text-6xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button 
                              onClick={handleComplete}
                              disabled={isUpdating}
                              className="h-16 rounded-2xl bg-accent hover:bg-accent/90 text-lg font-black shadow-xl"
                            >
                              <FastForward className="ml-2" /> أنهيت مبكراً 🔥
                            </Button>
                            <Button 
                              onClick={cancelChallenge}
                              variant="outline"
                              className="h-16 rounded-2xl border-2 border-destructive text-destructive hover:bg-destructive/5 font-black text-lg"
                            >
                              <XCircle className="ml-2" /> لم أنهِ المهمة
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-500/5 border-4 border-green-500/20 p-12 rounded-[3rem] flex flex-col items-center gap-6 text-center shadow-inner">
                      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl animate-float">
                        <CheckCircle size={56} />
                      </div>
                      <div>
                        <h3 className="text-4xl font-black text-green-700 dark:text-green-400 italic">مذهل يا بطل!</h3>
                        <p className="text-green-600 dark:text-green-300 font-bold text-lg mt-2">لقد أكملت مهمتك بنجاح وحافظت على حماسك.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="sticky top-12 space-y-6">
                <Mascot messageOnly />
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card border border-border text-right hover:shadow-primary/10 transition-shadow">
                  <div className="p-8 space-y-6">
                    <h3 className="text-xl font-black text-primary flex items-center justify-end gap-3">
                      مكافأة الإنجاز
                      <Trophy size={24} className="text-yellow-500" />
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-2xl">
                        <span className="font-black text-primary text-xl">100</span>
                        <span className="font-bold text-muted-foreground">النقاط الأساسية</span>
                      </div>
                      <div className="flex justify-between items-center bg-accent/10 p-4 rounded-2xl border border-accent/20">
                        <span className="font-black text-accent text-xl">+{calculateBonus()}</span>
                        <span className="font-bold text-accent flex items-center gap-2">بونص التبكير <Timer size={16} /></span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold text-center italic">
                       * بونص التبكير يبدأ في 5 صباحاً ويتناقص تدريجياً.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
