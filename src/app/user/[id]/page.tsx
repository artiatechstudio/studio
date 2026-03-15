
"use client"

import React, { useMemo, use, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useFirebase, useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { ref, runTransaction, push, serverTimestamp, set, get, update } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Flame, Heart, ArrowLeft, Star, Crown, Medal, Lock, Swords, Clock, AlertTriangle, Loader2, Calendar as CalendarIcon, User as UserIcon, Ruler, Weight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";
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

  const myRef = useMemoFirebase(() => currentUser ? ref(database, `users/${currentUser.uid}`) : null, [database, currentUser]);
  const { data: myData } = useDatabase(myRef);

  const handleSendChallenge = async () => {
    if (!currentUser || !id || !myData) return;
    
    const isPremium = myData.isPremium === 1 || myData.name === 'admin';
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toLocaleDateString('en-CA');
    const weeklySent = myData.weeklyChallengesSent?.[startOfWeek] || 0;

    if (!isPremium && weeklySent >= 2) {
      toast({ 
        variant: "destructive", 
        title: "وصلت للحد الأسبوعي 🛑", 
        description: "اشترك في بريميوم لإرسال تحديات غير محدودة وتحطيم الأرقام!",
        action: <ToastAction altText="اشترك الآن" onClick={() => router.push('/settings')}>اشترك الآن</ToastAction>
      });
      return;
    }

    const points = parseInt(challengePoints);
    if (!challengeTitle.trim() || points > 100 || points < 10) return;

    setIsSendingChallenge(true);
    playSound('click');

    try {
      const challengeRef = push(ref(database, 'challenges'));
      await set(challengeRef, {
        id: challengeRef.key,
        senderId: currentUser.uid,
        senderName: myData.name || 'بطل',
        receiverId: id,
        receiverName: userData.name,
        title: challengeTitle.trim(),
        duration: parseInt(challengeTime),
        pointsStake: points,
        status: 'pending_acceptance',
        createdAt: serverTimestamp()
      });

      await update(ref(database, `users/${currentUser.uid}/weeklyChallengesSent`), { [startOfWeek]: weeklySent + 1 });
      push(ref(database, `users/${id}/notifications`), { type: 'challenge', title: 'مبارزة ثنائية! ⚔️', message: `يتحداك ${myData.name} في: ${challengeTitle.trim()}`, challengeId: challengeRef.key, timestamp: serverTimestamp() });

      toast({ title: "تم إرسال طلب التحدي! ⚔️" });
      setIsChallengeOpen(false);
      playSound('success');
    } catch (e) { toast({ variant: "destructive", title: "فشل الإرسال" }); }
    finally { setIsSendingChallenge(false); }
  };

  const handleToggleLike = () => {
    if (!currentUser || !id) return;
    playSound('click');
    const refLiked = ref(database, `users/${id}/likedBy/${currentUser.uid}`);
    const refCount = ref(database, `users/${id}/likesCount`);
    runTransaction(refLiked, (curr) => {
      if (curr) { runTransaction(refCount, (c) => (c || 1) - 1); return null; }
      else { runTransaction(refCount, (c) => (c || 0) + 1); return true; }
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  if (!userData) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border relative mx-2">
          <div className="absolute top-3 left-3 flex gap-1">
            {currentUser?.uid !== id && <Button onClick={handleToggleLike} variant="ghost" size="icon" className={cn("rounded-full", userData.likedBy?.[currentUser?.uid || ''] ? "text-red-500" : "text-muted-foreground")}><Heart fill={userData.likedBy?.[currentUser?.uid || ''] ? "currentColor" : "none"} /></Button>}
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="rotate-180" /></Button>
          </div>
          <div className="w-24 h-24 bg-white rounded-[2rem] overflow-hidden border-4 border-secondary shadow-lg flex items-center justify-center shrink-0">
            {userData.avatar?.startsWith('http') || userData.avatar?.startsWith('data:image') ? <img src={userData.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-5xl">{userData.avatar || "🐱"}</span>}
          </div>
          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl md:text-3xl font-black text-primary">{userData.name}</h1>
              {(userData.isPremium === 1 || userData.name === 'admin') && <Crown size={16} className="text-yellow-500" fill="currentColor" />}
            </div>
            <p className="text-[10px] font-black text-primary/60 bg-primary/5 px-3 py-0.5 rounded-full inline-block">العضو رقم {userData.registrationRank || 0}</p>
            <p className="text-xs font-bold text-muted-foreground italic mt-1">{userData.bio || "عضو طموح في مجتمع كارينجو 🌱"}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 border border-primary/10">
                <CalendarIcon size={12} /> {userData.age || '--'} سنة
              </div>
              <div className="bg-accent/5 text-accent px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 border border-accent/10">
                <Ruler size={12} /> {userData.height || '--'} سم
              </div>
              <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 border border-orange-100">
                <Weight size={12} /> {userData.weight || '--'} كجم
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-3 px-2">
           <Card className="p-4 rounded-2xl bg-orange-50 border-none text-center">
              <Flame size={16} className="text-orange-600 mx-auto mb-1" fill="currentColor" />
              <p className="text-lg font-black text-orange-600 leading-none">{userData.streak || 0}</p>
              <p className="text-[7px] font-black text-orange-400 uppercase mt-1">حماسة</p>
           </Card>
           <Card className="p-4 rounded-2xl bg-yellow-50 border-none text-center">
              <Star size={16} className="text-yellow-600 mx-auto mb-1" fill="currentColor" />
              <p className="text-lg font-black text-yellow-600 leading-none">{userData.points || 0}</p>
              <p className="text-[7px] font-black text-yellow-400 uppercase mt-1">نقاط</p>
           </Card>
           <Card className="p-4 rounded-2xl bg-red-50 border-none text-center">
              <Heart size={16} className="text-red-600 mx-auto mb-1" fill="currentColor" />
              <p className="text-lg font-black text-red-600 leading-none">{userData.likesCount || 0}</p>
              <p className="text-[7px] font-black text-red-400 uppercase mt-1">إعجابات</p>
           </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
          <Link href={`/chat/${id}`} className="w-full"><Button className="w-full h-14 rounded-2xl bg-secondary text-primary font-black gap-2"><UserIcon size={18} /> دردشة خاصة</Button></Link>
          {currentUser?.uid !== id && (
            <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
              <DialogTrigger asChild><Button onClick={() => playSound('click')} className="w-full h-14 rounded-2xl bg-primary font-black shadow-lg">تحدي هذا البطل ⚔️</Button></DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
                <DialogHeader><DialogTitle className="text-2xl font-black text-primary text-right">مبارزة ثنائية ⚔️</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2"><Label className="text-xs font-black text-primary">اسم التحدي</Label><Input placeholder="ما هو التحدي؟" className="h-12 rounded-xl bg-secondary/50 border-none font-bold" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs font-black text-primary">الوقت (د)</Label><Input type="number" className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-center" value={challengeTime} onChange={(e) => setChallengeTime(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs font-black text-primary">الرهان (ن)</Label><Input type="number" className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-center text-orange-600" value={challengePoints} onChange={(e) => setChallengePoints(e.target.value)} /></div>
                  </div>
                </div>
                <DialogFooter><Button onClick={handleSendChallenge} disabled={isSendingChallenge} className="w-full h-14 rounded-2xl font-black text-xl bg-primary">{isSendingChallenge ? "جاري الإرسال..." : "إرسال التحدي ⚔️"}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 px-2">
           <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
              <Swords size={16} className="text-green-600 mx-auto mb-1" />
              <p className="text-sm font-black text-green-700">انتصارات: {userData.challengesWon || 0}</p>
           </div>
           <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
              <XCircle size={16} className="text-red-600 mx-auto mb-1" />
              <p className="text-sm font-black text-red-700">هزائم: {userData.challengesLost || 0}</p>
           </div>
        </div>

        <section className="space-y-4 px-2">
          <Card className="rounded-[2rem] bg-card p-5 border border-border shadow-md">
            <h2 className="text-lg font-black text-primary flex items-center gap-2 mb-4"><Medal className="text-accent" /> خزانة الأوسمة</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {ALL_ACHIEVEMENTS.map((badge) => {
                const isEarned = badge.criteria(userData);
                return (
                  <Popover key={badge.id}>
                    <PopoverTrigger asChild>
                      <button className="flex flex-col items-center">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border", isEarned ? "bg-white border-primary/20" : "bg-secondary/20 opacity-20 grayscale scale-90")}>
                          {isEarned ? badge.icon : <Lock className="w-4 h-4" />}
                        </div>
                        <p className="text-[6px] font-black text-center mt-1 truncate w-full">{badge.name}</p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="text-right p-4 rounded-2xl" dir="rtl"><p className="font-black text-sm">{badge.name}</p><p className="text-[10px] text-muted-foreground">{badge.description}</p></PopoverContent>
                  </Popover>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
