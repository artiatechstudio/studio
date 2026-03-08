
"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, CheckCircle, ListChecks, Plus, CheckSquare, Crown, Infinity, Clock, XCircle, Lock, Trash2 } from 'lucide-react';
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

    if (isLegend) {
      toast({ title: isPremium ? "إنجاز ملكي! (نقاط 2x) 🎉" : "إنجاز أسطوري! 🎉", description: `حصلت على ${finalPoints} نقطة.` });
    } else {
      toast({ title: "تم تمديد الحماسة! 🔥", description: "أكمل المسارات الأساسية للحصول على نقاط الماستر." });
    }

    setStep('done');
    setTimerActive(false);
  }, [user, currentChallenge, userData, isPremium, updateStreakAndPoints]);

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
    if (pool.length === 0) {
      toast({ title: "لا يوجد تحديات حالياً بهذا التصنيف" });
      return;
    }
    
    if (!isPremium && masterCountToday >= 5) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لتحديات غير محدودة! 👑" });
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
    try {
      const uRef = ref(database, `users/${user.uid}`);
      const snap = await get(uRef);
      const data = snap.val();
      const todayStr = new Date().toLocaleDateString('en-CA');
      await update(uRef, {
        points: Math.max(0, (data.points || 0) - 75),
        [`dailyPoints/${todayStr}`]: Math.max(0, (data.dailyPoints?.[todayStr] || 0) - 75)
      });
      setStep('setup');
      localStorage.removeItem('master_timer_end');
      localStorage.removeItem('master_current_challenge');
      setTimerActive(false);
      toast({ variant: "destructive", title: "تم الانسحاب 🛑", description: "خصم 75 نقطة." });
    } catch (e) { console.error(e); }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;
    if (!isPremium && todoCountToday >= 5) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "اشترك في بريميوم لمهام لا نهائية! 👑" });
      return;
    }
    playSound('click');
    const now = Date.now();
    let expiryTime: number;
    if (todoMinutes && parseInt(todoMinutes) > 0) {
      expiryTime = now + (parseInt(todoMinutes) * 60 * 1000);
    } else {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      expiryTime = midnight.getTime();
    }
    const newTodoRef = push(ref(database, `users/${user.uid}/todos`));
    update(newTodoRef, {
      id: newTodoRef.key,
      title: todoInput.trim(),
      completed: false,
      timestamp: now,
      expiry: expiryTime,
      hasCustomTimer: !!(todoMinutes && parseInt(todoMinutes) > 0)
    });
    update(ref(database, `users/${user.uid}`), {
      [`dailyTodoCount/${today}`]: todoCountToday + 1
    });
    setTodoInput('');
    setTodoMinutes('');
  };

  const handleToggleTodo = async (todo: any) => {
    if (!user || completingId || !userData) return;
    playSound('click');
    setCompletingId(todo.id);
    
    const now = Date.now();
    const isExpired = todo.expiry <= now;
    const pointsToAdd = isExpired ? 0 : 5;

    setTimeout(async () => {
      await updateStreakAndPoints(pointsToAdd);
      await remove(ref(database, `users/${user.uid}/todos/${todo.id}`));
      if (pointsToAdd > 0) { 
        toast({ title: "مهمة ناجحة! +5 نقاط وتمديد حماسة 🔥" }); 
        playSound('success'); 
      } else {
        toast({ title: "تمديد حماسة فقط! 🔥", description: "المهمة انتهت زمنياً." });
      }
      setCompletingId(null);
    }, 800);
  };

  const handleCancelTodo = async (todoId: string) => {
    if (!user || !userData) return;
    playSound('click');
    const todayStr = new Date().toLocaleDateString('en-CA');
    try {
      await update(ref(database, `users/${user.uid}`), {
        points: Math.max(0, (userData.points || 0) - 30),
        [`dailyPoints/${todayStr}`]: Math.max(0, (userData.dailyPoints?.[todayStr] || 0) - 30)
      });
      await remove(ref(database, `users/${user.uid}/todos/${todoId}`));
      toast({ variant: "destructive", title: "تم إلغاء المهمة 🛑", description: "تم خصم 30 نقطة." });
    } catch (e) { console.error(e); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  function TodoExpiryTimer({ expiry, hasCustomTimer }: { expiry: number, hasCustomTimer: boolean }) {
    const [display, setDisplay] = useState("");
    const [isExpired, setIsExpired] = useState(false);
    useEffect(() => {
      const itv = setInterval(() => {
        const diff = expiry - Date.now();
        if (diff <= 0) { setDisplay("منتهي (0 نقطة)"); setIsExpired(true); } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setDisplay(!hasCustomTimer ? "حتى منتصف الليل" : `${h > 0 ? h + 'س ' : ''}${m}د ${s}ث`);
          setIsExpired(false);
        }
      }, 1000);
      return () => clearInterval(itv);
    }, [expiry, hasCustomTimer]);
    return ( <span className={cn("text-[8px] font-black flex items-center gap-1", isExpired ? "text-red-500" : "text-orange-500")}> <Clock size={8}/> {display} </span> );
  }

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40 overflow-x-hidden" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6 px-2 sm:px-4">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المسار العام</h1>
              <div className="flex items-center gap-1">
                <p className="text-[8px] font-bold text-muted-foreground uppercase">تحديات الأساطير والتدريب</p>
                {isPremium && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
              </div>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 md:p-8 shadow-xl border-none bg-card space-y-6 overflow-hidden mx-2">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-primary text-sm">ابدأ تحدياً جديداً</h3>
               <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full border border-border/50">
                  <span className="text-[9px] font-black text-muted-foreground">المتبقي اليوم:</span>
                  {isPremium ? <Infinity size={12} className="text-yellow-600" /> : <span className="text-xs font-black text-primary">{Math.max(0, 5 - masterCountToday)}/5</span>}
               </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-primary text-xs opacity-60 text-right">1. نوع المهمة</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['Fitness', 'Nutrition', 'Behavior', 'Study'] as TrackKey[]).map(t => (
                  <Button 
                    key={t}
                    variant={selectedType === t ? 'default' : 'outline'}
                    onClick={() => { playSound('click'); setSelectedType(t); }}
                    className={cn("h-12 rounded-xl font-black text-xs", selectedType === t ? "shadow-md scale-[1.02]" : "")}
                  >
                    {t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'تغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-primary text-xs opacity-60 text-right">2. الصعوبة</h3>
              <div className="flex gap-2">
                {(['سهل', 'متوسط', 'صعب'] as const).map(d => (
                  <Button 
                    key={d}
                    variant={selectedDifficulty === d ? 'default' : 'outline'}
                    onClick={() => { playSound('click'); setSelectedDifficulty(d); }}
                    className={cn("flex-1 h-12 rounded-xl font-black text-xs", selectedDifficulty === d ? "shadow-md scale-[1.02]" : "")}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleStart} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">
              ابدأ التحدي 🚀
            </Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl mx-2">
            <CardHeader className="bg-primary text-white p-5">
              <div className="flex items-center justify-between flex-row-reverse gap-4">
                <CardTitle className="text-lg font-black leading-tight flex-1 text-right">
                  {currentChallenge.title}
                </CardTitle>
                <div className="flex flex-col items-center gap-1">
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">{currentChallenge.difficulty}</span>
                  {currentChallenge.isTimeLocked && <span className="bg-red-500/40 px-1.5 py-0.5 rounded-md text-[7px] font-black flex items-center gap-0.5"><Lock size={8}/> مقفلة</span>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-base font-bold text-muted-foreground leading-relaxed text-right">{currentChallenge.description}</p>
              
              <div className="bg-secondary/30 p-6 rounded-[2rem] text-center space-y-1">
                <p className="text-[9px] font-black text-primary uppercase">يعمل في الخلفية... 🐱📡</p>
                <p className="text-5xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleCompleteChallenge} 
                  disabled={currentChallenge.isTimeLocked && timeLeft > 0}
                  className={cn(
                    "h-14 rounded-2xl text-lg font-black shadow-lg transition-all",
                    (currentChallenge.isTimeLocked && timeLeft > 0) ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-accent text-white"
                  )}
                >
                  {(currentChallenge.isTimeLocked && timeLeft > 0) ? `انتظر إكمال الوقت... (${Math.ceil(timeLeft / 60)}د)` : "أنهيت المهمة 🔥"}
                </Button>
                <Button onClick={handleCancelChallenge} variant="ghost" className="text-destructive font-black text-xs h-10 gap-2">
                  <XCircle size={16} /> إلغاء التحدي (خصم 75ن)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card className="rounded-[2.5rem] p-8 text-center bg-card shadow-2xl space-y-4 mx-2">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-primary">عمل رائع!</h2>
            <p className="text-xs font-bold text-muted-foreground">كل خطوة إضافية هي حجر أساس في بناء أسطورتك الشخصية.</p>
            <Button onClick={() => setStep('setup')} className="w-full h-12 rounded-xl font-black">تحدي جديد 🐱</Button>
          </Card>
        )}

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-3">
            <h2 className="text-lg font-black text-primary flex items-center gap-2"> <ListChecks size={20} /> قائمة مهامي </h2>
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg border border-border/20">
               <span className="text-[8px] font-black text-muted-foreground">المتبقي اليوم:</span>
               {isPremium ? <Infinity size={10} className="text-yellow-600" /> : <span className="text-[10px] font-black text-primary">{Math.max(0, 5 - todoCountToday)}/5</span>}
            </div>
          </header>
          
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5 mx-2">
            <form onSubmit={handleAddTodo} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <textarea 
                  placeholder="أضف مهمة شخصية..." 
                  className="flex-1 min-h-[44px] p-2.5 rounded-xl bg-secondary/50 border-none font-bold text-right text-[10px] focus:ring-2 focus:ring-primary/20 resize-none outline-none overflow-hidden"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                />
                <Input placeholder="د" type="number" className="h-11 w-12 rounded-xl bg-secondary/50 border-none font-bold text-center text-[10px]" value={todoMinutes} onChange={(e) => setTodoMinutes(e.target.value)} />
                <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-lg shrink-0"> <Plus size={20} /> </Button>
              </div>
            </form>
            <div className="space-y-2">
              {todosData ? Object.values(todosData).map((todo: any) => (
                <div key={todo.id} className={cn("flex items-center justify-between p-3.5 bg-secondary/20 rounded-xl", completingId === todo.id && "opacity-0 scale-95 blur-sm transition-all duration-700")}>
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <button onClick={() => handleToggleTodo(todo)} disabled={!!completingId} className="w-7 h-7 rounded-lg bg-white border-2 border-primary/20" > <CheckSquare size={16} className="text-transparent" /> </button>
                    <div className="flex flex-col text-right overflow-hidden flex-1">
                      <span className="font-bold text-[11px] text-primary break-words leading-tight"> {todo.title} </span>
                      <TodoExpiryTimer expiry={todo.expiry} hasCustomTimer={todo.hasCustomTimer} />
                    </div>
                    <Button onClick={() => handleCancelTodo(todo.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive shrink-0">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )) : ( <div className="text-center py-8 opacity-20"> <ListChecks size={32} className="mx-auto mb-2" /> <p className="font-black text-[10px] italic">لا توجد مهام نشطة حالياً.</p> </div> )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
