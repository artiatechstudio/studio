
"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, CheckCircle, ListChecks, Plus, Crown, Clock, XCircle, Trash2, Swords, Timer, Camera, Loader2, AlertTriangle, Scale, ShieldCheck, Eye } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get, remove, set } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const hasAutoCompletedMaster = useRef(false);

  const [todoInput, setTodoInput] = useState('');
  const [todoMinutes, setTodoMinutes] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const todosRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/todos`) : null, [user, database]);
  const { data: todosData } = useDatabase(todosRef);

  const challengesRef = useMemoFirebase(() => ref(database, 'challenges'), [database]);
  const { data: allChallengesData } = useDatabase(challengesRef);

  // التحديات الثنائية النشطة التي تتعلق بالمستخدم
  const activePvPChallenges = useMemo(() => {
    if (!allChallengesData || !user) return [];
    return Object.entries(allChallengesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((c: any) => 
        (c.senderId === user.uid || c.receiverId === user.uid) && 
        ['active', 'awaiting_recognition', 'pending_acceptance'].includes(c.status)
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
    if (userData.lastActiveDate !== todayStr) {
      newStreak = userData.lastActiveDate === yesterdayStr ? newStreak + 1 : 1;
    }
    const updates: any = {
      points: (userData.points || 0) + pointsToAdd,
      [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + pointsToAdd,
      lastActiveDate: todayStr,
      streak: newStreak
    };
    await update(ref(database, `users/${user.uid}`), updates);
  }, [user, userData, database]);

  // منطق معالجة الصور
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

  const handlePvPAction = async (challenge: any, action: 'complete' | 'fail' | 'recognize' | 'dispute') => {
    if (!user) return;
    playSound('click');
    const isSender = challenge.senderId === user.uid;
    const todayStr = new Date().toLocaleDateString('en-CA');

    if (action === 'complete') {
      fileInputRef.current?.click();
      // يتم إكمال الإجراء في handleFileUpload
      return;
    }

    if (action === 'recognize') {
      const winnerId = isSender ? challenge.receiverId : challenge.senderId;
      const loserId = user.uid;
      const points = challenge.pointsStake;

      // تحديث الفائز
      const winnerRef = ref(database, `users/${winnerId}`);
      const wSnap = await get(winnerRef);
      const wData = wSnap.val();
      await update(winnerRef, {
        points: (wData.points || 0) + points,
        challengesWon: (wData.challengesWon || 0) + 1,
        [`dailyPoints/${todayStr}`]: (wData.dailyPoints?.[todayStr] || 0) + points
      });

      // تحديث الخاسر (الحالي)
      await update(ref(database, `users/${loserId}`), {
        points: Math.max(0, (userData.points || 0) - points),
        challengesLost: (userData.challengesLost || 0) + 1,
        lastChallengeLossDate: todayStr,
        [`dailyPoints/${todayStr}`]: Math.max(0, (userData.dailyPoints?.[todayStr] || 0) - points)
      });

      await remove(ref(database, `challenges/${challenge.id}`));
      toast({ title: "تم الاعتراف بالنتيجة ✅", description: "تم توزيع النقاط وتحديث السجلات." });
      playSound('success');
    }

    if (action === 'dispute') {
      const winnerId = isSender ? challenge.receiverId : challenge.senderId;
      const proof = isSender ? challenge.receiverProof : challenge.senderProof;
      
      // إنشاء منشور نزاع عام
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
      toast({ title: "تم رفع النزاع للمجتمع! 🌍", description: "سيقرر الجمهور النتيجة خلال 24 ساعة." });
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
      const timeTaken = Math.round((now - startTime) / 1000);

      updates[`challenges/${challengeId}/status`] = 'awaiting_recognition';
      if (isSender) {
        updates[`challenges/${challengeId}/senderProof`] = b64;
        updates[`challenges/${challengeId}/senderTimeTaken`] = timeTaken;
      } else {
        updates[`challenges/${challengeId}/receiverProof`] = b64;
        updates[`challenges/${challengeId}/receiverTimeTaken`] = timeTaken;
      }

      await update(ref(database), updates);
      toast({ title: "تم رفع الدليل! 📸", description: "بانتظار مراجعة الخصم." });
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

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40 overflow-x-hidden" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
              <Swords size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المسار العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">المبارزات والمهام الحرة</p>
            </div>
          </div>
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        {/* قسم المبارزات النشطة المطور */}
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

        {/* المهام الفردية (Master) - باختصار */}
        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-6 mx-2">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-primary text-sm">تحديات الأساطير (Master)</h3>
               <div className="bg-secondary px-3 py-1 rounded-full text-[10px] font-black text-primary">المتبقي: {isPremium ? "∞" : `${Math.max(0, 5 - masterCountToday)}/5`}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Fitness', 'Nutrition', 'Behavior', 'Study'].map(t => (
                <Button key={t} variant={selectedType === t ? 'default' : 'outline'} onClick={() => setSelectedType(t as TrackKey)} className="h-12 rounded-xl font-black text-xs">{t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'التغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}</Button>
              ))}
            </div>
            <Button onClick={() => { 
              const pool = getMasterPool(selectedType, selectedDifficulty);
              const random = pool[Math.floor(Math.random() * pool.length)];
              setCurrentChallenge(random);
              setStep('active');
              setTimeLeft(random.time * 60);
              setTimerActive(true);
              playSound('click');
            }} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">تحدي عشوائي 🚀</Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl mx-2">
            <CardHeader className="bg-primary text-white p-5"><CardTitle className="text-lg font-black leading-tight text-right">{currentChallenge.title}</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-base font-bold text-muted-foreground leading-relaxed text-right">{currentChallenge.description}</p>
              <div className="bg-secondary/30 p-6 rounded-[2rem] text-center space-y-1">
                <p className="text-5xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
              </div>
              <Button onClick={() => { setStep('done'); updateStreakAndPoints(currentChallenge.points); setTimerActive(false); playSound('success'); }} className="w-full h-14 rounded-2xl text-lg font-black bg-accent text-white shadow-lg">أنهيت المهمة 🔥</Button>
            </CardContent>
          </Card>
        )}

        {/* قائمة المهام الشخصية - بسيطة */}
        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-3">
            <h2 className="text-lg font-black text-primary flex items-center gap-2"> <ListChecks size={20} /> مهامي الشخصية </h2>
          </header>
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5 mx-2">
            <form onSubmit={(e) => { e.preventDefault(); if(!todoInput.trim()) return; playSound('click'); const newTodoRef = push(ref(database, `users/${user?.uid}/todos`)); set(newTodoRef, { id: newTodoRef.key, title: todoInput.trim(), timestamp: Date.now(), expiry: Date.now() + (todoMinutes ? parseInt(todoMinutes)*60000 : 24*60*60*1000) }); setTodoInput(''); setTodoMinutes(''); }} className="flex gap-2">
              <Input placeholder="أضف مهمة..." className="flex-1 h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs" value={todoInput} onChange={(e) => setTodoInput(e.target.value)} />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-lg shrink-0"> <Plus size={20} /> </Button>
            </form>
            <div className="space-y-2">
              {todosData ? Object.values(todosData).map((todo: any) => (
                <div key={todo.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                  <button onClick={() => { playSound('click'); remove(ref(database, `users/${user?.uid}/todos/${todo.id}`)); updateStreakAndPoints(5); toast({ title: "مهمة ناجحة! +5ن 🔥" }); }} className="w-6 h-6 rounded-lg bg-white border-2 border-primary/20" />
                  <span className="font-bold text-[11px] text-primary text-right flex-1 mr-3">{todo.title}</span>
                </div>
              )) : <p className="text-center py-4 opacity-30 text-[10px] font-black">لا توجد مهام</p>}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function BattleCard({ challenge, currentUser, onAction, fileInputRef, onUpload }: { challenge: any, currentUser: any, onAction: any, fileInputRef: any, onUpload: any }) {
  const isSender = challenge.senderId === currentUser.uid;
  const startTime = isSender ? challenge.senderStartTime : challenge.receiverStartTime;
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSyncing, setIsSenderWaiting] = useState(isSender && !challenge.senderStartTime);

  useEffect(() => {
    if (isSyncing && challenge.receiverStartTime) {
      // الطالب فتح التطبيق بعد موافقة الخصم -> بدأ وقت الطالب
      update(ref(get(ref(currentUser.database)).database, `challenges/${challenge.id}`), {
        senderStartTime: Date.now()
      });
      setIsSenderWaiting(false);
    }
  }, [challenge, isSyncing, currentUser.database]);

  useEffect(() => {
    if (!startTime) return;
    const expires = startTime + (challenge.duration * 60 * 1000);
    const itv = setInterval(() => {
      const diff = Math.round((expires - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(itv);
  }, [startTime, challenge.duration]);

  const format = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;
  const myProof = isSender ? challenge.senderProof : challenge.receiverProof;
  const opponentProof = isSender ? challenge.receiverProof : challenge.senderProof;

  return (
    <Card className="rounded-3xl border-2 border-primary/10 bg-card overflow-hidden shadow-2xl">
      <div className="p-4 bg-primary text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="animate-pulse" />
          <span className="text-sm font-black font-mono">{format(timeLeft)}</span>
        </div>
        <p className="text-[10px] font-black uppercase">مبارزة ضد {isSender ? challenge.receiverName : challenge.senderName}</p>
      </div>
      
      <CardContent className="p-6 space-y-5">
        <div className="text-right">
          <h4 className="font-black text-primary text-lg leading-tight">{challenge.title}</h4>
          <p className="text-[10px] font-bold text-muted-foreground mt-1">الرهان: <span className="text-orange-600">{challenge.pointsStake} نقطة</span></p>
        </div>

        {isSyncing ? (
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center space-y-2">
            <Loader2 className="animate-spin text-orange-600 mx-auto" />
            <p className="text-xs font-black text-orange-800">بانتظار موافقة الخصم لبدء مؤقتك...</p>
          </div>
        ) : !myProof ? (
          <div className="space-y-3">
            <div className="bg-secondary/30 p-4 rounded-2xl text-center border-dashed border-2 border-primary/20">
              <p className="text-[10px] font-black text-primary mb-2">أكمل المهمة ثم ارفع الدليل</p>
              <Button onClick={() => onAction(challenge, 'complete')} className="w-full h-12 rounded-xl bg-primary font-black gap-2">
                <Camera size={18} /> رفع إثبات الإنجاز
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onUpload} />
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-2" />
            <p className="text-xs font-black text-green-800">تم رفع دليلك! بانتظار الخصم.</p>
          </div>
        )}

        {opponentProof && challenge.status === 'awaiting_recognition' && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between flex-row-reverse">
              <p className="text-[10px] font-black text-primary">دليل الخصم وصل! 📸</p>
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                <img src={opponentProof} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onAction(challenge, 'recognize')} className="flex-1 h-10 rounded-xl bg-green-600 font-black text-[10px]">اعترف بالهزيمة ✅</Button>
              <Button onClick={() => onAction(challenge, 'dispute')} variant="outline" className="flex-1 h-10 rounded-xl border-red-200 text-red-600 font-black text-[10px]">كذب (نزاع عام) ❌</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
