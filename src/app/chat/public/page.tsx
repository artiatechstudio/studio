
"use client"

import React, { useState, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, runTransaction } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Scale, Swords, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function PublicCommunityPage() {
  const { user } = useUser();
  const { database } = useFirebase();

  const postsRef = useMemoFirebase(() => ref(database, 'publicPosts'), [database]);
  const { data: postsData, isLoading } = useDatabase(postsRef);

  const disputes = useMemo(() => {
    if (!postsData) return [];
    return Object.values(postsData)
      .filter((p: any) => p.type === 'dispute')
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [postsData]);

  const handleVote = async (postId: string, side: 'sender' | 'receiver') => {
    if (!user) return;
    playSound('click');
    const voteRef = ref(database, `publicPosts/${postId}/votedBy/${user.uid}`);
    
    runTransaction(voteRef, (current) => {
      if (current) {
        toast({ title: "لقد صوتَّ بالفعل!" });
        return;
      }
      
      const countRef = ref(database, `publicPosts/${postId}/votes/${side}`);
      runTransaction(countRef, (count) => (count || 0) + 1);
      toast({ title: "تم تسجيل تصويتك ✅" });
      playSound('success');
      return side;
    });
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-8">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border mx-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center"><Globe size={28} /></div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary">المجتمع العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">النزاعات والتحكيم الشعبي</p>
            </div>
          </div>
        </header>

        <section className="mx-2 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <Scale className="text-blue-600 shrink-0" size={20} />
            <div className="text-right">
              <p className="text-xs font-black text-blue-900 leading-tight">محكمة كارينجو الشعبية ⚖️</p>
              <p className="text-[9px] font-bold text-blue-700 mt-1">صوتوا بالعدل! قراركم يحدد الفائز في التحديات المتنازع عليها. التصويت يستمر لـ 24 ساعة فقط.</p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-20 opacity-30 font-black text-lg">لا توجد نزاعات حالياً. السلام يعم المكان! 🕊️</div>
            ) : disputes.map((dispute: any) => (
              <DisputeCard key={dispute.id} dispute={dispute} onVote={handleVote} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function DisputeCard({ dispute, onVote }: { dispute: any, onVote: any }) {
  const timeLeft = Math.max(0, Math.round((dispute.expiresAt - Date.now()) / 1000));
  const format = (s: number) => `${Math.floor(s/3600)}س ${(Math.floor(s/60)%60)}د`;

  return (
    <Card className="rounded-[2rem] border-2 border-red-100 bg-card overflow-hidden shadow-xl">
      <CardHeader className="bg-red-50 p-4 border-b border-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700 font-black">
            <Clock size={14} className="animate-pulse" />
            <span className="text-[10px]">{format(timeLeft)}</span>
          </div>
          <div className="text-[10px] font-black text-red-600 uppercase flex items-center gap-1">
            <Swords size={12} /> نزاع على {dispute.points}ن
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-right">
          <h3 className="font-black text-primary text-base">تحدي: {dispute.title}</h3>
          <p className="text-[10px] font-bold text-muted-foreground mt-1">بين <span className="text-primary">{dispute.challengerName}</span> و <span className="text-accent">{dispute.defenderName}</span></p>
        </div>

        <div className="relative group aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-inner bg-secondary/50">
          <img src={dispute.proof} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="ghost" size="sm" className="text-white font-black bg-white/20 backdrop-blur-md rounded-xl"> <Eye size={14} className="ml-1" /> عرض الدليل كاملاً </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-widest">هل الدليل صادق؟ صوت الآن!</p>
          <div className="flex gap-3">
            <Button onClick={() => onVote(dispute.id, 'sender')} className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black flex flex-col gap-0 shadow-lg">
              <CheckCircle size={18} />
              <span className="text-[10px]">نعم، فائز ({dispute.votes?.sender || 0})</span>
            </Button>
            <Button onClick={() => onVote(dispute.id, 'receiver')} variant="outline" className="flex-1 h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-black flex flex-col gap-0">
              <XCircle size={18} />
              <span className="text-[10px]">كاذب، لم ينجز ({dispute.votes?.receiver || 0})</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
