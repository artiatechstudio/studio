
"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, CheckCircle, ListChecks, Plus, CheckSquare, Crown, Infinity, Clock, XCircle, Lock, Trash2, Swords, Timer } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get, remove } from 'firebase/database';
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
  const hasAutoCompletedMaster = useRef(false);

  const [todoInput, setTodoInput] = useState('');
  const [todoMinutes, setTodoMinutes] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const todosRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/todos`) : null, [user, database]);
  const { data: todosData } = useDatabase(todosRef);

  // تحديات المبارزة النشطة
  const challengesRef = useMemoFirebase(() => ref(database, 'challenges'), [database]);
  const { data: allChallengesData } = useDatabase(challengesRef);

  const activePvPChallenges = useMemo(() => {
    if (!allChallengesData || !user) return [];
    return Object.values(allChallengesData).filter((c: any) => 
      (c.senderId === user.uid || c.receiverId === user.uid) && c.status === 'active'
    );
  }, [allChallengesData, user]);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const today = new Date().toLocaleDateString('en-CA');

  const masterCountToday = userData?.dailyMasterCount?.[today] || 0;
  const todoCountToday = userData?.dailyTodoCount?.[today] || 0;

  const updateStreakAndPoints = useCallback(async (pointsToAdd: number) => {
    if (!user || !userData) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    
    let newStreak = userData.streak || 0;
    let streakUpdated = false;

    if (userData.lastActiveDate !== todayStr) {
      if (userData.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      streakUpdated = true;
    }

    const updates: any = {
      points: (userData.points || 0) + pointsToAdd,
      [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + pointsToAdd,
      lastActiveDate: todayStr,
      streak: newStreak
    };

    await update(ref(database, `users/${user.uid}`), updates);

    if (streakUpdated) {
      push(ref(database, `users/${user.uid}/notifications`), {
        type: 'achievement',
        title: 'تمديد الحماسة! 🔥',
        message: `لقد بدأ نشاطك اليوم. حماستك الآن ${newStreak} يوماً!`,
        isRead: false,
        timestamp: serverTimestamp()
      });
    }
  }, [user, userData, database]);

  const handleCompleteChallenge = useCallback(async () => {
    if (!user || !currentChallenge || !userData) return;

    playSound('success');
    localStorage.removeItem('master_timer_end');
    localStorage.removeItem('master_current_challenge');

    const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'] as const;
    const isLegend = userData?.trackProgress && tracks.every(t => (userData.trackProgress[t]?.completedStages?.length || 0) >= 30);

    const basePoints = currentChallenge.points || 50;
    const finalPoints = isLegend ? (isPremium ? basePoints * 2 : basePoints) : 0;

    await updateStreakAndPoints(finalPoints);

    setStep('done');
    setTimerActive(false);
  }, [user, currentChallenge, userData, isPremium, updateStreakAndPoints]);

  const handleCompletePvP = async (challenge: any) => {
    if (!user) return;
    playSound('success');
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    try {
      // منح النقاط للفائز
      await updateStreakAndPoints(challenge.pointsStake);
      
      // تحديث عداد الانتصارات
      await update(ref(database, `users/${user.uid}`), {
        challengesWon: (userData.challengesWon || 0) + 1
      });

      // إغلاق التحدي
      await remove(ref(database, `challenges/${challenge.id}`));

      toast({ title: `انتصار ساحق! +${challenge.pointsStake}ن ⚔️`, description: "تم تسجيل فوزك في البروفايل." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل إكمال التحدي" });
    }
  };

  const handleFailPvP = async (challenge: any) => {
    if (!user) return;
    playSound('click');
    const todayStr = new Date().toLocaleDateString('en-CA');

    try {
      // خصم النقاط كعقوبة
      const currentPoints = userData.points || 0;
      await update(ref(database, `users/${user.uid}`), {
        points: Math.max(0, currentPoints - challenge.pointsStake),
        [`dailyPoints/${todayStr}`]: Math.max(0, (userData.dailyPoints?.[todayStr] || 0) - challenge.pointsStake),
        challengesLost: (userData.challengesLost || 0) + 1,
        lastChallengeLossDate: todayStr
      });

      // إغلاق التحدي
      await remove(ref(database, `challenges/${challenge.id}`));

      toast({ variant: "destructive", title: "هزيمة التحدي! ❌", description: `خصم ${challenge.pointsStake} نقطة وإدراجك في جدار العار.` });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const savedEnd = localStorage.getItem('master_timer_end');
    const savedChallenge = localStorage.getItem('master_current_challenge');
    
    if (savedEnd && savedChallenge) {
      const remaining = Math.round((parseInt(savedEnd) - Date.now()) / 1000);
      const parsedChallenge = JSON.parse(savedChallenge);
      if (remaining > 0) {
        setCurrentChallenge(parsedChallenge);
        setTimeLeft(remaining);
        setTimerActive(true);
        setStep('active');
      } else if (!hasAutoCompletedMaster.current) {
        hasAutoCompletedMaster.current = true;
        setCurrentChallenge(parsedChallenge);
        handleCompleteChallenge();
      }
    }
  }, [handleCompleteChallenge]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            localStorage.removeItem('master_timer_end');
            localStorage.removeItem('master_current_challenge');
            setTimerActive(false);
            if (!hasAutoCompletedMaster.current) {
              hasAutoCompletedMaster.current = true;
              handleCompleteChallenge();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft, handleCompleteChallenge]);

  const handleStart = () => {
    const pool = getMasterPool(selectedType, selectedDifficulty);
    if (pool.length === 0) return;
    
    if (!isPremium && masterCountToday >= 5) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي (5 تحديات)" });
      return;
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentChallenge(random);
    setStep('active');
    hasAutoCompletedMaster.current = false;
    
    const durationSeconds = (random.time || 5) * 60;
    const endTime = Date.now() + (durationSeconds * 1000);
    
    localStorage.setItem('master_timer_end', endTime.toString());
    localStorage.setItem('master_current_challenge', JSON.stringify(random));
    
    update(ref(database, `users/${user.uid}`), {
      [`dailyMasterCount/${today}`]: masterCountToday + 1
    });

    setTimeLeft(durationSeconds);
    setTimerActive(true);
    playSound('click');
  };

  const handleCancelChallenge = async () => {
    if (!user) return;
    playSound('click');
    const todayStr = new Date().toLocaleDateString('en-CA');
    await update(ref(database, `users/${user.uid}`), {
      points: Math.max(0, (userData.points || 0) - 75),
      [`dailyPoints/${todayStr}`]: Math.max(0, (userData.dailyPoints?.[todayStr] || 0) - 75)
    });
    setStep('setup');
    localStorage.removeItem('master_timer_end');
    localStorage.removeItem('master_current_challenge');
    setTimerActive(false);
    toast({ variant: "destructive", title: "تم الانسحاب 🛑", description: "خصم 75 نقطة." });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;
    if (!isPremium && todoCountToday >= 5) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي (5 مهام)" });
      return;
    }
    playSound('click');
    const now = Date.now();
    const midnight = new Date(); midnight.setHours(23, 59, 59, 999);
    const expiryTime = todoMinutes ? now + (parseInt(todoMinutes) * 60 * 1000) : midnight.getTime();
    
    const newTodoRef = push(ref(database, `users/${user.uid}/todos`));
    set(newTodoRef, {
      id: newTodoRef.key,
      title: todoInput.trim(),
      completed: false,
      timestamp: now,
      expiry: expiryTime,
      hasCustomTimer: !!todoMinutes
    });
    update(ref(database, `users/${user.uid}`), {
      [`dailyTodoCount/${today}`]: todoCountToday + 1
    });
    setTodoInput('');
    setTodoMinutes('');
  };

  const handleToggleTodo = async (todo: any) => {
    if (!user || completingId) return;
    playSound('click');
    setCompletingId(todo.id);
    
    const now = Date.now();
    const isExpired = todo.expiry <= now;
    const pointsToAdd = isExpired ? 0 : 5;

    setTimeout(async () => {
      await updateStreakAndPoints(pointsToAdd);
      await remove(ref(database, `users/${user.uid}/todos/${todo.id}`));
      toast({ title: pointsToAdd > 0 ? "مهمة ناجحة! +5ن 🔥" : "تمديد حماسة فقط (الوقت انتهى)!" });
      setCompletingId(null);
    }, 800);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40 overflow-x-hidden" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المسار العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">تحديات الأساطير والمبارزات</p>
            </div>
          </div>
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        {/* قسم التحديات الثنائية النشطة */}
        {activePvPChallenges.length > 0 && (
          <section className="mx-2 space-y-3">
            <h3 className="font-black text-primary text-sm flex items-center gap-2 px-2"> <Swords className="text-red-500" size={18} /> المبارزات النشطة ⚔️</h3>
            <div className="grid grid-cols-1 gap-3">
              {activePvPChallenges.map((pvp: any) => (
                <PvPActiveCard key={pvp.id} challenge={pvp} onComplete={() => handleCompletePvP(pvp)} onFail={() => handleFailPvP(pvp)} />
              ))}
            </div>
          </section>
        )}

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 md:p-8 shadow-xl border-none bg-card space-y-6 mx-2">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-primary text-sm">تحديات الأساطير (Master)</h3>
               <div className="bg-secondary px-3 py-1 rounded-full text-[10px] font-black text-primary">
                  المتبقي: {isPremium ? "∞" : `${Math.max(0, 5 - masterCountToday)}/5`}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Fitness', 'Nutrition', 'Behavior', 'Study'].map(t => (
                <Button key={t} variant={selectedType === t ? 'default' : 'outline'} onClick={() => setSelectedType(t as TrackKey)} className="h-12 rounded-xl font-black text-xs">
                  {t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'تغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {['سهل', 'متوسط', 'صعب'].map(d => (
                <Button key={d} variant={selectedDifficulty === d ? 'default' : 'outline'} onClick={() => setSelectedDifficulty(d as any)} className="flex-1 h-12 rounded-xl font-black text-xs">{d}</Button>
              ))}
            </div>
            <Button onClick={handleStart} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">ابدأ التحدي 🚀</Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl mx-2">
            <CardHeader className="bg-primary text-white p-5"><CardTitle className="text-lg font-black leading-tight text-right">{currentChallenge.title}</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-base font-bold text-muted-foreground leading-relaxed text-right">{currentChallenge.description}</p>
              <div className="bg-secondary/30 p-6 rounded-[2rem] text-center space-y-1">
                <p className="text-[9px] font-black text-primary uppercase">العداد النشط... 📡</p>
                <p className="text-5xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleCompleteChallenge} className="h-14 rounded-2xl text-lg font-black bg-accent text-white shadow-lg">أنهيت المهمة 🔥</Button>
                <Button onClick={handleCancelChallenge} variant="ghost" className="text-destructive font-black text-xs gap-2"><XCircle size={16} /> انسحاب (-75ن)</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card className="rounded-[2.5rem] p-8 text-center bg-card shadow-2xl space-y-4 mx-2">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={48} /></div>
            <h2 className="text-2xl font-black text-primary">تم الإنجاز!</h2>
            <Button onClick={() => setStep('setup')} className="w-full h-12 rounded-xl font-black">تحدي جديد 🐱</Button>
          </Card>
        )}

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-3">
            <h2 className="text-lg font-black text-primary flex items-center gap-2"> <ListChecks size={20} /> قائمة مهامي </h2>
            <div className="bg-secondary/50 px-2 py-0.5 rounded-lg border border-border/20 text-[10px] font-black">
               المتبقي: {isPremium ? "∞" : `${Math.max(0, 5 - todoCountToday)}/5`}
            </div>
          </header>
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5 mx-2">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input placeholder="أضف مهمة..." className="flex-1 h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs" value={todoInput} onChange={(e) => setTodoInput(e.target.value)} />
              <Input placeholder="د" type="number" className="h-11 w-12 rounded-xl bg-secondary/50 border-none font-bold text-center text-xs" value={todoMinutes} onChange={(e) => setTodoMinutes(e.target.value)} />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-lg shrink-0"> <Plus size={20} /> </Button>
            </form>
            <div className="space-y-2">
              {todosData ? Object.values(todosData).map((todo: any) => (
                <div key={todo.id} className={cn("flex items-center justify-between p-3 bg-secondary/20 rounded-xl", completingId === todo.id && "opacity-0 transition-all duration-700")}>
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => handleToggleTodo(todo)} className="w-6 h-6 rounded-lg bg-white border-2 border-primary/20" />
                    <div className="flex flex-col text-right flex-1">
                      <span className="font-bold text-[11px] text-primary leading-tight">{todo.title}</span>
                      <span className="text-[8px] font-black text-orange-500"> <Clock size={8} className="inline ml-1" /> {todo.hasCustomTimer ? "موقت خاص" : "حتى منتصف الليل"} </span>
                    </div>
                  </div>
                </div>
              )) : ( <p className="text-center py-4 opacity-30 text-[10px] font-black">لا توجد مهام حالياً</p> )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function PvPActiveCard({ challenge, onComplete, onFail }: { challenge: any, onComplete: () => void, onFail: () => void }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const expires = (challenge.acceptedAt || 0) + (challenge.duration * 60 * 1000);
    const updateTimer = () => {
      const diff = Math.round((expires - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        onFail(); // الفشل التلقائي عند انتهاء الوقت
      } else {
        setTimeLeft(diff);
      }
    };
    const itv = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(itv);
  }, [challenge, onFail]);

  const format = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <Card className="rounded-2xl border-2 border-red-100 bg-white overflow-hidden shadow-md">
      <div className="p-4 flex items-center justify-between bg-red-50 border-b border-red-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center animate-pulse"> <Timer size={16} /> </div>
          <p className="text-xs font-black text-red-900">{format(timeLeft)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-red-600 uppercase">مبارزة ضد {challenge.senderId === challenge.id ? challenge.receiverName : challenge.senderName}</p>
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        <h4 className="font-black text-primary text-sm text-right">{challenge.title}</h4>
        <div className="flex items-center justify-between">
           <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-[10px] font-black">الرهان: {challenge.pointsStake}ن</div>
           <Button onClick={onComplete} className="h-9 px-6 rounded-xl bg-green-600 hover:bg-green-700 font-black text-xs gap-2"> <CheckCircle size={14} /> أنجزت التحدي! </Button>
        </div>
      </CardContent>
    </Card>
  );
}
