
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
import { Trophy, Flame, Heart, ArrowLeft, Star, Crown, Medal, Lock, Swords, Clock, AlertTriangle, Loader2, Ruler, Weight, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
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
        description: "يمكنك إرسال تحديين فقط أسبوعياً. اشترك في بريميوم للتحدي بلا حدود! 👑" 
      });
      return;
    }

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
        senderName: myData.name || 'بطل مجهول',
        receiverId: id,
        receiverName: userData.name,
        title: challengeTitle.trim(),
        duration: parseInt(challengeTime),
        pointsStake: points,
        status: 'pending_acceptance',
        createdAt: serverTimestamp()
      });

      await update(ref(database, `users/${currentUser.uid}/weeklyChallengesSent`), {
        [startOfWeek]: weeklySent + 1
      });

      push(ref(database, `users/${id}/notifications`), {
        type: 'challenge',
        title: 'طلب مبارزة ثنائية! ⚔️',
        message: `يتحداك ${myData.name} في: ${challengeTitle.trim()} مقابل ${points}ن.`,
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

  const isImageAvatar = userData?.avatar && (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:image'));

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
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
            
            {userData.bio && <p className="text-xs font-bold text-muted-foreground italic line-clamp-1">{userData.bio}</p>}

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-orange-100 flex items-center gap-1"><Flame size={10} fill="currentColor" /> {userData.streak || 0}ي</div>
              <div className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-yellow-100 flex items-center gap-1"><Star size={10} fill="currentColor" /> {userData.points?.toLocaleString() || 0}ن</div>
              
              <div className="bg-primary/5 text-primary px-2.5 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 border border-primary/10">
                <CalendarIcon size={10} /> {userData.age || '--'} سنة
              </div>
              <div className="bg-accent/5 text-accent px-2.5 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 border border-accent/10">
                <Ruler size={10} /> {userData.height || '--'} سم
              </div>
              <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 border border-orange-100">
                <Weight size={10} /> {userData.weight || '--'} كجم
              </div>
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
                <DialogFooter><Button onClick={handleSendChallenge} disabled={isSendingChallenge} className="w-full h-14 rounded-2xl font-black text-xl bg-primary shadow-lg">{isSendingChallenge ? "جاري المعالجة..." : "إرسال التحدي ⚔️"}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <section className="space-y-4 px-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-primary flex items-center gap-2">
              <Medal className="text-accent" /> خزانة الأوسمة
            </h2>
            <span className="text-[9px] font-black text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {ALL_ACHIEVEMENTS.filter(a => a.criteria(userData)).length} وسام
            </span>
          </div>
          
          <Card className="rounded-[2rem] bg-card p-5 border border-border shadow-md">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {ALL_ACHIEVEMENTS.map((badge) => {
                const isEarned = badge.criteria(userData);
                return (
                  <Popover key={badge.id}>
                    <PopoverTrigger asChild>
                      <button 
                        className="group relative flex flex-col items-center cursor-pointer outline-none rounded-xl p-1 transition-all"
                        onClick={() => { if(isEarned) playSound('success'); else playSound('click'); }}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500 shadow-sm border",
                          isEarned 
                            ? "bg-white border-primary/20 scale-100" 
                            : "bg-secondary/20 border-transparent opacity-20 grayscale scale-90"
                        )}>
                          {isEarned ? badge.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <p className={cn(
                          "text-[6px] font-black text-center mt-1 truncate w-full",
                          isEarned ? "text-primary opacity-100" : "text-muted-foreground opacity-40"
                        )}>
                          {badge.name}
                        </p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-card border-2 border-primary/20 text-primary p-4 rounded-2xl shadow-2xl max-w-[220px] text-right z-[100]" dir="rtl">
                      <div className="space-y-1">
                        <p className="font-black text-sm flex items-center justify-end gap-2">{badge.name} {isEarned && "✅"}</p>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">{badge.description}</p>
                        {!isEarned && <p className="text-[8px] text-destructive mt-2 font-black italic border-t border-border pt-1">لم يتم إحراز هذا الوسام بعد 🔒</p>}
                      </div>
                    </PopoverContent>
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
