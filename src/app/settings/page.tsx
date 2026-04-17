
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, remove, set } from 'firebase/database';
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

const AVATAR_EMOJIS = ["🐱", "🐶", "🦊", "🦁", "🐯", "🐨", "🐼", "🐸", "🐵", "🐥", "🦄", "🐲", "octopus", "🦖", "🐢", "🦋", "🌵", "🚀", "🌈", "🔥", "⚽", "🎸", "🍕", "🍦", "🍎", "🥝", "🍉", "🍇", "🥦", "🥑", "🍔", "💎", "👑"];

export default function SettingsPage() {
  const { user } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading } = useDatabase(userRef);

  // جلب الصورة من المسار المنفصل
  const avatarImageRef = useMemoFirebase(() => user ? ref(database, `avatars/${user.uid}`) : null, [database, user]);
  const { data: avatarImageData } = useDatabase(avatarImageRef);

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
  const [requestPhone, setRequestPhone] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean | null>(null);

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
    const savedMute = localStorage.getItem('careingo_muted') === 'true';
    setIsMuted(savedMute);
  }, [userData]);

  const toggleTheme = () => {
    if (theme === null) return;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    playSound('click');
  };

  const toggleMute = (checked: boolean) => {
    setIsMuted(checked);
    localStorage.setItem('careingo_muted', checked.toString());
    if (!checked) playSound('click');
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
      // إذا اختار إيموجي، نمسح الصورة الشخصية المحملة (إذا وجدت)
      if (!avatar.startsWith('data:image') && !avatar.startsWith('http')) {
        await remove(ref(database, `avatars/${user.uid}`));
      }

      await update(ref(database, `users/${user.uid}`), {
        name: isAdmin ? 'admin' : name,
        age: a,
        gender,
        height: h,
        weight: w,
        avatar,
        bio: bio.slice(0, 30)
      });
      toast({ title: "تم التحديث بنجاح! ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
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
          const MAX_SIZE = 300; 
          let width = img.width, height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); 
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
      toast({ variant: "destructive", title: "ميزة بريميوم 👑", description: "تحميل صورة بروفايل حقيقية متاح فقط للعضوية الملكية." });
      return;
    }
    setIsUploading(true);
    playSound('click');
    try {
      const base64Image = await compressAndConvertToBase64(file);
      // حفظ الصورة في مسار منفصل تماماً لتسريع التطبيق
      await set(ref(database, `avatars/${user.uid}`), base64Image);
      // تحديث إشارة الأفاتار في ملف المستخدم ليكون مجرد نص "custom"
      await update(ref(database, `users/${user.uid}`), { avatar: base64Image });
      setAvatar(base64Image);
      toast({ title: "تم تغيير المظهر بنجاح! 📸" });
      playSound('success');
    } catch (error) {
      toast({ variant: "destructive", title: "فشل معالجة الصورة" });
    } finally { setIsUploading(false); }
  };

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword) return;
    setChangingPass(true);
    playSound('click');
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "تم تأمين حسابك بكلمة مرور جديدة! 🔐" });
      setCurrentPassword(''); setNewPassword('');
    } catch (error) { toast({ variant: "destructive", title: "خطأ في التحقق من كلمة المرور" }); }
    finally { setChangingPass(false); }
  };

  const handleSendPremiumRequest = async () => {
    if (!user) return;
    if (!requestPhone.trim() || requestPhone.length < 10) {
      toast({ variant: "destructive", title: "رقم الهاتف ناقص" });
      return;
    }
    setIsSubmittingRequest(true);
    playSound('click');
    let ussd = selectedPlan === '7days' ? "*122*0922813618*1*1#" : selectedPlan === '1month' ? "*122*0922813618*3*1#" : "*122*0922813618*15*1#";
    try {
      window.location.href = `tel:${ussd.replace('#', '%23')}`;
      await update(ref(database, `users/${user.uid}/premiumRequest`), {
        status: 'pending', duration: selectedPlan, phoneNumber: requestPhone.trim(), requestedAt: Date.now()
      });
      toast({ title: "تم إرسال الطلب! ⏳", description: "سيتم التفعيل فور مطابقة التحويل." });
      setIsRequestOpen(false);
    } catch (e) { toast({ variant: "destructive", title: "فشل الطلب" }); }
    finally { setIsSubmittingRequest(false); }
  };

  if (isLoading || theme === null) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  const currentAvatar = avatarImageData || avatar;
  const isImageAvatarDisplay = currentAvatar && (currentAvatar.startsWith('http') || currentAvatar.startsWith('data:image'));

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10">
        <header className="flex items-center gap-4 text-right mx-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0"><Settings size={32} /></div>
          <div><h1 className="text-2xl font-black text-primary">الإعدادات</h1><p className="text-xs text-muted-foreground font-bold">إدارة ملفك الشخصي وعضويتك</p></div>
        </header>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right">
            <CardTitle className="text-lg font-black text-primary flex items-center gap-2 justify-end">تخصيص التجربة <Sparkles size={20} /></CardTitle>
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
              <Switch checked={isMuted || false} onCheckedChange={toggleMute} className="scale-125 data-[state=checked]:bg-destructive" />
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
                : <p>اشترك الآن وافتح كافة القيود وتخلص من الإعلانات تماماً واستمتع بمميزات حصرية مثل صور البروفايل.</p>}
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
              {userData?.premiumRequest?.status === 'pending' ? (
                <div className="w-full h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center gap-3">
                  <Clock size={20} className="text-yellow-300" />
                  <span className="text-xs font-black">طلبك تحت الإجراء حالياً... ⏳</span>
                </div>
              ) : (
                <Button onClick={() => { playSound('click'); setIsRequestOpen(true); }} className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-lg font-black">اطلب اشتراك بريميوم 👑</Button>
              )}
            </div>
          )}
        </Card>

        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogContent className="rounded-[2.5rem] p-8" dir="rtl">
            <DialogHeader><DialogTitle className="text-2xl font-black text-primary text-right">طلب اشتراك بريميوم</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-xs font-black text-primary">1. اختر باقة النمو</Label>
                {[{id:'7days',l:'أسبوع (تجريبي)',p:'1 د.ل'},{id:'1month',l:'شهر (اقتصادي)',p:'3 د.ل'},{id:'6months',l:'6 أشهر (احترافي)',p:'15 د.ل'}].map(p=>(
                  <div key={p.id} onClick={()=>setSelectedType(p.id)} className={cn("p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between", selectedPlan === p.id ? "border-primary bg-primary/5" : "border-border")}>
                    <div className="flex items-center gap-3">{selectedPlan === p.id ? <CheckCircle2 className="text-primary"/> : <div className="w-6 h-6 rounded-full border-2 border-border"/>}<span className="font-black text-sm">{p.l}</span></div>
                    <span className="bg-secondary px-3 py-1 rounded-full text-xs font-black text-primary">{p.p}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black text-primary">2. رقم الهاتف (للتحقق)</Label>
                <Input placeholder="09XXXXXXXX" type="tel" className="h-14 rounded-2xl bg-secondary/50 border-none font-black text-center text-lg" value={requestPhone} onChange={e=>setRequestPhone(e.target.value)}/>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSendPremiumRequest} disabled={isSubmittingRequest} className="w-full h-14 rounded-2xl font-black text-xl bg-primary shadow-lg">{isSubmittingRequest ? "جاري الإرسال..." : "تأكيد الطلب 🐱"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right"><CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-3">تعديل الملف الشخصي <UserIcon size={20} /></CardTitle></CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="flex flex-col items-center gap-6">
               <div className="relative">
                 <div className="w-32 h-32 md:w-40 md:h-40 bg-secondary/50 rounded-[2.5rem] shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800">
                   { isImageAvatarDisplay ? <img src={currentAvatar} alt="Avatar" className="object-cover w-full h-full" /> : <span className="text-7xl md:text-8xl">{currentAvatar}</span> }
                   {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20"><Loader2 className="text-white animate-spin" size={32} /></div>}
                 </div>
                 <button onClick={() => isPremium ? fileInputRef.current?.click() : toast({title:"ميزة بريميوم 👑"})} className={cn("absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 transition-all z-30", isPremium ? "bg-primary text-white" : "bg-slate-400 text-slate-200")}><Camera size={20} /></button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>
               <div className="w-full space-y-2">
                 <Label className="text-right block w-full text-[10px] font-black uppercase text-muted-foreground">أو اختر رمزاً تعبيرياً</Label>
                 <div className="flex flex-wrap justify-center gap-2 p-2 bg-secondary/20 rounded-2xl">
                   {AVATAR_EMOJIS.slice(0, 15).map(emoji => (
                     <button key={emoji} onClick={() => setAvatar(emoji)} className={cn("text-2xl w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white transition-colors", avatar === emoji && "bg-white shadow-md border-2 border-primary/20")}>{emoji}</button>
                   ))}
                 </div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2"><Label className="flex items-center gap-2 justify-end"><PenLine size={16} /> نبذة قصيرة</Label><Input value={bio} maxLength={30} onChange={e => setBio(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2 col-span-1 md:col-span-2"><Label className="text-right block w-full">الاسم الكامل</Label><Input value={name} onChange={e => setName(e.target.value)} disabled={isAdmin} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2"><Label className="text-right block w-full">العمر</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2"><Label className="text-right block w-full">الجنص</Label><Select onValueChange={setGender} value={gender}><SelectTrigger className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-right block w-full">الطول (سم)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2"><Label className="text-right block w-full">الوزن (كجم)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <Button onClick={handleUpdateProfile} disabled={saving} className="col-span-1 md:col-span-2 h-14 rounded-2xl bg-primary text-lg font-black">{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border mx-2">
          <CardHeader className="bg-accent/5 p-6 border-b border-border text-right"><CardTitle className="text-lg font-black text-accent flex items-center justify-end gap-3">تأمين الحساب <Lock size={20} /></CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-right block w-full">كلمة المرور الحالية</Label><Input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <div className="space-y-2"><Label className="text-right block w-full">كلمة المرور الجديدة</Label><Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="rounded-xl bg-secondary/30 border-none h-12 font-bold text-right" /></div>
              <Button onClick={handleUpdatePassword} disabled={changingPass} variant="outline" className="w-full h-12 rounded-xl border-2 border-accent text-accent font-black">{changingPass ? "جاري التحديث..." : "تغيير كلمة المرور"}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="pt-6 flex flex-col gap-3 mx-2">
          <Button onClick={handleLogout} variant="outline" className="h-14 rounded-2xl border-2 border-primary text-primary font-black"><LogOut className="ml-2" /> تسجيل الخروج</Button>
          {!isAdmin && <Button onClick={() => { if(window.confirm("تحذير نهائي! هل أنت متأكد؟ 🐱⚠️")) remove(ref(database, `users/${user?.uid}`)).then(()=>signOut(auth)) }} variant="ghost" className="h-14 rounded-2xl text-destructive font-black"><Trash2 className="ml-2" /> حذف الحساب نهائياً</Button>}
        </div>
      </div>
    </div>
  );
}
