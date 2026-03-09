
"use client"

import React, { useMemo, use, useState } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useFirebase, useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { ref, runTransaction, push, serverTimestamp, set } from 'firebase/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Flame, Heart, ArrowLeft, Star, Crown, Medal, Lock, Swords, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';

export default function UserPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: currentUser } = useUser();
  const { database } = useFirebase();
  const router = useRouter();

  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeTime, setChallengeTime] = useState('15');
  const [challengePoints, setChallengePoints] = useState('50');
  const [isSendingChallenge, setIsSendingChallenge] = useState(false);

  const userRef = useMemoFirebase(() => ref(database, `users/${id}`), [database, id]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  const handleSendChallenge = async () => {
    if (!currentUser || !id) return;
    const points = parseInt(challengePoints);
    if (!challengeTitle.trim()) { toast({ variant: "destructive", title: "أدخل اسم التحدي" }); return; }
    if (points > 100 || points < 10) { toast({ variant: "destructive", title: "النقاط (10-100)" }); return; }

    setIsSendingChallenge(true);
    playSound('click');

    try {
      const challengeRef = push(ref(database, 'challenges'));
      const challengeId = challengeRef.key;

      await set(challengeRef, {
        id: challengeId,
        senderId: currentUser.uid,
        senderName: allUsersData[currentUser.uid]?.name || 'بطل مجهول',
        receiverId: id,
        receiverName: userData.name,
        title: challengeTitle.trim(),
        duration: parseInt(challengeTime),
        pointsStake: points,
        status: 'pending_acceptance', // حالة جديدة لبدء المسار المطور
        createdAt: serverTimestamp()
      });

      push(ref(database, `users/${id}/notifications`), {
        type: 'challenge',
        title: 'طلب مبارزة ثنائية! ⚔️',
        message: `يتحداك ${allUsersData[currentUser.uid]?.name} في: ${challengeTitle.trim()} مقابل ${points}ن.`,
        challengeId: challengeId,
        isRead: false,
        timestamp: serverTimestamp()
      });

      toast({ title: "تم إرسال طلب التحدي! ⚔️" });
      setIsChallengeOpen(false);
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    } finally {
      setIsSendingChallenge(false);
    }
  };

  const isLikedByMe = userData?.likedBy?.[currentUser?.uid || ''];
  const isImageAvatar = userData?.avatar && (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:image'));

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!userData) return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"><h1 className="text-xl font-black">العضو غير موجود</h1></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 md:py-10 space-y-6">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border relative overflow-hidden mx-2">
          <div className="absolute top-3 left-3"><Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full"><ArrowLeft size={16} className="rotate-180" /></Button></div>
          <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-secondary shadow-lg bg-white rounded-full overflow-hidden flex items-center justify-center shrink-0">
            {isImageAvatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <span className="text-5xl">{userData.avatar || "🐱"}</span>}
          </div>
          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl md:text-3xl font-black text-primary truncate max-w-[200px]">{userData.name}</h1>
              {(userData.isPremium === 1 || userData.name === 'admin') && <Crown size={16} className="text-yellow-500" fill="currentColor" />}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-orange-100 flex items-center gap-1"><Flame size={10} fill="currentColor" /> {userData.streak || 0}ي</div>
              <div className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-yellow-100 flex items-center gap-1"><Star size={10} fill="currentColor" /> {userData.points?.toLocaleString() || 0}ن</div>
            </div>
            <div className="flex justify-center md:justify-start gap-3 mt-3">
               <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black border border-green-100">⚔️ فوز: {userData.challengesWon || 0}</div>
               <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-black border border-red-100">❌ خسارة: {userData.challengesLost || 0}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
          <Link href={`/chat/${id}`} className="w-full"><Button className="w-full h-14 rounded-2xl bg-secondary text-primary font-black shadow-md">دردشة خاصة 💬</Button></Link>
          {currentUser?.uid !== id && (
            <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
              <DialogTrigger asChild><Button onClick={() => playSound('click')} className="w-full h-14 rounded-2xl bg-primary text-sm font-black shadow-lg">تحدي هذا البطل ⚔️</Button></DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
                <DialogHeader><DialogTitle className="text-2xl font-black text-primary text-right">مبارزة ثنائية ⚔️</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2"><Label className="text-xs font-black text-primary">اسم التحدي (مثلاً: 100 ضغط)</Label><Input placeholder="ما هو التحدي؟" className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs font-black text-primary">الوقت (دقيقة)</Label><Input type="number" className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-center" value={challengeTime} onChange={(e) => setChallengeTime(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs font-black text-primary">الرهان (10-100ن)</Label><Input type="number" className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-center text-orange-600" value={challengePoints} onChange={(e) => setChallengePoints(e.target.value)} /></div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3"><AlertTriangle className="text-orange-600 shrink-0" size={18} /><p className="text-[10px] font-bold text-orange-800 leading-relaxed">تنبيه: الكذب في الإثبات سيعرضك لنزاع عام وتصويت من المجتمع، مما قد يؤدي لإدراجك في جدار العار.</p></div>
                </div>
                <DialogFooter><Button onClick={handleSendChallenge} disabled={isSendingChallenge} className="w-full h-14 rounded-2xl font-black text-xl bg-primary shadow-lg">{isSendingChallenge ? "جاري الإرسال..." : "إرسال التحدي ⚔️"}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
