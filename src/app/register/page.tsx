
"use client"

import React, { useState } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { UserPlus, ArrowLeft, User, Ruler, Weight, Calendar } from 'lucide-react';

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // تخزين البيانات في Realtime Database مباشرة بعد إنشاء الحساب
      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        name,
        email,
        age: parseInt(age),
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        points: 0,
        streak: 0,
        registrationDate: new Date().toISOString(),
        badges: ['عضو جديد 🐱'],
        trackProgress: {
          Fitness: { currentStage: 1, completedStages: [] },
          Nutrition: { currentStage: 1, completedStages: [] },
          Behavior: { currentStage: 1, completedStages: [] },
          Study: { currentStage: 1, completedStages: [] },
        }
      });

      toast({ title: "أهلاً بك في كارينجو!", description: "تم إنشاء حسابك بنجاح." });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التسجيل", description: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4 md:p-10">
      <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card">
        <CardHeader className="bg-accent text-white p-8 text-center relative">
          <Link href="/login" className="absolute left-6 top-8 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">🐱</div>
          <CardTitle className="text-3xl font-black">انضم إلى مجتمع كاري</CardTitle>
          <p className="opacity-80 font-medium mt-2">رحلة الـ 120 مرحلة تبدأ هنا</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>الاسم الكامل</Label>
              <Input 
                placeholder="أدخل اسمك" 
                className="h-12 rounded-xl bg-secondary/50 border-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                className="h-12 rounded-xl bg-secondary/50 border-none"
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
                className="h-12 rounded-xl bg-secondary/50 border-none"
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
                className="h-12 rounded-xl bg-secondary/50 border-none"
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
                className="h-12 rounded-xl bg-secondary/50 border-none"
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
                className="h-12 rounded-xl bg-secondary/50 border-none"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required 
              />
            </div>

            <Button type="submit" className="w-full col-span-1 md:col-span-2 h-14 rounded-2xl bg-accent hover:bg-accent/90 text-lg font-black shadow-lg shadow-accent/20 mt-4">
              إتمام التسجيل والبدء 🐱
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
