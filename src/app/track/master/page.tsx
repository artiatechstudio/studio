"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, CheckCircle, ListChecks, Plus, Crown, Clock, XCircle, Trash2, Swords, Timer, Camera, Loader2, AlertTriangle, ShieldCheck, Trophy, LogOut, Lock } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get, remove, set } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function MasterTrackPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'setup' | 'active' | 'done'>('setup');
  const [selectedType, setSelectedType] = useState<TrackKey>('Fitness');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'سهل' | 'متوسط' | 'صعب'>('سهل');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [todoInput, setTodoInput] = useState('');
  const [todoMinutes, setTodoMinutes] = useState('10');

  const [resultDialog, setResultDialog] = useState<{ open: boolean, data: any | null }>({ open: false, data: null });

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
        ['active', 'awaiting_recognition', 'pending_acceptance', 'concluded'].includes(c.status)
      );
  }, [allChallengesData, user]);

  useEffect(() => {
    const concluded = activePvPChallenges.find(c => c.status === 'concluded' && !c.resultShownTo?.[user?.uid || '']);
    if (concluded && !resultDialog.open && user) {
      setResultDialog({ open: true, data: concluded });
      update(ref(database, `challenges/${concluded.id}/resultShownTo`), {
        [user.uid]: true
      });
    }
  }, [activePvPChallenges, resultDialog.open, user, database]);

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
  const today = new Date().toLocaleDateString('en-CA');
  const masterCountToday = userData?.dailyMasterCount?.[today] || 0;

  const updateStreakAndPoints = useCallback(async (pointsToAdd: number) => {
    if (!user || !userData) return;
    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    let newStreak = userData.streak || 0;
    if (userData.lastActiveDate !== todayStr) {
      newStreak = userData.lastActiveDate === yesterdayStr ? newStreak + 1 : 1;
    }
    const updates: any = {
      points: (userData.points || 0) + pointsToAdd,
      [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + pointsToAdd,
      lastActiveDate: todayStr,
      streak: newStreak,
      [`dailyMasterCount/${todayStr}`]: masterCountToday + 1
    };
    await update(ref(database, `users/${user.uid}`), updates);
  }, [user, userData, database, masterCountToday]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 400;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h *= MAX/w; w = MAX; } }
          else { if (h > MAX) { w *= MAX/h; h = MAX; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
      reader.onerror = reject;
    });
  };

  const handlePvPAction = async (challenge: any, action: 'complete' | 'recognize' | 'dispute' | 'withdraw') => {
    if (!user || !userData) return;
    playSound('click');
    const isSender = challenge.senderId === user.uid;
    const todayStr = new Date().toLocaleDateString('en-CA');

    if (action === 'withdraw') {
      const confirmed = window.confirm("هل أنت متأكد من الانسحاب؟ سيتم خصم نقاط الرهان كعقوبة! 🛑");
      if (!confirmed) return;
      
      const penalty = challenge.pointsStake;
      await update(ref(database, `users/${user.uid}`), {
        points: Math.max(0, (userData.points || 0) - penalty),
        challengesLost: (userData.challengesLost || 0) + 1,
        lastChallengeLossDate: todayStr,
        [`dailyPoints/${todayStr}`]: Math.max(0, (userData.dailyPoints?.[todayStr] || 0) - penalty)
      });
      await remove(ref(database, `challenges/${challenge.id}`));
      toast({ variant: "destructive", title: "تم الانسحاب وخصم النقاط" });
      return;
    }

    if (action === 'complete') {
      fileInputRef.current?.click();
      return;
    }

    if (action === 'recognize') {
      const winnerId = isSender ? challenge.receiverId : challenge.senderId;
      const loserId = user.uid;
      const points = challenge.pointsStake;

      const winnerRef = ref(database, `users/${winnerId}`);
      const wSnap = await get(winnerRef);
      const wData = wSnap.val();
      
      await update(winnerRef, {
        points: (wData.points || 0) + points,
        challengesWon: (wData.challengesWon || 0) + 1,
        [`dailyPoints/${todayStr}`]: (wData.dailyPoints?.[todayStr] || 0) + points
      });

      await update(ref(database, `users/${loserId}`), {
        points: Math.max(0, (userData.points || 0) - points),
        challengesLost: (userData.challengesLost || 0) + 1,
        lastChallengeLossDate: todayStr,
        [`dailyPoints/${todayStr}`]: Math.max(0, (userData.dailyPoints?.[todayStr] || 0) - points)
      });

      await update(ref(database, `challenges/${challenge.id}`), {
        status: 'concluded',
        winnerId,
        loserId,
        concludedAt: serverTimestamp()
      });
      
      toast({ title: "تم الاعتراف بالنتيجة ✅" });
      playSound('success');
    }

    if (action === 'dispute') {
      const winnerId = isSender ? challenge.receiverId : challenge.senderId;
      const proof = isSender ? challenge.receiverProof : challenge.senderProof;
      
      const postRef = push(ref(database, 'publicPosts'));
      await set(postRef, {
        id: postRef.key,
        type: 'dispute',
        challengeId: challenge.id,
        title: challenge.title,
        challengerName: isSender ? challenge.receiverName : challenge.senderName,
        challengerId: winnerId,
        defenderName: userData.name,
        defenderId: user.uid,
        proof: proof,
        points: challenge.pointsStake,
        votes: { [challenge.senderId]: 0, [challenge.receiverId]: 0 },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        timestamp: serverTimestamp()
      });

      await update(ref(database, `challenges/${challenge.id}`), { status: 'disputed' });
      toast({ title: "تم رفع النزاع للمحاكمة! 🌍" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, challengeId: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const challenge = allChallengesData[challengeId];
    const isSender = challenge.senderId === user.uid;

    try {
      const b64 = await compressImage(file);
      const updates: any = {};
      const now = Date.now();
      const startTime = isSender ? challenge.senderStartTime : challenge.receiverStartTime;
      const timeTaken = Math.round((now - (startTime || now)) / 1000);

      updates[`challenges/${challengeId}/status`] = 'awaiting_recognition';
      
      if (isSender) {
        updates[`challenges/${challengeId}/senderProof`] = b64;
        updates[`challenges/${challengeId}/senderTimeTaken`] = timeTaken;
      } else {
        updates[`challenges/${challengeId}/receiverProof`] = b64;
        updates[`challenges/${challengeId}/receiverTimeTaken`] = timeTaken;
      }

      await update(ref(database), updates);
      toast({ title: "تم رفع الدليل وتوقف المؤقت! 📸" });
      playSound('success');
    } catch (err) {
      toast({ variant: "destructive", title: "فشل رفع الصورة" });
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;
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
    setTodoInput('');
  };

  const handleCompleteTodo = (todo: any) => {
    playSound('click');
    const isExpired = Date.now() > todo.expiresAt;
    
    if (isExpired) {
      toast({ variant: "destructive", title: "انتهى الوقت!", description: "لم تحصل على نقاط لأن المهمة تجاوزت وقتها." });
    } else {
      updateStreakAndPoints(5);
      toast({ title: "مهمة ناجحة! +5ن 🔥" });
      playSound('success');
    }
    remove(ref(database, `users/${user?.uid}/todos/${todo.id}`));
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
              <p className="text-[8px] font-bold text-muted-foreground uppercase">تحديات الأساطير والمهام الشخصية</p>
            </div>
          </div>
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        {activePvPChallenges.length > 0 && (
          <section className="mx-2 space-y-3">
            <h3 className="font-black text-primary text-sm flex items-center gap-2 px-2"> <ShieldCheck className="text-accent" size={18} /> ساحة المواجهة المباشرة ⚔️</h3>
            <div className="grid grid-cols-1 gap-4">
              {activePvPChallenges.map((pvp: any) => (
                <BattleCard 
                  key={pvp.id} 
                  challenge={pvp} 
                  currentUser={user} 
                  onAction={handlePvPAction}
                  fileInputRef={fileInputRef}
                  onUpload={(e) => handleFileUpload(e, pvp.id)}
                />
              ))}
            </div>
          </section>
        )}

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-6 mx-2">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-primary text-sm">تحديات الأساطير 👑</h3>
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
              if (pool.length === 0) { toast({ title: "لا توجد تحديات متوفرة لهذه الفئة حالياً" }); return; }
              const random = pool[Math.floor(Math.random() * pool.length)];
              setCurrentChallenge(random);
              setStep('active');
              setTimeLeft(random.time * 60);
              setTimerActive(true);
              playSound('click');
            }} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">تحدي عشوائي للأساطير 🚀</Button>
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
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => { setStep('done'); updateStreakAndPoints(currentChallenge.points); setTimerActive(false); playSound('success'); }} 
                  disabled={currentChallenge.isTimeLocked && timeLeft > 0}
                  className={cn(
                    "w-full h-14 rounded-2xl text-lg font-black shadow-lg transition-all",
                    (currentChallenge.isTimeLocked && timeLeft > 0) ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-accent text-white"
                  )}
                >
                  {(currentChallenge.isTimeLocked && timeLeft > 0) ? `انتظر اكتمال الوقت... (${Math.ceil(timeLeft / 60)}د)` : "أنهيت المهمة 🔥"}
                </Button>
                <Button onClick={() => { setStep('setup'); setTimerActive(false); setTimeLeft(0); }} variant="ghost" className="text-destructive font-black text-xs">انسحاب (لا توجد عقوبة هنا)</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-3">
            <h2 className="text-lg font-black text-primary flex items-center gap-2"> <ListChecks size={20} /> مهامي الموقوتة (+5ن) </h2>
          </header>
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5 mx-2">
            <form onSubmit={handleAddTodo} className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="اسم المهمة..." className="flex-1 h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs" value={todoInput} onChange={(e) => setTodoInput(e.target.value)} />
                <div className="w-20">
                  <Input type="number" placeholder="د" className="h-11 rounded-xl bg-secondary/50 border-none font-bold text-center text-xs" value={todoMinutes} onChange={(e) => setTodoMinutes(e.target.value)} />
                </div>
                <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-lg shrink-0"> <Plus size={20} /> </Button>
              </div>
            </form>
            <div className="space-y-2">
              {todosData ? Object.values(todosData).map((todo: any) => (
                <TodoItem key={todo.id} todo={todo} onComplete={handleCompleteTodo} />
              )) : <p className="text-center py-4 opacity-30 text-[10px] font-black">لا توجد مهام حالية</p>}
            </div>
          </Card>
        </section>
      </div>

      <Dialog open={resultDialog.open} onOpenChange={(o) => { if(!o) setResultDialog({ open: false, data: null }); }}>
        <DialogContent className="rounded-[3rem] p-10 text-center max-w-sm" dir="rtl">
          <DialogHeader>
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy size={48} />
            </div>
            <DialogTitle className="text-2xl font-black text-primary">تم حسم المبارزة! ⚔️</DialogTitle>
            <DialogDescription className="text-base font-bold text-muted-foreground mt-4 leading-relaxed">
              تحدي: <span className="text-primary">{resultDialog.data?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <p className="text-xs font-black text-green-800">الفائز المستحق 🏆</p>
              <p className="text-lg font-black text-green-600">{resultDialog.data?.winnerId === resultDialog.data?.senderId ? resultDialog.data?.senderName : resultDialog.data?.receiverName}</p>
              <p className="text-[10px] font-bold text-green-700">حصل على {resultDialog.data?.pointsStake} نقطة</p>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-xs font-black text-red-800">الخاسر المكافح ❌</p>
              <p className="text-lg font-black text-red-600">{resultDialog.data?.loserId === resultDialog.data?.senderId ? resultDialog.data?.senderName : resultDialog.data?.receiverName}</p>
              <p className="text-[10px] font-bold text-red-700">خصم منه {resultDialog.data?.pointsStake} نقطة</p>
            </div>
          </div>
          <Button onClick={() => setResultDialog({ open: false, data: null })} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-lg">فهمت 🐱✅</Button>
        </DialogContent>
      </Dialog>
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

function BattleCard({ challenge, currentUser, onAction, fileInputRef, onUpload }: { challenge: any, currentUser: any, onAction: any, fileInputRef: any, onUpload: any }) {
  const isSender = challenge.senderId === currentUser.uid;
  const myProof = isSender ? challenge.senderProof : challenge.receiverProof;
  const myTimeTaken = isSender ? challenge.senderTimeTaken : challenge.receiverTimeTaken;
  const opponentProof = isSender ? challenge.receiverProof : challenge.senderProof;
  const opponentTimeTaken = isSender ? challenge.receiverTimeTaken : challenge.senderTimeTaken;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSyncing, setIsSenderWaiting] = useState(isSender && !challenge.senderStartTime);
  const { database } = useFirebase();

  useEffect(() => {
    if (isSyncing && challenge.status === 'active') {
      update(ref(database, `challenges/${challenge.id}`), { senderStartTime: Date.now() });
      setIsSenderWaiting(false);
    }
  }, [challenge, isSyncing, database]);

  useEffect(() => {
    const startTime = isSender ? challenge.senderStartTime : challenge.receiverStartTime;
    if (!startTime || myProof || challenge.status === 'concluded') return;

    const baseDurationMins = challenge.duration;
    let limitSeconds = baseDurationMins * 60;
    if (opponentProof && opponentTimeTaken) { limitSeconds = opponentTimeTaken; }

    const expiresAt = startTime + (limitSeconds * 1000);
    const itv = setInterval(() => {
      const diff = Math.round((expiresAt - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(itv);
  }, [challenge, isSender, myProof, opponentProof, opponentTimeTaken]);

  const format = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;
  if (challenge.status === 'concluded') return null;

  const isOpponentFaster = opponentProof && (!myProof || (myTimeTaken && opponentTimeTaken && opponentTimeTaken < myTimeTaken));
  const showOpponentProofToMe = opponentProof && (isOpponentFaster || challenge.status === 'awaiting_recognition');

  return (
    <Card className="rounded-3xl border-2 border-primary/10 bg-card overflow-hidden shadow-2xl">
      <div className={cn("p-4 text-white flex items-center justify-between", myProof ? "bg-green-600" : "bg-primary")}>
        <div className="flex items-center gap-2">
          {myProof ? <CheckCircle size={16} /> : <Clock size={16} className="animate-pulse" />}
          <span className="text-sm font-black font-mono">{myProof ? `زمنك: ${format(myTimeTaken || 0)}` : `المتبقي: ${format(timeLeft)}`}</span>
        </div>
        <p className="text-[10px] font-black uppercase">ضد {isSender ? challenge.receiverName : challenge.senderName}</p>
      </div>
      
      <CardContent className="p-6 space-y-5">
        <div className="text-right">
          <h4 className="font-black text-primary text-lg leading-tight">{challenge.title}</h4>
          <div className="flex items-center justify-between mt-2 flex-row-reverse">
            <p className="text-[10px] font-bold text-muted-foreground">الرهان: <span className="text-orange-600">{challenge.pointsStake} نقطة</span></p>
            {opponentProof && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg text-[9px] font-black">رقم الخصم: {format(opponentTimeTaken)} 🔥</span>}
          </div>
        </div>

        {challenge.status === 'pending_acceptance' ? (
          <div className="bg-secondary/20 p-4 rounded-xl text-center text-[10px] font-bold">بانتظار قبول الخصم... ⏳</div>
        ) : isSyncing ? (
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center space-y-2">
            <Loader2 className="animate-spin text-orange-600 mx-auto" />
            <p className="text-xs font-black text-orange-800">بانتظار مزامنة مؤقتك...</p>
          </div>
        ) : !myProof ? (
          <div className="space-y-3">
            {opponentProof && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-right">
                <p className="text-[10px] font-black text-blue-800 flex items-center justify-end gap-2"> <Sparkles size={12}/> الخصم حطم الرقم! تفوق عليه في أقل من {format(opponentTimeTaken)}</p>
              </div>
            )}
            <div className="bg-secondary/30 p-4 rounded-2xl text-center border-dashed border-2 border-primary/20">
              <Button onClick={() => onAction(challenge, 'complete')} className="w-full h-12 rounded-xl bg-primary font-black gap-2 shadow-lg">
                <Camera size={18} /> رفع إثبات الإنجاز
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onUpload} />
            </div>
            <Button onClick={() => onAction(challenge, 'withdraw')} variant="ghost" className="w-full text-destructive font-black text-[10px] gap-2"> <LogOut size={14} className="rotate-180" /> انسحاب من التحدي </Button>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-2" />
            <p className="text-xs font-black text-green-800">لقد رفعت دليلك! بانتظار حسم النتيجة.</p>
          </div>
        )}

        {showOpponentProofToMe && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="text-right">
                <p className="text-[10px] font-black text-primary">دليل الخصم الأسرع! 📸</p>
                <p className="text-[8px] font-bold text-muted-foreground">حقق المهمة في {format(opponentTimeTaken)}</p>
              </div>
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm">
                <img src={opponentProof} className="w-full h-full object-cover" alt="Proof" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onAction(challenge, 'recognize')} className="flex-1 h-10 rounded-xl bg-green-600 font-black text-[10px]">اعترف بالهزيمة ✅</Button>
              <Button onClick={() => onAction(challenge, 'dispute')} variant="outline" className="flex-1 h-10 rounded-xl border-red-200 text-red-600 font-black text-[10px]">كذب (المحاكمة) ❌</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
