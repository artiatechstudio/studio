
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Timer, Play, CheckCircle, Zap, Trophy, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MasterTrackPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  
  const [step, setStep] = useState<'setup' | 'active' | 'done'>('setup');
  const [selectedType, setSelectedType] = useState<TrackKey>('Fitness');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'سهل' | 'متوسط' | 'صعب'>('سهل');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const isLegend = useMemo(() => {
    if (!userData?.trackProgress) return false;
    const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'];
    return tracks.every(t => userData.trackProgress[t]?.completedStages?.length >= 30);
  }, [userData]);

  const handleStart = () => {
    const pool = getMasterPool(selectedType, selectedDifficulty);
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentChallenge(random);
    setStep('active');
    setTimeLeft(random.time * 60);
    setTimerActive(true);
    playSound('click');
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const handleComplete = async () => {
    if (!user || !currentChallenge) return;
    playSound('success');
    
    if (isLegend) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const points = currentChallenge.points;
      await update(ref(database, `users/${user.uid}`), {
        points: (userData.points || 0) + points,
        [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + points
      });
      toast({ title: "إنجاز أسطوري! 🎉", description: `حصلت على ${points} نقطة لمستواك المتقدم.` });
    } else {
      toast({ title: "أحسنت التدريب! 🐱", description: "استمر حتى تنهي المسارات الأربعة للحصول على نقاط رسمية." });
    }
    setStep('done');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-32" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-6 rounded-[2.5rem] shadow-xl border border-border mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Sparkles size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">المسار العام</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">تحديات الأساطير والتدريب الحر</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-8 shadow-xl border-none bg-card mx-2 space-y-8">
            {!isLegend && (
              <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="text-orange-600 shrink-0" />
                <p className="text-xs font-bold text-orange-900 leading-relaxed">
                  تنبيه: هذا المسار لا يمنح نقاطاً رسمية إلا للأعضاء الذين أتموا الـ 120 يوماً في المسارات الأساسية. يمكنك استخدامه للتدريب الآن!
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-black text-primary">1. اختر نوع المهمة</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['Fitness', 'Nutrition', 'Behavior', 'Study'] as TrackKey[]).map(t => (
                  <Button 
                    key={t}
                    variant={selectedType === t ? 'default' : 'outline'}
                    onClick={() => { playSound('click'); setSelectedType(t); }}
                    className="h-14 rounded-2xl font-black"
                  >
                    {t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'تغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-primary">2. مستوى الصعوبة</h3>
              <div className="flex gap-3">
                {(['سهل', 'متوسط', 'صعب'] as const).map(d => (
                  <Button 
                    key={d}
                    variant={selectedDifficulty === d ? 'default' : 'outline'}
                    onClick={() => { playSound('click'); setSelectedDifficulty(d); }}
                    className="flex-1 h-14 rounded-2xl font-black"
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleStart} className="w-full h-16 rounded-[1.5rem] bg-primary text-xl font-black shadow-xl shadow-primary/20">
              ابدأ التحدي العشوائي 🐱🚀
            </Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border mx-2 text-right shadow-2xl">
            <CardHeader className="bg-primary text-white p-6">
              <div className="flex items-center justify-between flex-row-reverse">
                <CardTitle className="text-xl font-black">{currentChallenge.title}</CardTitle>
                <div className="flex gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">{currentChallenge.difficulty}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <p className="text-lg font-bold text-muted-foreground leading-relaxed">{currentChallenge.description}</p>
              
              <div className="bg-secondary/30 p-8 rounded-[2rem] text-center space-y-2">
                <p className="text-xs font-black text-primary uppercase">الوقت المتبقي</p>
                <p className="text-6xl font-black text-primary font-mono">{formatTime(timeLeft)}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleComplete} className="h-16 rounded-2xl bg-accent text-xl font-black shadow-lg">
                  أنهيت المهمة 🔥
                </Button>
                <Button onClick={() => setStep('setup')} variant="ghost" className="text-destructive font-black">
                  إلغاء التحدي
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card className="rounded-[2.5rem] p-12 text-center mx-2 bg-card shadow-2xl space-y-6">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-3xl font-black text-primary">عمل رائع!</h2>
            <p className="text-muted-foreground font-bold">كل تمرين إضافي هو خطوة نحو العظمة. استمر في النمو!</p>
            <Button onClick={() => setStep('setup')} className="w-full h-14 rounded-2xl font-black">تحدي جديد 🐱</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
