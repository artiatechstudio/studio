
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, runTransaction, get, remove } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, ArrowLeft, Timer, ShieldCheck, Scale, Loader2, Trophy, Swords, XCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

/**
 * دالة معالجة النتيجة الموحدة
 */
async function concludeTrialResult(database: any, challenge: any, winnerId: string | 'tie') {
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
  } else {
    const loserId = winnerId === p1Id ? p2Id : p1Id;
    await processUser(winnerId, true, false);
    await processUser(loserId, false, false);
  }

  await remove(ref(database, `challenges/${challenge.id}`));
}

export default function TrialsPage() {
  const { user } = useUser();
  const { database } = useFirebase();

  const challengesRef = useMemoFirebase(() => ref(database, 'challenges'), [database]);
  const { data: challengesData, isLoading } = useDatabase(challengesRef);

  const trials = useMemo(() => {
    if (!challengesData) return [];
    return Object.entries(challengesData)
      .map(([id, val]: [string, any]) => ({ id, ...val }))
      .filter((c: any) => c.status === 'awaiting_recognition')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [challengesData]);

  const handleVote = async (challengeId: string, candidateId: string) => {
    if (!user) return;
    playSound('click');
    const voteRef = ref(database, `challenges/${challengeId}/votes/${candidateId}`);
    const userVoteRef = ref(database, `challenges/${challengeId}/votedBy/${user.uid}`);

    try {
      const voteSnap = await runTransaction(userVoteRef, (current) => {
        if (current) return;
        return true;
      });

      if (voteSnap.committed && voteSnap.snapshot.val() === true) {
        runTransaction(voteRef, (count) => (count || 0) + 1);
        toast({ title: "تم تسجيل صوتك بالعدل! ⚖️" });
        playSound('success');
      } else {
        toast({ variant: "destructive", title: "لقد شاركت مسبقاً" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التصويت" });
    }
  };

  const handleConclude = async (trial: any) => {
    const v1 = trial.votes?.[trial.senderId] || 0;
    const v2 = trial.votes?.[trial.receiverId] || 0;
    let winnerId: string | 'tie' = 'tie';
    if (v1 > v2) winnerId = trial.senderId;
    else if (v2 > v1) winnerId = trial.receiverId;
    
    await concludeTrialResult(database, trial, winnerId);
    toast({ title: "تم حسم النزاع بنجاح" });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-[2.5rem] shadow-xl text-white mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30"><Gavel size={32} /></div>
            <div className="text-right">
              <h1 className="text-2xl font-black">المحاكمة المجتمعية</h1>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">صوتك يحسم النزاع بين الأساطير ⚖️</p>
            </div>
          </div>
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10"><ArrowLeft className="rotate-180" /></Button></Link>
        </header>

        <div className="bg-orange-50 border border-orange-100 p-4 rounded-[1.5rem] mx-2 flex items-start gap-3">
          <Scale className="text-orange-600 shrink-0" size={20} />
          <p className="text-[10px] font-bold text-orange-800 text-right leading-relaxed">
            راجع صورة الإثبات المرفقة وقارنها باسم التحدي، ثم صوت لمن تراه صادقاً. العدل أساس الملك!
          </p>
        </div>

        <div className="space-y-6 mx-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : trials.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black text-xl">لا توجد نزاعات حالية.. المجتمع يعيش بسلام! 🐱🕊️</div>
          ) : trials.map((trial: any) => (
            <Card key={trial.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-card">
              <div className="bg-secondary/30 p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2 text-primary font-black text-xs"><ShieldCheck size={16} /> نزاع: {trial.title}</div>
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">الرهان: {trial.pointsStake}ن</div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col gap-4">
                  <p className="text-sm font-bold text-muted-foreground text-right leading-relaxed">
                    يقول <span className="text-primary font-black">{trial.winnerName}</span> أنه انتصر في زمن قياسي، فهل تصدقه؟ 📸
                  </p>
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-inner border-4 border-secondary bg-black/5 flex items-center justify-center">
                    {trial.proof ? (
                      <img src={trial.proof} alt="Proof" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-muted-foreground italic text-xs">لا يوجد دليل مصور</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Button onClick={() => handleVote(trial.id, trial.winnerId)} className="w-full h-14 rounded-2xl bg-primary font-black text-xs gap-2">صادق ✅</Button>
                    <p className="text-center text-[10px] font-black text-muted-foreground">{trial.votes?.[trial.winnerId] || 0} صوت</p>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => handleVote(trial.id, trial.winnerId === trial.senderId ? trial.receiverId : trial.senderId)} variant="outline" className="w-full h-14 rounded-2xl border-2 border-orange-500 text-orange-600 font-black text-xs gap-2">كاذب ❌</Button>
                    <p className="text-center text-[10px] font-black text-muted-foreground">{trial.votes?.[trial.winnerId === trial.senderId ? trial.receiverId : trial.senderId] || 0} صوت</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between opacity-60">
                  <Button onClick={() => handleConclude(trial)} variant="ghost" size="sm" className="text-[9px] font-black text-primary">حسم النزاع (إدارة)</Button>
                  <p className="text-[9px] font-black">المعرف: #{trial.id.slice(-5)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
