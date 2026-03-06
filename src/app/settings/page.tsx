"use client"

import React, { useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, remove } from 'firebase/database';
import { deleteUser, signOut } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Settings, Moon, Sun, Trash2, LogOut, Save, User as UserIcon, Phone, Mail, Globe, Instagram, Facebook, Youtube, PenLine } from 'lucide-react';
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
  const [isDark, setIsDark] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light';
    setIsDark(savedTheme === 'dark');
  }, [userData]);

  const toggleTheme = () => {
    playSound('click');
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast({ title: newTheme === 'dark' ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع الفاتح" });
  };

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

  const socialLinks = [
    { name: 'فيسبوك', icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61584838507463', color: 'bg-blue-600' },
    { name: 'انستجرام', icon: Instagram, url: 'https://instagram.com/artiatechstudio', color: 'bg-pink-600' },
    { name: 'يوتيوب', icon: Youtube, url: 'https://youtube.com/@artiatechstudio?si=80mNO6QsIRP7mn5z', color: 'bg-red-600' },
    { name: 'الموقع', icon: Globe, url: 'https://artiatechstudio.com.ly', color: 'bg-slate-700' },
  ];

  const contactLinks = [
    { name: 'واتساب', icon: Phone, url: 'https://wa.me/218929196428', color: 'bg-green-500' },
    { name: 'إيميل', icon: Mail, url: 'mailto:artiateech@gmail.com', color: 'bg-primary' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 md:pr-72" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10">
        <header className="flex items-center gap-4 text-right">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary">الإعدادات</h1>
            <p className="text-xs text-muted-foreground font-bold">إدارة ملفك الشخصي وتجربة التطبيق</p>
          </div>
        </header>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border">
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

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border">
          <CardHeader className="bg-primary/5 p-6 border-b border-border text-right">
            <CardTitle className="text-lg font-black text-primary flex items-center justify-end gap-3">
              تخصيص الواجهة <Sun size={20} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", isDark ? "bg-primary text-white" : "bg-yellow-100 text-yellow-600")}>
                {isDark ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div className="text-right">
                <p className="font-black text-primary text-sm">الوضع الليلي</p>
                <p className="text-[10px] text-muted-foreground font-bold">تغيير مظهر التطبيق لراحة عينيك</p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-6 border border-border">
            <h3 className="text-lg font-black text-primary mb-4 text-right">تواصل معنا</h3>
            <div className="space-y-3">
              {contactLinks.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-colors">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", link.color)}>
                    <link.icon size={20} />
                  </div>
                  <span className="font-black text-primary text-sm">{link.name}</span>
                </a>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-card p-6 border border-border">
            <h3 className="text-lg font-black text-primary mb-4 text-right">مواقعنا</h3>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-colors text-center">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", link.color)}>
                    <link.icon size={20} />
                  </div>
                  <span className="text-[10px] font-black text-primary">{link.name}</span>
                </a>
              ))}
            </div>
          </Card>
        </div>

        <div className="pt-6 flex flex-col gap-3">
          <Button onClick={handleLogout} variant="outline" className="h-14 rounded-2xl border-2 border-primary text-primary font-black hover:bg-primary/5">
            <LogOut className="ml-2" /> تسجيل الخروج
          </Button>
          <Button onClick={handleDeleteAccount} variant="ghost" className="h-14 rounded-2xl text-destructive font-black hover:bg-destructive/10">
            <Trash2 className="ml-2" /> حذف الحساب نهائياً
          </Button>
        </div>

        <footer className="text-center pt-10 opacity-30 font-black text-primary text-xs">
          Careingo v2.0 - Developed by Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
