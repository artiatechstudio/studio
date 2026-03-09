
"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, CheckCircle, ListChecks, Plus, Crown, Clock, XCircle, Trash2, Swords, Timer, Camera, Loader2, AlertTriangle, ShieldCheck, Trophy, Lock, Infinity } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get, remove, set, runTransaction } from 'firebase/database';
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

  const [todoInput, setPostTodoInput] = useState('');
  const [todoMinutes, setTodoMinutes] = useState('10');

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const todosRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/todos`) : null, [user, database]);
  const { data: todosData } = useDatabase(todosRef);

  const challengesRef = useMemoFirebase(() => ref(database, 'challenges'), [database]);
  const { data: allChallengesData } = useDatabase(challengesRef);

  const activePvPChallenges = useMemo(() => {
    if (!allChallengesData || !user) return [];
    return Object.entries(allChallengesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((c: any) => 
        (c.senderId === user.uid || c.receiverId === user.uid) && 
        ['active', 'awaiting_recognition', 'pending_acceptance'].includes(c.status)
      );
  }, [allChallengesData, user]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const todayStr = new Date().toLocaleDateString('en-CA');
  const masterCountToday = userData?.dailyMasterCount?.[todayStr] || 0;
  const todoCountToday = userData?.dailyTodosCount?.[todayStr] || 0;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;

    if (!isPremium && todoCountToday >= 5) {
      toast({ variant: "destructive", title: "وصلت للحد اليومي", description: "يسمح بـ 5 مهام يومية فقط للأعضاء العاديين. 👑" });
      return;
    }

    playSound('click');
    const mins = parseInt(todoMinutes) || 10;
    const newTodoRef = push(ref(database, `users/${user.uid}/todos`));
    set(newTodoRef, {
      id: newTodoRef.key,
      title: todoInput.trim(),
      minutes: mins,
      createdAt: Date.now(),
      expiresAt: Date.now() + (mins * 60 * 1000)
    });

    update(ref(database, `users/${user.uid}`), {
      [`dailyTodosCount/${todayStr}`]: todoCountToday + 1
    });

    setPostTodoInput('');
  };

  const handleCompleteTodo = (todo: any) => {
    playSound('click');
    const isExpired = Date.now() > todo.expiresAt;
    
    if (isExpired) {
      toast({ variant: "destructive", title: "انتهى الوقت!", description: "لم تحصل على نقاط لأن المهمة تجاوزت وقتها." });
    } else {
      const uRef = ref(database, `users/${user?.uid}`);
      update(uRef, {
        points: (userData?.points || 0) + 5,
        [`dailyPoints/${todayStr}`]: (userData?.dailyPoints?.[todayStr] || 0) + 5
      });
      toast({ title: "مهمة ناجحة! +5ن 🔥" });
      playSound('success');
    }
    remove(ref(database, `users/${user?.uid}/todos/${todo.id}`));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner"><Swords size={28} /></div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">الماستر</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">تحديات الأساطير 👑</p>
            </div>
          </div>
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        {activePvPChallenges.length > 0 && (
          <section className="mx-2 space-y-3">
            <h3 className="font-black text-primary text-sm flex items-center gap-2 px-2"> <ShieldCheck className="text-accent" size={18} /> ساحة المواجهة ⚔️</h3>
            <div className="grid grid-cols-1 gap-4">
              {activePvPChallenges.map((pvp: any) => (
                <BattleCard key={pvp.id} challenge={pvp} currentUser={user} database={database} />
              ))}
            </div>
          </section>
        )}

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-6 mx-2">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-primary text-sm">تحدي الماستر العشوائي 🚀</h3>
               <div className="bg-secondary px-3 py-1 rounded-full text-[10px] font-black text-primary">اليوم: {isPremium ? "∞" : `${Math.max(0, 5 - masterCountToday)}/5`}</div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-right block text-[10px] font-black opacity-60">1. اختر الفئة</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Fitness', 'Nutrition', 'Behavior', 'Study'].map(t => (
                  <Button key={t} variant={selectedType === t ? 'default' : 'outline'} onClick={() => setSelectedType(t as TrackKey)} className="h-12 rounded-xl font-black text-xs">{t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'التغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}</Button>
                ))}
              </div>

              <Label className="text-right block text-[10px] font-black opacity-60">2. اختر الصعوبة</Label>
              <div className="grid grid-cols-3 gap-2">
                {['سهل', 'متوسط', 'صعب'].map(d => (
                  <Button key={d} variant={selectedDifficulty === d ? 'secondary' : 'ghost'} onClick={() => setSelectedDifficulty(d as any)} className="h-10 rounded-xl font-black text-xs border border-border">{d}</Button>
                ))}
              </div>
            </div>

            <Button onClick={() => { 
              const pool = getMasterPool(selectedType, selectedDifficulty);
              if (pool.length === 0) { toast({ title: "لا توجد تحديات متوفرة حالياً" }); return; }
              const random = pool[Math.floor(Math.random() * pool.length)];
              setCurrentChallenge(random);
              setStep('active');
              setTimeLeft(random.time * 60);
              setTimerActive(true);
              playSound('click');
            }} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">ابدأ تحدي الماستر 🔥</Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl mx-2">
            <CardHeader className="bg-primary text-white p-5">
              <div className="flex items-center justify-between flex-row-reverse">
                <CardTitle className="text-lg font-black leading-tight text-right">{currentChallenge.title}</CardTitle>
                {currentChallenge.isTimeLocked && <div className="px-2 py-0.5 bg-red-500 text-white rounded-lg text-[8px] font-black flex items-center gap-1 shadow-sm"><Lock size={10} /> التزام كامل</div>}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-base font-bold text-muted-foreground leading-relaxed text-right">{currentChallenge.description}</p>
              <div className="bg-secondary/30 p-6 rounded-[2rem] text-center space-y-1">
                <p className="text-5xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">الوقت المتبقي</p>
              </div>
              <Button 
                onClick={() => {
                  const today = new Date().toLocaleDateString('en-CA');
                  update(ref(database, `users/${user?.uid}`), {
                    points: (userData?.points || 0) + currentChallenge.points,
                    [`dailyPoints/${today}`]: (userData?.dailyPoints?.[today] || 0) + currentChallenge.points,
                    [`dailyMasterCount/${today}`]: masterCountToday + 1
                  });
                  setStep('done');
                  setTimerActive(false);
                  playSound('success');
                  toast({ title: "أحسنت يا بطل! + " + currentChallenge.points });
                }} 
                disabled={currentChallenge.isTimeLocked && timeLeft > 0}
                className={cn(
                  "w-full h-14 rounded-2xl text-lg font-black shadow-lg transition-all",
                  (currentChallenge.isTimeLocked && timeLeft > 0) ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-accent text-white"
                )}
              >
                {(currentChallenge.isTimeLocked && timeLeft > 0) ? `انتظر اكتمال الوقت... (${Math.ceil(timeLeft / 60)}د)` : "أنهيت المهمة 🔥"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <div className="mx-2 bg-green-50 p-8 rounded-[2.5rem] text-center border border-green-100 shadow-inner">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-green-700">تم الإنجاز!</h3>
            <p className="text-sm font-bold text-green-600 mt-2">لقد أثبت أنك من أساطير كارينجو.</p>
            <Button onClick={() => setStep('setup')} className="mt-6 rounded-xl font-black">العودة للماستر</Button>
          </div>
        )}

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-3">
            <h2 className="text-lg font-black text-primary flex items-center gap-2"> <ListChecks size={20} /> مهامي الموقوتة (+5ن) </h2>
            <div className="text-[9px] font-black text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded-full">
              {isPremium ? <Infinity size={10} className="inline mr-1" /> : `${5 - todoCountToday}/5 متبقي`}
            </div>
          </header>
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5 mx-2">
            <form onSubmit={handleAddTodo} className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="اسم المهمة..." className="flex-1 h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs" value={todoInput} onChange={(e) => setPostTodoInput(e.target.value)} />
                <div className="w-20">
                  <Input type="number" placeholder="د" className="h-11 rounded-xl bg-secondary/50 border-none font-bold text-center text-xs" value={todoMinutes} onChange={(e) => setTodoMinutes(e.target.value)} />
                </div>
                <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-lg shrink-0"> <Plus size={20} /> </Button>
              </div>
            </form>
            <div className="space-y-2">
              {todosData ? Object.values(todosData).map((todo: any) => (
                <TodoItem key={todo.id} todo={todo} onComplete={handleCompleteTodo} />
              )) : <p className="text-center py-4 opacity-30 text-[10px] font-black italic">لا توجد مهام حالية</p>}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function TodoItem({ todo, onComplete }: { todo: any, onComplete: (t: any) => void }) {
  const [remaining, setRemaining] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const itv = setInterval(() => {
      const diff = Math.round((todo.expiresAt - Date.now()) / 1000);
      if (diff <= 0) {
        setRemaining(0);
        setExpired(true);
        clearInterval(itv);
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(itv);
  }, [todo.expiresAt]);

  const format = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <div className={cn("flex items-center justify-between p-3 rounded-xl transition-all", expired ? "bg-red-50 opacity-60" : "bg-secondary/20")}>
      <div className="flex items-center gap-3">
        <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-lg text-white", expired ? "bg-red-400" : "bg-primary")}>
          {expired ? "انتهى" : format(remaining)}
        </span>
        <button 
          onClick={() => onComplete(todo)} 
          className={cn("w-6 h-6 rounded-lg bg-white border-2 transition-colors", expired ? "border-red-200" : "border-primary/20 hover:border-primary")}
        />
      </div>
      <span className={cn("font-bold text-[11px] text-right flex-1 mr-3", expired ? "text-red-900 line-through" : "text-primary")}>
        {todo.title}
      </span>
    </div>
  );
}

function BattleCard({ challenge, currentUser, database }: { challenge: any, currentUser: any, database: any }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = challenge.status === 'active';
  const isWinnerSet = !!challenge.winnerId;
  const isMineWinner = challenge.winnerId === currentUser?.uid;
  const amITheSlowOne = isWinnerSet && !isMineWinner;

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(async () => {
      const now = Date.now();
      let limit = (challenge.duration || 15) * 60 * 1000;
      let start = challenge.acceptedAt || challenge.createdAt;

      if (isWinnerSet && !isMineWinner) {
        limit = challenge.winnerTime;
        start = currentUser.uid === challenge.senderId ? challenge.senderStartTime : challenge.receiverStartTime;
      }

      const elapsed = now - start;
      const rem = Math.max(0, Math.floor((limit - elapsed) / 1000));
      setTimeLeft(rem);

      // منطق العقوبة عند انتهاء الوقت للطرفين
      if (rem <= 0 && !isWinnerSet && !isProcessing) {
        handleTimeout();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, challenge, currentUser, isWinnerSet, isMineWinner, isProcessing]);

  const handleTimeout = async () => {
    setIsProcessing(true);
    const today = new Date().toLocaleDateString('en-CA');
    const stake = challenge.pointsStake || 50;

    // خصم النقاط من الطرفين
    const players = [challenge.senderId, challenge.receiverId];
    for (const pid of players) {
      const pRef = ref(database, `users/${pid}`);
      const snap = await get(pRef);
      const data = snap.val();
      update(pRef, {
        points: Math.max(0, (data.points || 0) - stake),
        [`dailyPoints/${today}`]: Math.max(0, (data.dailyPoints?.[today] || 0) - stake)
      });
    }

    update(ref(database, `challenges/${challenge.id}`), { status: 'failed_timeout' });
    toast({ variant: "destructive", title: "انتهى الوقت! 🛑", description: "خسر الطرفان نقاط الرهان لعدم الالتزام." });
    setIsProcessing(false);
  };

  const handleWithdraw = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    playSound('click');
    const today = new Date().toLocaleDateString('en-CA');
    const stake = challenge.pointsStake || 50;

    try {
      const uRef = ref(database, `users/${currentUser.uid}`);
      const snap = await get(uRef);
      const data = snap.val();

      await update(uRef, {
        points: Math.max(0, (data.points || 0) - stake),
        challengesLost: (data.challengesLost || 0) + 1,
        [`dailyPoints/${today}`]: Math.max(0, (data.dailyPoints?.[today] || 0) - stake)
      });

      await update(ref(database, `challenges/${challenge.id}`), {
        status: 'concluded',
        winnerId: currentUser.uid === challenge.senderId ? challenge.receiverId : challenge.senderId,
        withdrawerId: currentUser.uid
      });

      toast({ title: "تم الانسحاب 🏳️", description: "تم خصم نقاط الرهان كعقوبة انسحاب." });
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الانسحاب" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || isProcessing) return;
    setIsProcessing(true);
    playSound('click');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        const timeUsed = Date.now() - (currentUser.uid === challenge.senderId ? challenge.senderStartTime : challenge.receiverStartTime);

        const updates: any = {};
        updates.winnerId = currentUser.uid;
        updates.winnerName = userData?.name || 'بطل';
        updates.winnerTime = timeUsed;
        updates.proof = base64;
        updates.status = 'awaiting_recognition';

        await update(ref(database, `challenges/${challenge.id}`), updates);
        toast({ title: "تم رفع الإثبات! 📸", description: "توقف المؤقت؛ بانتظار اعتراف الخصم." });
        playSound('success');
      };
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الرفع" });
    } finally {
      setIsProcessing(false);
    }
  };

  const format = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <Card className="rounded-[2rem] border-2 border-primary/10 bg-card overflow-hidden shadow-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-right">
          <p className="text-xs font-black text-primary leading-tight">{challenge.title}</p>
          <p className="text-[10px] font-bold text-muted-foreground mt-1">الرهان: {challenge.pointsStake}ن 💰</p>
        </div>
        {isActive && (
          <div className={cn("px-3 py-1 rounded-xl text-xs font-black flex items-center gap-2", timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-secondary text-primary")}>
            <Timer size={14} /> {format(timeLeft)}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isActive ? (
          <>
            {amITheSlowOne && (
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-2">
                <AlertTriangle className="text-orange-600 shrink-0" size={14} />
                <p className="text-[9px] font-bold text-orange-800 leading-tight">يجب عليك إنهاء المهمة في أقل من {format(Math.floor(challenge.winnerTime/1000))} للفوز!</p>
              </div>
            )}
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isProcessing}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Camera size={16} />}
              رفع الإثبات 📸
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadProof} />
            <Button onClick={handleWithdraw} variant="ghost" disabled={isProcessing} className="w-full h-10 text-destructive/60 font-bold text-[10px]">
              انسحاب من التحدي 🏳️
            </Button>
          </>
        ) : (
          <Link href="/chat/trials">
            <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-primary/40 text-primary font-black text-xs gap-2">
              بانتظار الحكم أو الاعتراف ⚖️
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
