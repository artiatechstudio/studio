
"use client"

import React, { useState, useEffect, useRef } from 'react';
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
import { Settings, LogOut, Save, User as UserIcon, PenLine, Crown, Sparkles, Globe, Trophy, Trash2, Clock, MessageSquare, Phone, Twitter, ShieldCheck, Lock, Instagram, Youtube, Facebook, Moon, Sun, CheckCircle2, Wallet, Volume2, VolumeX, Camera, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

const AVATAR_EMOJIS = ["🐱", "🐶", "🦊", "🦁", "🐯", "🐨", "🐼", "🐸", "🐵", "🐥", "🦄", "🐲", "🐙", "🦖", "🐢", "🦋", "🌵", "🚀", "🌈", "🔥", "⚽", "🎸", "🍕", "🍦", "🍎", "🥝", "🍉", "🍇", "🥦", "🥑", "🍔", "💎", "👑"];

export default function SettingsPage() {
  const { user } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [isUploading, setIsUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedPlan, setSelectedType] = useState('1month');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userData) {
      setName(userData.name || '');
      setAge(userData.age?.toString() || '');
      setGender(userData.gender || 'male');
      setHeight(userData.height?.toString() || '');
      setWeight(userData.weight?.toString() || '');
      setAvatar(userData.avatar || '🐱');
      setBio(userData.bio || '');
    }
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark' || 'light') : 'light';
    setTheme(savedTheme);
    const savedMute = typeof window !== 'undefined' ? (localStorage.getItem('careingo_muted') === 'true') : false;
    setIsMuted(savedMute);
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

  const toggleMute = (checked: boolean) => {
    setIsMuted(checked);
    localStorage.setItem('careingo_muted', checked.toString());
    if (!checked) playSound('click');
    toast({ title: checked ? "تم كتم الأصوات 🔇" : "تم تفعيل الأصوات 🔊" });
  };

  const isAdmin = userData?.name === 'admin';
  const isPremium = userData?.isPremium === 1 || isAdmin;

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

  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!isPremium) {
      toast({ variant: "destructive", title: "ميزة بريميوم 👑", description: "تحميل صورة بروفايل شخصية متاح فقط لمشتركي العضوية الملكية." });
      return;
    }

    setIsUploading(true);
    playSound('click');
    
    try {
      const base64Image = await compressAndConvertToBase64(file);
      await update(ref(database, `users/${user.uid}`), {
        avatar: base64Image
      });
      setAvatar(base64Image);
      toast({ title: "تم التحديث بنجاح! 📸", description: "تم تغيير مظهرك الملكي بنجاح." });
      playSound('success');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل المعالجة" });
    } finally {
      setIsUploading(false);
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

    let ussdCode = "";
    if (selectedPlan === '7days') ussdCode = "*122*0922813618*1000*1#";
    else if (selectedPlan === '1month') ussdCode = "*122*0922813618*3000*1#";
    else if (selectedPlan === '6months') ussdCode = "*122*0922813618*15000*1#";

    try {
      window.location.href = `tel:${ussdCode.replace('#', '%23')}`;
      await update(ref(database, `users/${user.uid}/premiumRequest`), {
        status: 'pending',
        duration: selectedPlan,
        requestedAt: Date.now()
      });
      toast({ title: "جاري المعالجة... ⏳", description: "طلبك تحت الإجراء حالياً، سيتم التفعيل يدوياً بعد التأكد من التحويل." });
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
    if (isAdmin) return;
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

  if (!mounted || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const requestStatus = userData?.premiumRequest?.status;
  const isImageAvatar = avatar && (avatar.startsWith('http') || avatar.startsWith('data:image'));

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10">
        <header className="flex items-center gap-4 text-right mx-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0"><Settings size={32} /></div>
          <div><h1 className="text-2xl font-black text-primary">الإعدادات</h1><p className="text-xs text-muted-foreground font-bold">إدارة ملفك الشخصي</p></div>
        </header>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right">
            <CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-3">تخصيص التجربة <Sparkles size={20} /></CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            <div className="p-6 flex items-center justify-between">
              <div className="text-right">
                <p className="font-black text-primary text-sm flex items-center gap-2 justify-end">الوضع {theme === 'dark' ? 'الداكن' : 'المضيء'}{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</p>
                <p className="text-[10px] text-muted-foreground font-bold">تغيير مظهر التطبيق</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} className="scale-125 data-[state=checked]:bg-primary" />
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="text-right">
                <p className="font-black text-primary text-sm flex items-center gap-2 justify-end">المؤثرات الصوتية {isMuted ? <VolumeX size={16} className="text-destructive" /> : <Volume2 size={16} className="text-green-600" />}</p>
                <p className="text-[10px] text-muted-foreground font-bold">كتم أو تفعيل أصوات التطبيق</p>
              </div>
              <Switch checked={isMuted} onCheckedChange={toggleMute} className="scale-125 data-[state=checked]:bg-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-none shadow-2xl rounded-[3rem] text-white overflow-hidden p-8 flex flex-col gap-6 relative mx-2 transition-all duration-500", 
          userData?.isPremium === 1 ? "bg-amber-600" : "bg-slate-800"
        )}>
          <div className="relative z-10 flex flex-col gap-2 text-right">
            <div className="flex items-center justify-end gap-3">
              <h2 className="text-2xl font-black">عضوية Careingo المميزة</h2>
              <Crown size={28} fill="currentColor" className="text-yellow-300" />
            </div>
            <div className="text-sm font-bold opacity-90 leading-relaxed max-w-lg self-end text-right">
              {userData?.isPremium === 1 
                ? (isAdmin ? <p>أنت مدير النظام! اشتراكك دائم ولا يخضع لانتهاء الصلاحية. 🛡️</p> : <p>أنت مستخدم بريميوم! اشتراكك فعال وينتهي في: {userData.premiumUntil ? new Date(userData.premiumUntil).toLocaleDateString() : 'غير محدد'}</p>) 
                : <p>اشترك الآن وافتح كافة القيود وتخلص من الإعلانات تماماً واستمتع بمميزات حصرية.</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10">
            {[{ t: "حصانة الحماسة", i: ShieldCheck }, { t: "صورة بروفايل شخصية", i: ImageIcon }, { t: "بدون إعلانات", i: Sparkles }, { t: "توثيق ملكي", i: Crown }].map((m, i) => (
              <div key={i} className="flex items-center gap-2 justify-end bg-black/20 p-3 rounded-2xl">
                <span className="text-[10px] font-black">{m.t}</span>
                <m.i size={16} className="text-yellow-300" />
              </div>
            ))}
          </div>

          {userData?.isPremium !== 1 && (
            <div className="relative z-10 pt-2 w-full">
              {requestStatus === 'pending' ? (
                <div className="w-full h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center gap-3 shadow-inner px-4">
                  <Clock size={20} className="text-yellow-300 shrink-0" />
                  <span className="text-xs md:text-sm font-black text-white text-right">طلبك تحت الإجراء حالياً... ⏳</span>
                </div>
              ) : (
                <Button 
                  onClick={() => { playSound('click'); setIsRequestOpen(true); }} 
                  className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-lg font-black shadow-xl"
                >
                  اطلب اشتراك بريميوم 👑
                </Button>
              )}
            </div>
          )}
        </Card>

        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary text-right">اختر باقة النمو</DialogTitle>
              <DialogDescription className="text-right font-bold">باقات بسيطة لتجربة ملكية كاملة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {[
                { id: '7days', label: 'أسبوع واحد (تجريبي)', price: '1 د.ل' },
                { id: '1month', label: 'شهر كامل (اقتصادي)', price: '3 د.ل' },
                { id: '6months', label: '6 أشهر (احترافي)', price: '15 د.ل' }
              ].map((plan) => (
                <div key={plan.id} onClick={() => { playSound('click'); setSelectedType(plan.id); }} className={cn("p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between", selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20")}>
                  <div className="flex items-center gap-3">{selectedPlan === plan.id ? <CheckCircle2 className="text-primary" /> : <div className="w-6 h-6 rounded-full border-2 border-border" />}<span className="font-black text-sm">{plan.label}</span></div>
                  <span className="bg-secondary px-3 py-1 rounded-full text-xs font-black text-primary">{plan.price}</span>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button onClick={handleSendPremiumRequest} disabled={isSubmittingRequest} className="w-full h-12 rounded-xl font-black text-lg">
                {isSubmittingRequest ? "جاري الإرسال..." : "تأكيد الطلب والتحويل 🐱"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right"><CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-3">تعديل المعلومات الشخصية <UserIcon size={20} /></CardTitle></CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="flex flex-col items-center gap-6">
               <div className="relative">
                 <div className="w-32 h-32 md:w-40 md:h-40 bg-secondary/50 rounded-[2.5rem] shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 relative">
                   { isImageAvatar ? (
                     <img src={avatar} alt="Avatar" className="object-cover w-full h-full" />
                   ) : (
                     <span className="text-7xl md:text-8xl">{avatar}</span>
                   )}
                   {isUploading && (
                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                       <Loader2 className="text-white animate-spin mb-2" size={32} />
                       <span className="text-white font-black text-[10px]">جاري التحميل...</span>
                     </div>
                   )}
                 </div>
                 
                 <button 
                   onClick={() => {
                     if (!isPremium) {
                       toast({ variant: "destructive", title: "ميزة بريميوم 👑", description: "تحميل صورة بروفايل شخصية متاح فقط لمشتركي العضوية الملكية." });
                       return;
                     }
                     fileInputRef.current?.click();
                   }}
                   disabled={isUploading}
                   className={cn(
                     "absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 transition-all z-30",
                     isPremium ? "bg-primary text-white hover:scale-110 active:scale-95" : "bg-slate-400 text-slate-200 cursor-not-allowed opacity-80"
                   )}
                 >
                   {isPremium ? <Camera size={20} /> : <Lock size={20} />}
                 </button>
                 
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleImageUpload}
                 />
               </div>
               
               {!isPremium && (
                 <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-[10px] font-black border border-orange-100 flex items-center gap-2">
                   <AlertCircle size={14} /> ميزة تحميل صورة بروفايل شخصية حصرية للبريميوم 👑
                 </div>
               )}

               <div className="w-full space-y-2">
                 <Label className="text-right block w-full">أو اختر إيموجي</Label>
                 <div className="flex flex-wrap justify-center gap-2 p-2 bg-secondary/20 rounded-2xl">
                   {AVATAR_EMOJIS.slice(0, 15).map(emoji => (
                     <button 
                       key={emoji} 
                       onClick={() => setAvatar(emoji)}
                       className={cn(
                         "text-2xl w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white transition-colors",
                         avatar === emoji && "bg-white shadow-md scale-110 border-2 border-primary/20"
                       )}
                     >
                       {emoji}
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2"><Label className="flex items-center gap-2 justify-end"><PenLine size={16} /> نبذة قصيرة</Label><Input value={bio} maxLength={30} onChange={e => setBio(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2 col-span-1 md:col-span-2"><Label className="text-right block w-full">الاسم الكامل {isAdmin && "(لا يمكن تغييره للمدير)"}</Label><Input value={name} onChange={e => setName(e.target.value)} disabled={isAdmin} className={cn("rounded-xl bg-secondary/30 border-none h-12 font-bold text-right", isAdmin && "opacity-50")} /></div>
              <div className="space-y-2"><Label className="text-right block w-full">العمر</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2"><Label className="text-right block w-full">الجنس</Label><Select onValueChange={setGender} value={gender}><SelectTrigger className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-right block w-full">الطول</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2"><Label className="text-right block w-full">الوزن</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <Button onClick={handleUpdateProfile} disabled={saving} className="col-span-1 md:col-span-2 h-14 rounded-2xl bg-primary text-lg font-black">{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
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
            </div>
          </CardContent>
        </Card>

        <div className="pt-6 flex flex-col gap-3 mx-2">
          <Button onClick={handleLogout} variant="outline" className="h-14 rounded-2xl border-2 border-primary text-primary font-black"><LogOut className="ml-2" /> تسجيل الخروج</Button>
          {!isAdmin && <Button onClick={handleDeleteAccount} variant="ghost" className="h-14 rounded-2xl text-destructive font-black"><Trash2 className="ml-2" /> حذف الحساب نهائياً</Button>}
        </div>
      </div>
    </div>
  );
}
