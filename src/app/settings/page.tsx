
"use client"

import React, { useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, remove } from 'firebase/database';
import { deleteUser, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Save, User as UserIcon, PenLine, Crown, Sparkles, Globe, Trophy, Trash2, Clock, MessageSquare, Phone, Twitter, ShieldCheck, Lock, Instagram, Youtube, Facebook, Mail, Moon, Sun, CheckCircle2 } from 'lucide-react';
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedPlan, setSelectedType] = useState('1month');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // ثيم التطبيق
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
  }, [userData]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    playSound('click');
    toast({ title: newTheme === 'dark' ? "تم تفعيل الوضع الليلي 🌙" : "تم تفعيل الوضع المضيء ☀️" });
  };

  const isAdmin = userData?.name === 'admin';

  const handleUpdateProfile = async () => {
    if (!user) return;
    const h = parseInt(height);
    const w = parseInt(weight);
    const a = parseInt(age);
    if (h < 50 || h > 250 || w < 10 || w > 500 || a < 5 || a > 100) {
      toast({ variant: "destructive", title: "بيانات غير منطقية" });
      return;
    }
    setSaving(true);
    playSound('click');
    try {
      await update(ref(database, `users/${user.uid}`), {
        name: isAdmin ? 'admin' : name,
        age: a,
        gender,
        height: h,
        weight: w,
        avatar,
        bio: bio.slice(0, 30)
      });
      toast({ title: "تم التحديث!" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword) return;
    setChangingPass(true);
    playSound('click');
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "تم تغيير كلمة المرور! 🔐" });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    } finally {
      setChangingPass(false);
    }
  };

  const handleSendPremiumRequest = async () => {
    if (!user) return;
    setIsSubmittingRequest(true);
    playSound('click');
    try {
      await update(ref(database, `users/${user.uid}/premiumRequest`), {
        status: 'pending',
        duration: selectedPlan,
        requestedAt: Date.now()
      });
      toast({ title: "تم إرسال الطلب بنجاح! 🚀", description: "سيقوم الإدارة بمراجعة طلبك وتفعيله قريباً." });
      setIsRequestOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل إرسال الطلب" });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleLogout = async () => {
    playSound('click');
    await signOut(auth);
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    playSound('click');
    if (userData?.name === 'admin') return;
    const confirmed = window.confirm("تحذير نهائي! هل أنت متأكد؟ 🐱⚠️");
    if (!user || !confirmed) return;
    try {
      await remove(ref(database, `users/${user.uid}`));
      await signOut(auth);
      await deleteUser(user);
      router.replace('/login');
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const requestStatus = userData?.premiumRequest?.status;

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10">
        <header className="flex items-center gap-4 text-right mx-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0"><Settings size={32} /></div>
          <div><h1 className="text-2xl font-black text-primary">الإعدادات</h1><p className="text-xs text-muted-foreground font-bold">إدارة ملفك الشخصي</p></div>
        </header>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right flex flex-row items-center justify-between flex-row-reverse">
            <CardTitle className="text-lg font-black text-primary flex items-center gap-3">مظهر التطبيق <Sparkles size={20} /></CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="font-black text-primary text-sm flex items-center gap-2 justify-end">الوضع {theme === 'dark' ? 'الداكن' : 'المضيء'}{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</p>
              <p className="text-[10px] text-muted-foreground font-bold">تغيير مظهر التطبيق</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} className="scale-125 data-[state=checked]:bg-primary" />
          </CardContent>
        </Card>

        <Card className={cn("border-none shadow-xl rounded-[2.5rem] text-white overflow-hidden p-8 space-y-6 relative mx-2", userData?.isPremium === 1 ? "bg-gradient-to-br from-yellow-500 to-amber-600" : "bg-gradient-to-br from-slate-700 to-slate-900")}>
          <Crown className="absolute top-4 left-4 opacity-20" size={120} />
          <div className="relative z-10 space-y-2 text-right">
            <div className="flex items-center justify-end gap-2"><h2 className="text-2xl font-black">عضوية Careingo المميزة</h2><Crown size={24} fill="currentColor" /></div>
            <p className="text-sm font-bold opacity-90 leading-relaxed">
              {userData?.isPremium === 1 ? (isAdmin ? "أنت مدير النظام! اشتراكك دائم. 🛡️" : `أنت مستخدم بريميوم! ينتهي في: ${userData.premiumUntil ? new Date(userData.premiumUntil).toLocaleDateString() : 'غير محدد'}`) : "اشترك الآن وافتح كافة القيود وتخلص من الإعلانات."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[{ t: "بدون إعلانات", i: Sparkles }, { t: "نشر غير محدود", i: Globe }, { t: "تحديات مفتوحة", i: Trophy }, { t: "توثيق ملكي", i: Crown }].map((m, i) => (
              <div key={i} className="flex items-center gap-2 justify-end bg-white/10 p-2 rounded-xl border border-white/20"><span className="text-[10px] font-black">{m.t}</span><m.i size={14} /></div>
            ))}
          </div>
          {userData?.isPremium !== 1 && (
            <div className="relative z-10">
              {requestStatus === 'pending' ? (
                <Button disabled className="w-full h-14 rounded-2xl bg-amber-100 text-amber-700 font-black flex gap-2"><Clock size={20} /> طلبك تحت الإجراء...</Button>
              ) : (
                <Button onClick={() => { playSound('click'); setIsRequestOpen(true); }} className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-white/90 text-lg font-black shadow-lg">اطلب اشتراك بريميوم 👑</Button>
              )}
            </div>
          )}
        </Card>

        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
            <DialogHeader><DialogTitle className="text-2xl font-black text-primary text-right">اختر باقة النمو</DialogTitle><DialogDescription className="text-right font-bold">باقات بسيطة لتجربة ملكية كاملة</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              {[
                { id: '7days', label: 'أسبوع واحد (تجريبي)', price: '1 دينار' },
                { id: '1month', label: 'شهر كامل (اقتصادي)', price: '4 دينار' },
                { id: '6months', label: '6 أشهر (احترافي)', price: '20 دينار' }
              ].map((plan) => (
                <div key={plan.id} onClick={() => { playSound('click'); setSelectedType(plan.id); }} className={cn("p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between", selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20")}>
                  <div className="flex items-center gap-3">{selectedPlan === plan.id ? <CheckCircle2 className="text-primary" /> : <div className="w-6 h-6 rounded-full border-2 border-border" />}<span className="font-black text-sm">{plan.label}</span></div>
                  <span className="bg-secondary px-3 py-1 rounded-full text-xs font-black text-primary">{plan.price}</span>
                </div>
              ))}
            </div>
            <DialogFooter><Button onClick={handleSendPremiumRequest} disabled={isSubmittingRequest} className="w-full h-12 rounded-xl font-black text-lg">{isSubmittingRequest ? "جاري الإرسال..." : "تأكيد وإرسال الطلب 🐱"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right"><CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-3">تعديل المعلومات الشخصية <UserIcon size={20} /></CardTitle></CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2 flex flex-col items-center gap-4 mb-4">
               <Label>اختر رفيقك</Label><div className="text-6xl bg-secondary/50 p-6 rounded-[2rem] shadow-inner mb-2">{avatar}</div>
               <Select onValueChange={setAvatar} value={avatar}><SelectTrigger className="rounded-xl bg-secondary/30 border-none h-12 font-bold w-40 text-xl"><SelectValue /></SelectTrigger><SelectContent><div className="grid grid-cols-4 gap-2 p-2">{AVATAR_EMOJIS.map(emoji => (<SelectItem key={emoji} value={emoji} className="text-2xl cursor-pointer hover:bg-secondary rounded-lg justify-center p-2">{emoji}</SelectItem>))}</div></SelectContent></Select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2"><Label className="flex items-center gap-2 justify-end"><PenLine size={16} /> نبذة قصيرة</Label><Input value={bio} maxLength={30} onChange={e => setBio(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
            <div className="space-y-2 col-span-1 md:col-span-2"><Label className="text-right block w-full">الاسم الكامل {isAdmin && "(لا يمكن تغييره للمدير)"}</Label><Input value={name} onChange={e => setName(e.target.value)} disabled={isAdmin} className={cn("rounded-xl bg-secondary/30 border-none h-12 font-bold text-right", isAdmin && "opacity-50")} /></div>
            <div className="space-y-2"><Label className="text-right block w-full">العمر</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
            <div className="space-y-2"><Label className="text-right block w-full">الجنس</Label><Select onValueChange={setGender} value={gender}><SelectTrigger className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-right block w-full">الطول</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
            <div className="space-y-2"><Label className="text-right block w-full">الوزن</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
            <Button onClick={handleUpdateProfile} disabled={saving} className="col-span-1 md:col-span-2 h-14 rounded-2xl bg-primary text-lg font-black">{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-orange-500/5 p-6 border-b border-border text-right"><CardTitle className="text-lg font-black text-orange-600 flex items-center justify-end gap-3">الأمان وكلمة المرور <ShieldCheck size={20} /></CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2"><Label className="flex items-center justify-end gap-2 text-primary">كلمة المرور الحالية <Lock size={14}/></Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 text-right" /></div>
              <div className="space-y-2"><Label className="flex items-center justify-end gap-2 text-primary">كلمة المرور الجديدة <Save size={14}/></Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 text-right" /></div>
              <Button onClick={handleUpdatePassword} disabled={changingPass || !currentPassword || !newPassword} className="w-full h-14 rounded-2xl bg-orange-600 font-black">{changingPass ? "جاري التحديث..." : "تحديث كلمة المرور 🔐"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-accent/5 p-6 border-b border-border text-right"><CardTitle className="text-lg font-black text-accent flex items-center justify-end gap-3">التواصل والدعم الفني <MessageSquare size={20} /></CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <a href="https://wa.me/218929196425" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full h-14 rounded-2xl border-green-100 bg-green-50/30 text-green-700 font-black gap-2"><Phone size={18} /> واتساب</Button></a>
              <a href="https://artiatechstudio.com.ly" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full h-14 rounded-2xl border-blue-100 bg-blue-50/30 text-blue-700 font-black gap-2"><Globe size={18} /> الموقع الرسمي</Button></a>
              <a href="https://x.com/artiatechstudio" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/30 text-slate-700 font-black gap-2"><Twitter size={18} /> منصة X</Button></a>
              <a href="https://instagram.com/artiatechstudio" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full h-14 rounded-2xl border-pink-100 bg-pink-50/30 text-pink-700 font-black gap-2"><Instagram size={18} /> إنستغرام</Button></a>
              <a href="https://youtube.com/@artiatechstudio" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full h-14 rounded-2xl border-red-100 bg-red-50/30 text-red-700 font-black gap-2"><Youtube size={18} /> يوتيوب</Button></a>
              <a href="https://www.facebook.com/share/1cJCMxmp9f/" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full h-14 rounded-2xl border-blue-200 bg-blue-50/50 text-blue-800 font-black gap-2"><Facebook size={18} /> فيسبوك</Button></a>
            </div>
            <a href="mailto:artiateech@gmail.com" className="block w-full"><Button variant="ghost" className="w-full h-12 rounded-2xl bg-secondary/50 text-muted-foreground font-bold">{userData?.email || 'artiateech@gmail.com'}</Button></a>
          </CardContent>
        </Card>

        <div className="pt-6 flex flex-col gap-3 mx-2">
          <Button onClick={handleLogout} variant="outline" className="h-14 rounded-2xl border-2 border-primary text-primary font-black"><LogOut className="ml-2" /> تسجيل الخروج</Button>
          {userData?.name !== 'admin' && <Button onClick={handleDeleteAccount} variant="ghost" className="h-14 rounded-2xl text-destructive font-black"><Trash2 className="ml-2" /> حذف الحساب نهائياً</Button>}
        </div>
      </div>
    </div>
  );
}
