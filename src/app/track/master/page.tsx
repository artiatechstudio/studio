
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ListChecks, Plus, Swords, Timer, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, get, remove, set } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
    if (isWinner) {
      updates.points = (data.points || 0) + stake;
      updates.challengesWon = (data.challengesWon || 0) + 1;
      updates[`dailyPoints/${todayStr}`] = (data.dailyPoints?.[todayStr] || 0) + stake;
    } else if (winnerId !== 'tie') {
      updates.points = Math.max(0, (data.points || 0) - stake);
      updates.challengesLost = (data.challengesLost || 0) + 1;
      updates[`dailyPoints/${todayStr}`] = Math.max(0, (data.dailyPoints?.[todayStr] || 0) - stake);
    }

    updates.showChallengeResult = true;
    updates.latestChallengeResult = { title: challenge.title, status: isTie ? 'tie' : isWinner ? 'win' : 'loss', stake: stake, timestamp: Date.now() };
    await update(uRef, updates);
  };

  if (winnerId === 'tie') { await processUser(p1Id, false, true); await processUser(p2Id, false, true); }
  else if (winnerId === 'none') { await processUser(p1Id, false, false); await processUser(p2Id, false, false); }
  else { await processUser(winnerId, true, false); await processUser(winnerId === p1Id ? p2Id : p1Id, false, false); }

  await remove(ref(database, `challenges/${challenge.id}`));
}

export default function MasterTrackPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'active' | 'done'>('setup');
  const [selectedType, setSelectedType] = useState<TrackKey>('Fitness');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'سهل' | 'متوسط' | 'صعب'>('سهل');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [todoInput, setPostTodoInput] = useState('');

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const todosRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/todos`) : null, [user, database]);
  const { data: todosData } = useDatabase(todosRef);

  const challengesRef = useMemoFirebase(() => ref(database, 'challenges'), [database]);
  const { data: allChallengesData } = useDatabase(challengesRef);

  const activePvP = useMemo(() => {
    if (!allChallengesData || !user) return [];
    return Object.entries(allChallengesData).map(([id, val]: [string, any]) => ({ id, ...val })).filter((c: any) => (c.senderId === user.uid || c.receiverId === user.uid));
  }, [allChallengesData, user]);

  const isPremium = userData?.isPremium === 1 || userData?.name === 'admin';
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todoCountToday = userData?.dailyTodosCount?.[todayStr] || 0;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;
    if (!isPremium && todoCountToday >= 5) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد اليومي 🛑", 
        description: "اشترك في بريميوم لفتح مهام غير محدودة وزيادة نقاطك بسرعة!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }
    playSound('click');
    const newTodoRef = push(ref(database, `users/${user.uid}/todos`));
    set(newTodoRef, { id: newTodoRef.key, title: todoInput.trim(), createdAt: Date.now() });
    update(ref(database, `users/${user.uid}`), { [`dailyTodosCount/${todayStr}`]: todoCountToday + 1 });
    setPostTodoInput('');
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Swords size={28} /></div>
            <div className="text-right"><h1 className="text-xl font-black text-primary">الماستر</h1><p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">تحديات الأساطير 👑</p></div>
          </div>
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        {activePvP.length > 0 && (
          <section className="mx-2 space-y-3">
            <h3 className="font-black text-primary text-sm px-2">ساحة المواجهة ⚔️</h3>
            <div className="grid grid-cols-1 gap-4">
              {activePvP.map((pvp: any) => <BattleCard key={pvp.id} challenge={pvp} currentUser={user} database={database} />)}
            </div>
          </section>
        )}

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-6 mx-2">
            <h3 className="font-black text-primary text-sm">تحدي الماستر العشوائي 🚀</h3>
            <Button onClick={() => { 
              const pool = getMasterPool(selectedType, selectedDifficulty);
              const random = pool[Math.floor(Math.random() * pool.length)];
              setCurrentChallenge(random); setStep('active'); playSound('click');
            }} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl">ابدأ تحدي الماستر 🔥</Button>
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
                <div key={todo.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
                  <button onClick={() => { 
                    const uRef = ref(database, `users/${user?.uid}`);
                    get(uRef).then(s => {
                      const d = s.val();
                      update(uRef, { points: (d.points || 0) + 5, [`dailyPoints/${todayStr}`]: (d.dailyPoints?.[todayStr] || 0) + 5 });
                    });
                    remove(ref(database, `users/${user?.uid}/todos/${todo.id}`)); 
                    playSound('success'); 
                  }} className="w-6 h-6 rounded-lg bg-white border-2 border-primary/20 hover:border-primary shadow-sm" />
                  <span className="font-bold text-[11px] text-right flex-1 mr-3 text-primary">{todo.title}</span>
                </div>
              )) : <p className="text-center py-4 opacity-30 text-[10px] font-black">لا توجد مهام حالية</p>}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function BattleCard({ challenge, currentUser, database }: { challenge: any, currentUser: any, database: any }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (challenge.status !== 'active') return;
    const timer = setInterval(() => {
      const now = Date.now();
      const limit = (challenge.duration || 15) * 60 * 1000;
      const start = currentUser.uid === challenge.senderId ? challenge.senderStartTime : challenge.receiverStartTime;
      const elapsed = now - start;
      const rem = Math.max(0, Math.floor((limit - elapsed) / 1000));
      setTimeLeft(rem);
      if (rem <= 0 && !isProcessing) concludeChallenge(database, challenge, 'none');
    }, 1000);
    return () => clearInterval(timer);
  }, [challenge, currentUser, isProcessing, database]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || isProcessing) return;
    setIsProcessing(true);
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = async (ev) => {
      const updates: any = { proof: ev.target?.result as string, winnerId: currentUser.uid, status: 'awaiting_confirmation' };
      if (currentUser.uid === challenge.senderId) updates.senderFinished = true; else updates.receiverFinished = true;
      await update(ref(database, `challenges/${challenge.id}`), updates);
      setIsProcessing(false); playSound('success');
    };
  };

  return (
    <Card className="rounded-[2.5rem] border-2 border-primary/10 bg-card p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-right"><p className="text-xs font-black text-primary">{challenge.title}</p></div>
        {challenge.status === 'active' && (
          <div className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-black flex items-center gap-2">
            <Timer size={14} className="animate-pulse" /> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {challenge.status === 'awaiting_confirmation' ? (
          challenge.winnerId === currentUser?.uid ? (
            <div className="bg-blue-50 p-4 rounded-2xl text-center space-y-3">
              <p className="text-[10px] font-black text-blue-800">بانتظار اعتراف الخصم بالهزيمة ⌛</p>
              {challenge.proof && (
                <div className="rounded-xl overflow-hidden border border-blue-200">
                  <img src={challenge.proof} className="w-full h-auto max-h-40 object-contain" alt="Proof" />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-orange-50 p-4 rounded-3xl space-y-4">
              <p className="text-[10px] font-black text-orange-900 text-right">الخصم يزعم الانتصار! راجع الدليل:</p>
              {challenge.proof && (
                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-orange-200 bg-white shadow-inner">
                  <img src={challenge.proof} className="w-full h-auto max-h-60 object-contain mx-auto" alt="Proof to verify" />
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => concludeChallenge(database, challenge, challenge.winnerId)} className="flex-1 bg-green-600 font-black text-[10px]">نعم، أقبل الهزيمة</Button>
                <Button onClick={() => update(ref(database, `challenges/${challenge.id}`), { status: 'awaiting_recognition' })} variant="outline" className="flex-1 text-red-600 border-red-200 font-black text-[10px]">لا، الدليل غير كافٍ!</Button>
              </div>
            </div>
          )
        ) : challenge.status === 'active' ? (
          <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full h-14 rounded-2xl bg-primary font-black text-xs gap-3">
            {isProcessing ? <Loader2 className="animate-spin" /> : <Camera size={20} />} رفع الإثبات 📸
          </Button>
        ) : (
          <div className="bg-secondary/30 p-4 rounded-2xl text-center font-bold text-[10px] text-muted-foreground italic">في انتظار تأكيد البداية...</div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    </Card>
  );
}
