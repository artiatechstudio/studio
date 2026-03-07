
"use client"

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sounds';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    playSound('click');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      playSound('success');
      toast({ title: "تم إرسال الرابط!", description: "تفقد بريدك الإلكتروني (بما في ذلك الرسائل غير المرغوب فيها)." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "تأكد من صحة البريد الإلكتروني المدخل." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-6" dir="rtl">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card border border-border">
        <CardHeader className="bg-primary text-white p-8 text-center relative">
          <Link href="/login" className="absolute left-6 top-8 text-white/80 hover:text-white" onClick={() => playSound('click')}>
            <ArrowLeft size={24} className="rotate-180" />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <CardTitle className="text-2xl font-black">استعادة كلمة المرور</CardTitle>
          <p className="opacity-80 font-medium mt-2">سنرسل لك رابطاً لإعادة تعيين الكلمة</p>
        </CardHeader>
        <CardContent className="p-10">
          {!sent ? (
            <form onSubmit={handleReset} className="space-y-6 text-right">
              <div className="space-y-2">
                <Label>البريد الإلكتروني المسجل</Label>
                <Input 
                  type="email" 
                  placeholder="example@mail.com" 
                  className="h-14 rounded-2xl bg-secondary/50 border-none font-bold text-right"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black shadow-lg"
              >
                {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة 🚀"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-primary">تم الإرسال بنجاح!</h3>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  يرجى التحقق من بريدك الإلكتروني **{email}** واتباع التعليمات لإعادة تعيين كلمة مرورك.
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full h-12 rounded-2xl font-black mt-4">العودة لتسجيل الدخول</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
