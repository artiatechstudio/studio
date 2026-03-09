
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, ListChecks, Plus, Crown, Clock, XCircle, Trash2, Swords, Timer, Camera, Loader2, AlertTriangle, ShieldCheck, Trophy, Lock, Infinity, Gavel, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get, remove, set } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * دالة معالجة النتيجة الموحدة والشاملة لكافة حالات انتهاء التحدي
 */
async function concludeChallenge(database: any, challenge: any, winnerId: string | 'tie' | 'none') {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const stake = challenge.pointsStake || 50;
  const p1Id = challenge.senderId;
  const p2Id = challenge.receiverId;

  const processUser = async (uid: string, isWinner: boolean, isTie: boolean) => {
    const uRef = ref(database, `users/${uid}`);
    const snap = await get(uRef);
    const data = snap.val();
    if (!data) return;
    
    const updates: any = {};
    if (isTie) {
      // لا تغيير
    } else if (isWinner) {
      updates.points = (data.points || 0) + stake;
      updates.challengesWon = (data.challengesWon || 0) + 1;
      updates.lastChallengeWinDate = todayStr;
      updates[`dailyPoints/${todayStr}`] = (data.dailyPoints?.[todayStr] || 0) + stake;
    } else {
      updates.points = Math.max(0, (data.points || 0) - stake);
      updates.challengesLost = (data.challengesLost || 0) + 1;
      updates.lastChallengeLossDate = todayStr;
      updates[`dailyPoints/${todayStr}`] = Math.max(0, (data.dailyPoints?.[todayStr] || 0) - stake);
    }

    updates.showChallengeResult = true;
    updates.latestChallengeResult = {
      title: challenge.title,
      status: isTie ? 'tie' : isWinner ? 'win' : 'loss',
      stake: stake,
      timestamp: Date.now()
    };

    await update(uRef, updates);
  };

  if (winnerId === 'tie') {
    await processUser(p1Id, false, true);
    await processUser(p2Id, false, true);
  } else if (winnerId === 'none') {
    await processUser(p1Id, false, false);
    await processUser(p2Id, false, false);
  } else {
    const loserId = winnerId === p1Id ? p2Id : p1Id;
    await processUser(winnerId, true, false);
    await processUser(loserId, false, false);
  }

  await remove(ref(database, `challenges/${challenge.id}`));
}

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
      .filter((c: any) => (c.senderId === user.uid || c.receiverId === user.uid));
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
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const todayStr = new Date().toLocaleDateString('en-CA');
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
      expiresAt: Date.now() + (mins * 60 * 1000)
    });
    update(ref(database, `users/${user.uid}`), { [`dailyTodosCount/${todayStr}`]: todoCountToday + 1 });
    setPostTodoInput('');
  };

  const handleCompleteTodo = (todo: any) => {
    playSound('click');
    const isExpired = Date.now() > todo.expiresAt;
    if (!isExpired) {
      update(ref(database, `users/${user?.uid}`), {
        points: (userData?.points || 0) + 5,
        [`dailyPoints/${todayStr}`]: (userData?.dailyPoints?.[todayStr] || 0) + 5
      });
      toast({ title: "مهمة ناجحة! +5ن 🔥" });
      playSound('success');
    } else {
      toast({ variant: "destructive", title: "انتهى الوقت!" });
    }
    remove(ref(database, `users/${user?.uid}/todos/${todo.id}`));
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

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
            <h3 className="font-black text-primary text-sm">تحدي الماستر العشوائي 🚀</h3>
            <div className="space-y-4">
              <Label className="text-right block text-[10px] font-black opacity-60">1. اختر الفئة</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Fitness', 'Nutrition', 'Behavior', 'Study'].map(t => (
                  <Button key={t} variant={selectedType === t ? 'default' : 'outline'} onClick={() => setSelectedType(t as TrackKey)} className="h-12 rounded-xl font-black text-xs">{t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'تغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}</Button>
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
              if (pool.length === 0) { toast({ title: "لا توجد تحديات حالياً لهذه الفئة" }); return; }
              const random = pool[Math.floor(Math.random() * pool.length)];
              setCurrentChallenge(random); setStep('active'); setTimeLeft(random.time * 60); setTimerActive(true); playSound('click');
            }} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">ابدأ تحدي الماستر 🔥</Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl mx-2">
            <CardHeader className="bg-primary text-white p-5">
              <div className="flex items-center justify-between flex-row-reverse">
                <CardTitle className="text-lg font-black text-right">{currentChallenge.title}</CardTitle>
                {currentChallenge.isTimeLocked && <div className="px-2 py-0.5 bg-red-500 text-white rounded-lg text-[8px] font-black flex items-center gap-1 shadow-sm"><Lock size={10} /> التزام كامل</div>}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-base font-bold text-muted-foreground leading-relaxed text-right">{currentChallenge.description}</p>
              <div className="bg-secondary/30 p-6 rounded-[2rem] text-center"><p className="text-5xl font-black text-primary font-mono">{formatTime(timeLeft)}</p></div>
              <Button 
                onClick={() => {
                  update(ref(database, `users/${user?.uid}`), { points: (userData?.points || 0) + currentChallenge.points });
                  setStep('done'); setTimerActive(false); playSound('success');
                }} 
                disabled={currentChallenge.isTimeLocked && timeLeft > 0}
                className="w-full h-14 rounded-2xl bg-accent text-lg font-black shadow-lg"
              >
                {(currentChallenge.isTimeLocked && timeLeft > 0) ? "انتظر إكمال الوقت..." : "أنهيت المهمة 🔥"}
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-3">
            <h2 className="text-lg font-black text-primary flex items-center gap-2"> <ListChecks size={20} /> مهامي الموقوتة (+5ن) </h2>
            <div className="text-[9px] font-black text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{isPremium ? "∞" : `${5 - todoCountToday}/5 متبقي`}</div>
          </header>
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5 mx-2">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input placeholder="اسم المهمة..." className="flex-1 h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs" value={todoInput} onChange={(e) => setPostTodoInput(e.target.value)} />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shrink-0"> <Plus size={20} /> </Button>
            </form>
            <div className="space-y-2">
              {todosData ? Object.values(todosData).map((todo: any) => (
                <TodoItem key={todo.id} todo={todo} onComplete={handleCompleteTodo} />
              )) : <p className="text-center py-4 opacity-30 text-[10px] font-black">لا توجد مهام حالية</p>}
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
      if (diff <= 0) { setRemaining(0); setExpired(true); clearInterval(itv); }
      else setRemaining(diff);
    }, 1000);
    return () => clearInterval(itv);
  }, [todo.expiresAt]);
  const format = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-xl transition-all", expired ? "bg-red-50 opacity-60" : "bg-secondary/20")}>
      <div className="flex items-center gap-3">
        <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-lg text-white shadow-sm", expired ? "bg-red-400" : "bg-primary")}>{expired ? "انتهى" : format(remaining)}</span>
        <button onClick={() => onComplete(todo)} className="w-6 h-6 rounded-lg bg-white border-2 border-primary/20 hover:border-primary shadow-sm" />
      </div>
      <span className={cn("font-bold text-[11px] text-right flex-1 mr-3", expired ? "text-red-900 line-through" : "text-primary")}>{todo.title}</span>
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
  const hasIUploaded = (challenge.senderId === currentUser?.uid && challenge.senderFinished) || 
                       (challenge.receiverId === currentUser?.uid && challenge.receiverFinished);

  const isOpponentWaitingForMe = isWinnerSet && !isMineWinner && !hasIUploaded;
  const amIWaitingForOpponent = isWinnerSet && isMineWinner && challenge.status === 'active';
  const awaitingConfirmation = challenge.status === 'awaiting_confirmation';
  const isOpponentActive = !isWinnerSet && challenge.status === 'active';

  useEffect(() => {
    if (!isActive || hasIUploaded) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      let limit = (challenge.duration || 15) * 60 * 1000;
      let start = challenge.acceptedAt;
      
      if (isWinnerSet && !isMineWinner) {
        limit = challenge.winnerTime;
        start = currentUser.uid === challenge.senderId ? challenge.senderStartTime : challenge.receiverStartTime;
      }
      
      const elapsed = now - start;
      const rem = Math.max(0, Math.floor((limit - elapsed) / 1000));
      setTimeLeft(rem);
      
      if (rem <= 0 && !isWinnerSet && !isProcessing) {
        concludeChallenge(database, challenge, 'none');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, challenge, currentUser, isWinnerSet, isMineWinner, isProcessing, database, hasIUploaded]);

  const handleWithdraw = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const winnerId = currentUser.uid === challenge.senderId ? challenge.receiverId : challenge.senderId;
    concludeChallenge(database, challenge, winnerId);
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const timeUsed = Date.now() - (currentUser.uid === challenge.senderId ? challenge.senderStartTime : challenge.receiverStartTime);
      
      const updates: any = {};
      if (currentUser.uid === challenge.senderId) updates.senderFinished = true;
      else updates.receiverFinished = true;

      updates.winnerId = currentUser.uid;
      updates.winnerName = currentUser.displayName || 'بطل جديد';
      updates.winnerTime = timeUsed;
      updates.proof = base64;
      updates.status = 'awaiting_confirmation'; // ننتقل لمرحلة تأكيد الخصم

      await update(ref(database, `challenges/${challenge.id}`), updates);
      setIsProcessing(false);
      playSound('success');
    };
  };

  const handleAcceptOpponentProof = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    concludeChallenge(database, challenge, challenge.winnerId);
  };

  const handleRejectOpponentProof = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await update(ref(database, `challenges/${challenge.id}`), {
      status: 'awaiting_recognition' // يرسل للمحاكمة
    });
    setIsProcessing(false);
    toast({ title: "تم إرسال النزاع للمحاكمة ⚖️" });
  };

  return (
    <Card className="rounded-[2.5rem] border-2 border-primary/10 bg-card p-5 shadow-lg relative overflow-hidden">
      {/* شريط الحالة العلوية */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-right">
          <p className="text-xs font-black text-primary">{challenge.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-lg border border-orange-100">الرهان: {challenge.pointsStake}ن</span>
            {isOpponentActive && <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-lg border border-blue-100 animate-pulse">الخصم يتحدى حالياً 🏃‍♂️</span>}
          </div>
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 border shadow-sm",
          hasIUploaded ? "bg-secondary text-muted-foreground border-border" : "bg-primary text-white border-primary/20"
        )}>
          <Timer size={14} className={cn(!hasIUploaded && "animate-pulse")} /> 
          {hasIUploaded ? "موقوف" : formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-3">
        {/* الحالة 1: بانتظار اعتراف الخصم أو ردي أنا */}
        {awaitingConfirmation ? (
          isMineWinner ? (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center space-y-2">
              <Loader2 className="animate-spin text-blue-600 mx-auto" size={20} />
              <p className="text-[10px] font-black text-blue-800">لقد رفعت إثباتك.. نحن بانتظار قرار الخصم ⌛</p>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-orange-200 shadow-sm shrink-0">
                  <img src={challenge.proof} className="w-full h-full object-cover" alt="Proof" />
                </div>
                <div className="text-right flex-1">
                  <p className="text-[10px] font-black text-orange-900">الخصم يزعم الانتصار! ⚔️</p>
                  <p className="text-[8px] font-bold text-orange-700">هل تقبل بصحة هذا الإثبات؟</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAcceptOpponentProof} disabled={isProcessing} className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 font-black text-[10px] gap-2 shadow-md"> <CheckCircle2 size={14}/> نعم، أقبل </Button>
                <Button onClick={handleRejectOpponentProof} disabled={isProcessing} variant="outline" className="flex-1 h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] gap-2"> <XCircle size={14}/> لا، اعتراض! </Button>
              </div>
            </div>
          )
        ) : challenge.status === 'awaiting_recognition' ? (
          <div className="space-y-2">
            <div className="bg-red-50 text-red-700 p-3 rounded-2xl flex items-center justify-center font-black text-[10px] gap-2 border border-red-100">
              <Gavel size={14} /> النزاع معروض في المحاكمة المجتمعية ⚖️
            </div>
            <Link href="/chat/trials" className="block">
              <Button variant="outline" className="w-full h-12 rounded-xl font-black text-xs gap-2 border-2 border-primary/20 hover:bg-primary/5"> اذهب للتصويت </Button>
            </Link>
          </div>
        ) : hasIUploaded ? (
          <div className="w-full h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black text-[10px] gap-2 border border-green-100">
            <CheckCircle size={14} /> تم رفع الإثبات.. بانتظار الخصم ⌛
          </div>
        ) : (
          <div className="space-y-2">
            {isWinnerSet && !isMineWinner && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-2 text-center">
                <p className="text-[9px] font-black text-red-600 animate-bounce">الخصم حطم الرقم! يجب أن تنهي في أقل من {formatTime(timeLeft)} 🔥</p>
              </div>
            )}
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full h-14 rounded-2xl bg-primary font-black text-xs gap-3 shadow-xl hover:bg-primary/90">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Camera size={20} />} رفع الإثبات 📸
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadProof} />
            <Button onClick={handleWithdraw} variant="ghost" className="w-full h-10 text-destructive/60 font-bold text-[10px] hover:bg-destructive/5">
              انسحاب 🏳️ (خسارة فورية)
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
