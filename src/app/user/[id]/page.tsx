
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

  // Challenge State
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeTime, setChallengeTime] = useState('15');
  const [challengePoints, setChallengePoints] = useState('50');
  const [isSendingChallenge, setIsSendingChallenge] = useState(false);

  const userRef = useMemoFirebase(() => ref(database, `users/${id}`), [database, id]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const allUsersRef = useMemoFirebase(() => ref(database, 'users'), [database]);
  const { data: allUsersData } = useDatabase(allUsersRef);

  const membershipInfo = useMemo(() => {
    if (!allUsersData || !id) return { rank: 0, total: 0 };
    if (userData?.name === 'admin') return { rank: 0, total: 0 };

    const usersArray = Object.values(allUsersData) as any[];
    const filteredUsers = usersArray.filter(u => u.name !== 'admin')
      .sort((a, b) => {
        const dateA = new Date(a.registrationDate || 0).getTime();
        const dateB = new Date(b.registrationDate || 0).getTime();
        return dateA - dateB;
      });
    
    const rank = filteredUsers.findIndex(u => u.id === id) + 1;
    return { rank: rank > 0 ? rank : 1, total: filteredUsers.length };
  }, [allUsersData, id, userData]);

  const earnedBadges = useMemo(() => {
    if (!userData) return [];
    return ALL_ACHIEVEMENTS.filter(badge => badge.criteria(userData));
  }, [userData]);

  const handleToggleLike = () => {
    if (!currentUser || !id) return;
    if (currentUser.uid === id) {
      toast({ title: "لا يمكنك الإعجاب بملفك الشخصي!" });
      return;
    }

    playSound('click');
    const userLikesRef = ref(database, `users/${id}/likesCount`);
    const likedByRef = ref(database, `users/${id}/likedBy/${currentUser.uid}`);
    const targetNotifRef = ref(database, `users/${id}/notifications`);

    runTransaction(likedByRef, (isLiked) => {
      if (isLiked) {
        runTransaction(userLikesRef, (count) => (count || 1) - 1);
        toast({ title: "تم إلغاء الإعجاب" });
        return null;
      } else {
        runTransaction(userLikesRef, (count) => (count || 0) + 1);
        push(targetNotifRef, {
          type: 'like',
          title: 'إعجاب جديد! ❤️',
          message: `لقد أعجب أحدهم بملفك الشخصي.`,
          fromId: currentUser.uid,
          isRead: false,
          timestamp: serverTimestamp()
        });
        toast({ title: "تم إرسال إعجاب! ❤️" });
        playSound('success');
        return true;
      }
    });
  };

  const handleSendChallenge = async () => {
    if (!currentUser || !id) return;
    const points = parseInt(challengePoints);
    if (!challengeTitle.trim()) {
      toast({ variant: "destructive", title: "أدخل اسم التحدي" });
      return;
    }
    if (points > 100 || points < 10) {
      toast({ variant: "destructive", title: "النقاط يجب أن تكون بين 10 و 100" });
      return;
    }

    setIsSendingChallenge(true);
    playSound('click');

    try {
      const challengeRef = push(ref(database, 'challenges'));
      const challengeId = challengeRef.key;

      const challengeData = {
        id: challengeId,
        senderId: currentUser.uid,
        senderName: allUsersData[currentUser.uid]?.name || 'بطل مجهول',
        receiverId: id,
        receiverName: userData.name,
        title: challengeTitle.trim(),
        duration: parseInt(challengeTime),
        pointsStake: points,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await set(challengeRef, challengeData);

      // إضافة إشعار للخصم
      push(ref(database, `users/${id}/notifications`), {
        type: 'challenge',
        title: 'طلب تحدي جديد! ⚔️',
        message: `يتحداك ${challengeData.senderName} في: ${challengeData.title} مقابل ${points}ن.`,
        challengeId: challengeId,
        isRead: false,
        timestamp: serverTimestamp()
      });

      toast({ title: "تم إرسال التحدي بنجاح! ⚔️", description: "انتظر قبول الخصم للمبارزة." });
      setIsChallengeOpen(false);
      playSound('success');
    } catch (e) {
      toast({ variant: "destructive", title: "فشل إرسال التحدي" });
    } finally {
      setIsSendingChallenge(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-black text-primary mb-4">هذا المستخدم غير موجود!</h1>
        <Button onClick={() => router.back()} className="rounded-2xl font-black">العودة</Button>
      </div>
    );
  }

  const isLikedByMe = userData.likedBy?.[currentUser?.uid || ''];
  const isImageAvatar = userData.avatar && (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:image'));

  const getRankName = (points: number = 0) => {
    if (userData.name === 'admin') return "مدير النظام الرسمي 🛡️";
    if (points >= 10000) return "الأسطورة 👑";
    if (points >= 5000) return "نخبة كاري 🏅";
    if (points >= 2000) return "بطل صاعد 🔥";
    if (points >= 500) return "مكافح مجتهد 🐱";
    return "مكتشف جديد 🌱";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 md:py-10 space-y-6">
        <header className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2.5rem] shadow-xl border border-border relative overflow-hidden mx-2">
          <div className="absolute top-3 left-3 z-10">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
               <ArrowLeft size={16} className="rotate-180" />
            </Button>
          </div>
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-secondary shadow-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
            {isImageAvatar ? (
              <img src={userData.avatar} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-5xl md:text-6xl">{userData.avatar || "🐱"}</span>
            )}
          </Avatar>
          <div className="flex-1 text-center md:text-right space-y-2 z-10 overflow-hidden w-full">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
              <div className="flex items-center gap-1 justify-center md:justify-start">
                <h1 className="text-xl md:text-3xl font-black text-primary leading-tight truncate max-w-[200px]">{userData.name}</h1>
                {(userData.isPremium === 1 || userData.name === 'admin') && <Crown size={16} className="text-yellow-500 shrink-0" fill="currentColor" />}
              </div>
              <Button onClick={handleToggleLike} variant="ghost" className={cn("bg-red-50 px-3 py-1 h-7 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1", isLikedByMe ? "text-red-600" : "text-gray-400 grayscale")}>
                 {userData.likesCount || 0} <Heart size={12} fill={isLikedByMe ? "currentColor" : "none"} />
              </Button>
            </div>
            <p className="text-muted-foreground font-black text-xs bg-secondary/30 inline-block px-3 py-0.5 rounded-full italic truncate">
               الرتبة : {getRankName(userData.points)}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-black text-[9px] border border-primary/10">
                {userData.name === 'admin' ? "العضو رقم 0" : `العضو رقم ${membershipInfo.rank}`}
              </div>
              <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-orange-100 flex items-center gap-1"><Flame size={10} fill="currentColor" /> {userData.streak || 0}ي</div>
              <div className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg font-black text-[9px] border border-yellow-100 flex items-center gap-1"><Star size={10} fill="currentColor" /> {userData.points?.toLocaleString() || 0}ن</div>
            </div>
            
            {/* عرض إحصائيات التحديات */}
            <div className="flex justify-center md:justify-start gap-3 mt-3">
               <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black border border-green-100">
                 ⚔️ انتصارات: {userData.challengesWon || 0}
               </div>
               <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-black border border-red-100">
                 ❌ هزائم: {userData.challengesLost || 0}
               </div>
            </div>
          </div>
        </header>

        <section className="space-y-4 mx-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-primary flex items-center gap-2">
              <Medal size={20} className="text-accent" /> خزانة الأوسمة والميداليات
            </h2>
            <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full">
              {earnedBadges.length} وسام مستحق
            </span>
          </div>
          
          <Card className="rounded-[2rem] bg-card p-5 border border-border shadow-lg">
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {earnedBadges.map((badge) => (
                  <Popover key={badge.id}>
                    <PopoverTrigger asChild>
                      <button 
                        className="flex flex-col items-center group relative cursor-pointer outline-none rounded-xl p-1 transition-all"
                        onClick={() => playSound('click')}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-primary/10 shadow-sm flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <p className="text-[7px] font-black text-primary mt-1 text-center">{badge.name}</p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-card border-2 border-primary/20 text-primary p-4 rounded-2xl shadow-2xl max-w-[220px] text-right z-[100]" dir="rtl">
                      <div className="space-y-1">
                        <p className="font-black text-xs flex items-center justify-end gap-2">{badge.name} ✨</p>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">{badge.description}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 opacity-30">
                <Lock size={32} className="mx-auto" />
                <p className="text-[10px] font-black italic">لا توجد أوسمة معلنة لهذا المستخدم حالياً.</p>
              </div>
            )}
          </Card>
        </section>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
          <Link href={`/chat/${id}`} onClick={() => playSound('click')} className="w-full">
            <Button className="w-full h-14 rounded-2xl bg-secondary text-primary hover:bg-secondary/80 text-sm font-black shadow-md gap-2">دردشة خاصة 💬</Button>
          </Link>

          {currentUser?.uid !== id && (
            <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => playSound('click')} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-sm font-black shadow-lg gap-2">تحدي هذا البطل ⚔️</Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary text-right">طلب مبارزة ثنائية ⚔️</DialogTitle>
                  <DialogDescription className="text-right font-bold text-xs">اختر مهمة لتنفيذها مع الخصم في وقت واحد!</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-primary">اسم التحدي (مثلاً: 100 تمرين ضغط)</Label>
                    <Input 
                      placeholder="ما هو التحدي؟" 
                      className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right"
                      value={challengeTitle}
                      onChange={(e) => setChallengeTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary">الوقت (بالدقائق)</Label>
                      <Input 
                        type="number" 
                        className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-center"
                        value={challengeTime}
                        onChange={(e) => setChallengeTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary">الرهان (الحد الأقصى 100ن)</Label>
                      <Input 
                        type="number" 
                        max={100}
                        className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-center text-orange-600"
                        value={challengePoints}
                        onChange={(e) => setChallengePoints(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3">
                    <AlertTriangle className="text-orange-600 shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-orange-800 leading-relaxed">
                      تنبيه: الخاسر في التحدي (من ينتهي وقته قبل الإنجاز) سيتم إدراج اسمه في "جدار العار" وسيتم خصم النقاط من رصيده تلقائياً.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSendChallenge} 
                    disabled={isSendingChallenge}
                    className="w-full h-14 rounded-2xl font-black text-xl bg-primary shadow-lg"
                  >
                    {isSendingChallenge ? "جاري الإرسال..." : "إرسال التحدي الآن ⚔️"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
