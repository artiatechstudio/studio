
"use client"

import React, { useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, remove, serverTimestamp, push } from 'firebase/database';
import { deleteUser, signOut } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Save, User as UserIcon, PenLine, Crown, Sparkles, Globe, Trophy, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

const AVATAR_EMOJIS = ["🐱", "🐶", "🦊", "🦁", "🐯", "🐨", "🐼", "🐸", "🐵", "🐥", "🦄", "🐲", "🐙", "🦖", "🐢", "🦋", "🌵", "🚀", "🌈", "🔥", "⚽", "🎸", "🍕", "🍦", "🍎", "🥝", "🍉", "🍇", "🥦", "🥑", "🍔", "💎", "👑"];

export default function SettingsPage() {
  const { user } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [duration, setDuration] = useState('1month');

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setAge(userData.age?.toString() || '');
      setGender(userData.gender || 'male');
      setHeight(userData.height?.toString() || '');
      setWeight(userData.weight?.toString() || '');
      setAvatar(userData.avatar || '🐱');
      setBio(userData.bio || '');
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    const h = parseInt(height);
    const w = parseInt(weight);
    const a = parseInt(age);

    if (h < 50 || h > 250 || w < 10 || w > 500 || a < 5 || a > 100) {
      toast({ 
        variant: "destructive", 
        title: "بيانات غير منطقية", 
        description: "يرجى إدخال طول (50-250) ووزن (10-500) وعمر (5-100) حقيقيين." 
      });
      return;
    }

    setSaving(true);
    playSound('click');
    try {
      await update(ref(database, `users/${user.uid}`), {
        name,
        age: a,
        gender,
        height: h,
        weight: w,
        avatar,
        bio: bio.slice(0, 30)
      });
      toast({ title: "تم التحديث!", description: "تم حفظ بياناتك الشخصية بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث البيانات." });
    } finally {
      setSaving(false);
    }
  };

  const handleSendPremiumRequest = async () => {
    if (!user || !userData) return;
    playSound('click');
    
    try {
      await update(ref(database, `users/${user.uid}/premiumRequest`), {
        status: 'pending',
        duration: duration,
        requestedAt: Date.now(),
        email: userData.email,
        name: userData.name
      });
      
      toast({ title: "تم إرسال طلبك! 🚀", description: "سيتم مراجعة طلبك من قبل المطور قريباً." });
      setIsRequestOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإرسال" });
    }
  };

  const handleLogout = async () => {
    playSound('click');
    try {
      await signOut(auth);
      router.replace('/login');
      toast({ title: "تم تسجيل الخروج" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    playSound('click');
    if (userData?.name === 'admin') {
      toast({ variant: "destructive", title: "لا يمكن حذف حساب الإدارة!" });
      return;
    }
    const confirmed = window.confirm("تحذير نهائي! سيتم حذف كافة بياناتك وتقدمك. هل أنت متأكد؟ 🐱⚠️");
    if (!user || !confirmed) return;
    
    try {
      const uid = user.uid;
      await remove(ref(database, `users/${uid}`));
      await signOut(auth);
      await deleteUser(user);
      
      toast({ title: "تم حذف الحساب نهائياً" });
      router.replace('/login');
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في الحذف", 
        description: "يرجى تسجيل الخروج والدخول مرة أخرى للتحقق من هويتك قبل الحذف." 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const requestStatus = userData?.premiumRequest?.status;

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10">
        <header className="flex items-center gap-4 text-right mx-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary">الإعدادات</h1>
            <p className="text-xs text-muted-foreground font-bold">إدارة ملفك الشخصي وتجربة التطبيق</p>
          </div>
        </header>

        <Card className={cn(
          "border-none shadow-xl rounded-[2.5rem] text-white overflow-hidden p-8 space-y-6 relative mx-2",
          userData?.isPremium === 1 ? "bg-gradient-to-br from-yellow-500 to-amber-600" : "bg-gradient-to-br from-slate-700 to-slate-900"
        )}>
          <Crown className="absolute top-4 left-4 opacity-20" size={120} />
          <div className="relative z-10 space-y-2 text-right">
            <div className="flex items-center justify-end gap-2">
              <h2 className="text-2xl font-black">عضوية كارينجو المميزة</h2>
              <Crown size={24} fill="currentColor" />
            </div>
            <p className="text-sm font-bold opacity-90 leading-relaxed">
              {userData?.isPremium === 1 
                ? `أنت مستخدم بريميوم! اشتراكك ينتهي في: ${userData.premiumUntil ? new Date(userData.premiumUntil).toLocaleDateString() : 'غير محدد'}` 
                : "اشترك الآن وافتح كافة القيود وتخلص من الإعلانات المزعجة."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[
              { t: "بدون إعلانات", i: Sparkles },
              { t: "نشر غير محدود", i: Globe },
              { t: "تحديات مفتوحة", i: Trophy },
              { t: "توثيق ملكي", i: Crown },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2 justify-end bg-white/10 p-2 rounded-xl border border-white/20">
                <span className="text-[10px] font-black">{m.t}</span>
                <m.i size={14} />
              </div>
            ))}
          </div>

          {userData?.isPremium !== 1 && (
            <div className="relative z-10">
              {requestStatus === 'pending' ? (
                <Button disabled className="w-full h-14 rounded-2xl bg-amber-100 text-amber-700 font-black flex gap-2">
                  <Clock size={20} /> طلبك تحت الإجراء...
                </Button>
              ) : (
                <Button onClick={() => setIsRequestOpen(true)} className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-white/90 text-lg font-black shadow-lg">
                  اطلب اشتراك بريميوم 👑
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Dialog لطلب البريميوم */}
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black text-primary">طلب ترقية الحساب</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground mt-2">
                سيتم إرسال طلبك للمطور، وسيصلك إشعار فور الموافقة على اشتراكك.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4">
              <Label className="text-right block">اختر مدة الاشتراك المطلوبة:</Label>
              <Select onValueChange={setDuration} defaultValue="1month">
                <SelectTrigger className="h-14 rounded-xl bg-secondary/50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">شهر واحد (تجربة)</SelectItem>
                  <SelectItem value="2months">شهرين (التزام)</SelectItem>
                  <SelectItem value="1year">سنة كاملة (أسطورة)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex-row-reverse gap-2">
              <Button onClick={handleSendPremiumRequest} className="flex-1 h-12 rounded-xl bg-primary font-black">إرسال الطلب</Button>
              <Button onClick={() => setIsRequestOpen(false)} variant="ghost" className="flex-1 h-12 rounded-xl font-bold">إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right">
            <CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-3">
              تعديل المعلومات الشخصية <UserIcon size={20} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2 flex flex-col items-center gap-4 mb-4">
               <Label className="text-center">اختر رفيقك (الأفاتار)</Label>
               <div className="text-6xl bg-secondary/50 p-6 rounded-[2rem] shadow-inner mb-2">{avatar}</div>
               <Select onValueChange={(val) => { playSound('click'); setAvatar(val); }} value={avatar}>
                <SelectTrigger className="rounded-xl bg-secondary/30 border-none h-12 font-bold w-40 text-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {AVATAR_EMOJIS.map(emoji => (
                      <SelectItem key={emoji} value={emoji} className="text-2xl cursor-pointer hover:bg-secondary rounded-lg justify-center p-2">
                        {emoji}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="flex items-center gap-2"><PenLine size={16} /> نبذة قصيرة (بحد أقصى 30 حرفاً)</Label>
              <Input 
                value={bio} 
                maxLength={30}
                placeholder="أخبرنا بشيء عنك..."
                onChange={e => setBio(e.target.value)} 
                className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" 
              />
              <p className="text-[10px] text-muted-foreground text-left">{bio.length}/30</p>
            </div>
            
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>الاسم الكامل</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" />
            </div>
            <div className="space-y-2">
              <Label>العمر</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" />
            </div>
            <div className="space-y-2">
              <Label>الجنس</Label>
              <Select onValueChange={(val) => { playSound('click'); setGender(val); }} value={gender}>
                <SelectTrigger className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الطول (سم)</Label>
              <Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" />
            </div>
            <div className="space-y-2">
              <Label>الوزن (كجم)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" />
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={saving}
              className="col-span-1 md:col-span-2 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black shadow-lg shadow-primary/20 mt-4"
            >
              <Save size={20} className="ml-2" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </CardContent>
        </Card>

        <div className="pt-6 flex flex-col gap-3 mx-2">
          <Button onClick={handleLogout} variant="outline" className="h-14 rounded-2xl border-2 border-primary text-primary font-black hover:bg-primary/5">
            <LogOut className="ml-2" /> تسجيل الخروج
          </Button>
          {userData?.name !== 'admin' && (
            <Button onClick={handleDeleteAccount} variant="ghost" className="h-14 rounded-2xl text-destructive font-black hover:bg-destructive/10">
              <Trash2 className="ml-2" /> حذف الحساب نهائياً
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
