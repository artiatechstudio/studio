
"use client"

import React, { useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, runTransaction, serverTimestamp } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, ArrowLeft, Timer, ShieldCheck, Scale, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function TrialsPage() {
  const { user } = useUser();
  const { database } = useFirebase();

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const trials = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData)
      .filter((p: any) => p.type === 'dispute')
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleVote = async (postId: string, candidateId: string) => {
    if (!user) return;
    playSound('click');
    const voteRef = ref(database, `publicPosts/${postId}/votes/${candidateId}`);
    const userVoteRef = ref(database, `publicPosts/${postId}/votedBy/${user.uid}`);

    try {
      const voteSnap = await runTransaction(userVoteRef, (current) => {
        if (current) return; // تم التصويت مسبقاً
        return true;
      });

      if (voteSnap.committed && voteSnap.snapshot.val() === true) {
        runTransaction(voteRef, (count) => (count || 0) + 1);
        toast({ title: "تم تسجيل صوتك بالعدل! ⚖️" });
        playSound('success');
      } else {
        toast({ variant: "destructive", title: "لقد شاركت في هذا الحكم مسبقاً" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التصويت" });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex items-center justify-between bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-[2.5rem] shadow-xl text-white mx-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
              <Gavel size={32} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black">المحاكمة المجتمعية</h1>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">صوتك يحسم النزاع بين الأساطير ⚖️</p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        <div className="bg-orange-50 border border-orange-100 p-4 rounded-[1.5rem] mx-2 flex items-start gap-3">
          <Scale className="text-orange-600 shrink-0" size={20} />
          <p className="text-[10px] font-bold text-orange-800 leading-relaxed text-right">
            هنا تُعرض التحديات التي اختلف فيها الأطراف. راجع صورة الإثبات المرفقة وقارنها باسم التحدي، ثم صوت لمن تراه صادقاً. تنتهي المحاكمة بعد 24 ساعة.
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
                <div className="flex items-center gap-2 text-primary font-black text-xs">
                  <ShieldCheck size={16} /> نزاع: {trial.title}
                </div>
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">
                  الرهان: {trial.points}ن
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col gap-4">
                  <p className="text-sm font-bold text-muted-foreground text-right leading-relaxed">
                    يقول <span className="text-primary font-black">{trial.challengerName}</span> أنه انتصر، ولكن <span className="text-orange-600 font-black">{trial.defenderName}</span> طعن في صحة الدليل المرفق.
                  </p>
                  
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-inner border-4 border-secondary bg-black/5">
                    <img 
                      src={trial.proof} 
                      alt="Proof" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full">
                      دليل {trial.challengerName} 📸
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleVote(trial.id, trial.challengerId)}
                      className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs gap-2"
                    >
                      صادق ✅
                    </Button>
                    {/* حل مشكلة Objects as React Child بعرض القيمة العددية فقط */}
                    <p className="text-center text-[10px] font-black text-muted-foreground">
                      {typeof trial.votes?.[trial.challengerId] === 'object' ? 0 : (trial.votes?.[trial.challengerId] || 0)} صوت
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleVote(trial.id, trial.defenderId)}
                      variant="outline" 
                      className="w-full h-14 rounded-2xl border-2 border-orange-500 text-orange-600 font-black text-xs gap-2"
                    >
                      كاذب ❌
                    </Button>
                    <p className="text-center text-[10px] font-black text-muted-foreground">
                      {typeof trial.votes?.[trial.defenderId] === 'object' ? 0 : (trial.votes?.[trial.defenderId] || 0)} صوت
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-1 text-[9px] font-black">
                    <Timer size={12} /> ينتهي خلال 24 ساعة
                  </div>
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
