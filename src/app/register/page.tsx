
"use client"

import React, { useState } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { playSound } from '@/lib/sounds';

const AVATAR_EMOJIS = [
  "🐱", "🐶", "🦊", "🦁", "🐯", "🐨", "🐼", "🐸", "🐵", "🐥", "🦄", "🐲",
  "🐧", "🦉", "🐙", "🦖", "🐢", "🦋", "🌵", "🚀", "🌈", "🔥", "⚽",
  "🎸", "🍕", "🍦", "🍎", "🥝", "🍉", "🍇", "🥦", "🥑", "🍔", "💎", "👑"
];

export default function RegisterPage() {
  const { auth, database } = useFirebase();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    
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

    setLoading(true);
    playSound('click');

    try {
      const dbRef = ref(database);
      
      // فحص فرادة اسم المستخدم ومنع الـ admin
      const usersSnapshot = await get(child(dbRef, 'users'));
      const allUsers = usersSnapshot.exists() ? Object.values(usersSnapshot.val()) : [];
      const normalizedName = name.trim().toLowerCase();
      
      const nameExists = allUsers.some((u: any) => u.name?.toLowerCase() === normalizedName);

      if (nameExists || normalizedName === 'admin') {
        toast({ variant: "destructive", title: "اسم المستخدم مأخوذ", description: "يرجى اختيار اسم آخر فريد وغير محجوز." });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const membershipRank = allUsers.length + 1;

      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        name: name.trim(),
        email,
        age: a,
        gender,
        height: h,
        weight: w,
        avatar,
        bio: "عضو جديد طموح 🌱",
        points: 0,
        streak: 0,
        isPremium: 0,
        registrationRank: membershipRank,
        registrationDate: new Date().toISOString(),
        badges: ['عضو جديد 🐱'],
        trackProgress: {
          Fitness: { currentStage: 1, completedStages: [] },
          Nutrition: { currentStage: 1, completedStages: [] },
          Behavior: { currentStage: 1, completedStages: [] },
          Study: { currentStage: 1, completedStages: [] },
        }
      });

      toast({ 
        title: "تم إرسال رابط التحقق!", 
        description: "يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب قبل الدخول." 
      });
      
      router.push('/login');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التسجيل", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4 md:p-10" dir="rtl">
      <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card border border-border">
        <CardHeader className="bg-accent text-white p-8 text-center relative">
          <Link href="/login" className="absolute left-6 top-8 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">{avatar}</div>
          <CardTitle className="text-3xl font-black">انضم إلى مجتمع كاري</CardTitle>
          <p className="opacity-80 font-medium mt-2">رحلة النمو تبدأ هنا</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>الاسم الكامل (سيستخدم كاسم مستخدم فريد)</Label>
              <Input 
                placeholder="أدخل اسمك" 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>اختر رفيقك (الأفاتار)</Label>
              <Select onValueChange={setAvatar} defaultValue="🐱">
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none text-2xl">
                  <SelectValue placeholder="اختر إيموجي" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-5 gap-2 p-2">
                    {AVATAR_EMOJIS.map(emoji => (
                      <SelectItem key={emoji} value={emoji} className="text-2xl cursor-pointer hover:bg-secondary rounded-lg justify-center p-2">
                        {emoji}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>العمر</Label>
              <Input 
                type="number" 
                placeholder="25" 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>الجنس</Label>
              <Select onValueChange={setGender} defaultValue="male">
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none">
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الطول (سم)</Label>
              <Input 
                type="number" 
                placeholder="170" 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>الوزن (كجم)</Label>
              <Input 
                type="number" 
                placeholder="70" 
                className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required 
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full col-span-1 md:col-span-2 h-14 rounded-2xl bg-accent hover:bg-accent/90 text-lg font-black shadow-lg shadow-accent/20 mt-4">
              {loading ? "جاري إنشاء الحساب..." : "إتمام التسجيل والبدء 🐱"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-bold">
            لديك حساب بالفعل؟ <Link href="/login" className="text-primary hover:underline">سجل دخولك من هنا</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
