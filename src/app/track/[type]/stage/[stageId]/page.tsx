
"use client"

import React, { use, useState, useEffect, useCallback, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, Zap, Trophy, Timer, Medal } from 'lucide-react';
import Link from 'next/link';
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
    const timerKey = `timer_end_${trackKey}_${stageId}`;
    const savedEnd = localStorage.getItem(timerKey);
    
    if (savedEnd) {
      const remaining = Math.round((parseInt(savedEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setTimeLeft(remaining);
        setTimerActive(true);
      } else {
        localStorage.removeItem(timerKey);
      }
    }
  }, [trackKey, stageId]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            const timerKey = `timer_end_${trackKey}_${stageId}`;
            localStorage.removeItem(timerKey);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft, trackKey, stageId]);

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

  const handleStartTimer = () => {
    const durationSeconds = (challenge.time || 5) * 60;
    const endTime = Date.now() + (durationSeconds * 1000);
    const timerKey = `timer_end_${trackKey}_${stageId}`;
    
    localStorage.setItem(timerKey, endTime.toString());
    setTimeLeft(durationSeconds);
    setTimerActive(true);
    playSound('click');
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
      
      const basePoints = challenge?.points || 50;
      const pointsEarned = basePoints + calculateBonus();
      
      if (!completedStages.includes(stageId)) {
        completedStages.push(stageId);
      }

      let nextStage = currentProgress.currentStage || 1;
      if (stageId === nextStage) {
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

      const newBadges = [...(userData.badges || [])];
      
      // منح الأوسمة بناءً على التقدم
      if (completedStages.length === 1 && !newBadges.includes("أول خطوة 🐾")) newBadges.push("أول خطوة 🐾");
      if (completedStages.length === 5 && !newBadges.includes("المنضبط الصغير 🐣")) newBadges.push("المنضبط الصغير 🐣");
      if (completedStages.length === 15 && !newBadges.includes("المكافح ⚔️")) newBadges.push("المكافح ⚔️");
      if (completedStages.length === 30 && !newBadges.includes(`سيد مسار ${trackKey === 'Fitness' ? 'اللياقة' : trackKey === 'Nutrition' ? 'التغذية' : trackKey === 'Behavior' ? 'السلوك' : 'الدراسة'} 👑`)) {
        newBadges.push(`سيد مسار ${trackKey === 'Fitness' ? 'اللياقة' : trackKey === 'Nutrition' ? 'التغذية' : trackKey === 'Behavior' ? 'السلوك' : 'الدراسة'} 👑`);
      }
      
      const totalPoints = (userData.points || 0) + pointsEarned;
      if (totalPoints >= 1000 && !newBadges.includes("نادي الألف 🌟")) newBadges.push("نادي الألف 🌟");
      if (totalPoints >= 5000 && !newBadges.includes("الأسطورة الفضية 🥈")) newBadges.push("الأسطورة الفضية 🥈");
      if (totalPoints >= 10000 && !newBadges.includes("الأسطورة الذهبية 🥇")) newBadges.push("الأسطورة الذهبية 🥇");

      if (newStreak >= 7 && !newBadges.includes("المثابر الأسبوعي 🔥")) newBadges.push("المثابر الأسبوعي 🔥");
      if (newStreak >= 30 && !newBadges.includes("وحش الالتزام 🦁")) newBadges.push("وحش الالتزام 🦁");

      await update(userRef, {
        points: totalPoints,
        streak: newStreak,
        lastActiveDate: todayStr,
        badges: newBadges,
        [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + pointsEarned,
        [`trackProgress/${trackKey}`]: {
          completedStages,
          currentStage: nextStage,
          lastCompletedDate: todayStr
        }
      });

      push(ref(database, `users/${user.uid}/notifications`), {
        type: 'achievement',
        title: 'إنجاز رائع! 🏆',
        message: `لقد أكملت المستوى ${stageId} في مسار ${trackKey}. حصلت على ${pointsEarned} نقطة!`,
        isRead: false,
        timestamp: serverTimestamp()
      });

      localStorage.removeItem(`timer_end_${trackKey}_${stageId}`);
      setCompleted(true);
      setTimerActive(false);
      playSound('success');
      toast({ title: "تم الإنجاز! 🎉" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsUpdating(false);
    }
  }, [user, database, isUpdating, completed, progressData, trackKey, stageId, onCooldown, calculateBonus, challenge]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (onCooldown) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <Timer size={64} className="text-orange-500 mb-4 animate-float" />
        <h1 className="text-2xl font-black text-primary">وقت الراحة!</h1>
        <p className="font-bold text-muted-foreground mt-2">أكملت مرحلة في هذا المسار اليوم. عد غداً!</p>
        <Button onClick={() => router.back()} className="mt-6 rounded-xl font-black">رجوع</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-24" dir="rtl">
      <NavSidebar />
      <div className="app-container py-4 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="rounded-full gap-1 text-primary font-bold">
            رجوع للمسار
            <ArrowLeft size={14} />
          </Button>
        </div>

        <header className="text-right space-y-1">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black inline-block uppercase tracking-wider">المستوى {stageId}</div>
          <h1 className="text-2xl font-black text-primary leading-tight">{challenge.title}</h1>
        </header>

        <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl">
          <CardHeader className="bg-primary text-white p-6">
            <div className="flex items-center justify-between flex-row-reverse">
              <CardTitle className="text-lg font-black">المهمة الحالية</CardTitle>
              <div className="flex gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">{challenge.difficulty}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">{challenge.time}د</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <p className="text-lg font-bold text-muted-foreground leading-relaxed">{challenge.description}</p>
            
            {!completed ? (
              <div className="space-y-6">
                {timerActive ? (
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-8 rounded-[2rem] text-center space-y-2 border border-primary/10">
                      <p className="text-xs font-black text-primary uppercase">الوقت المتبقي (يعمل في الخلفية)</p>
                      <p className="text-6xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
                    </div>
                    <Button onClick={handleComplete} disabled={isUpdating} className="w-full h-16 rounded-2xl bg-accent text-xl font-black shadow-xl">
                      أنهيت المهمة 🔥
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleStartTimer} className="w-full h-16 rounded-2xl bg-primary text-xl font-black shadow-xl shadow-primary/20">
                    ابدأ التحدي 🐱🚀
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[2.5rem] text-center space-y-4">
                <CheckCircle size={64} className="text-green-500 mx-auto" />
                <h3 className="text-2xl font-black text-green-700">عمل مذهل!</h3>
                <p className="text-green-600 font-bold">تم إنجاز المهمة بنجاح.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] bg-card p-6 border border-border shadow-lg">
          <h3 className="text-sm font-black text-primary flex items-center justify-end gap-2 mb-4">مكافأة الإنجاز <Trophy size={18} className="text-yellow-500" /></h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 p-4 rounded-2xl text-center">
              <span className="font-black text-primary text-2xl">{challenge.points}</span>
              <p className="text-[10px] font-bold text-muted-foreground">نقاط المستوى</p>
            </div>
            <div className="bg-accent/10 p-4 rounded-2xl text-center border border-accent/10">
              <span className="font-black text-accent text-2xl">+{bonusValue}</span>
              <p className="text-[10px] font-bold text-accent">بونص تبكير</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
