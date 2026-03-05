
"use client"

import React, { useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase } from '@/firebase';
import { ref, remove, update } from 'firebase/database';
import { deleteUser } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Shield, Moon, Trash2, Save, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({ title: newTheme === 'dark' ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع الفاتح" });
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm("هل أنت متأكد تماماً؟ سيتم حذف كافة نقاطك، إنجازاتك، وتقدمك نهائياً!")) return;
    
    setLoading(true);
    try {
      // 1. حذف البيانات من Realtime Database
      await remove(ref(database, `users/${user.uid}`));
      
      // 2. حذف المستخدم من Firebase Auth
      await deleteUser(user);
      
      toast({ title: "تم حذف الحساب", description: "نتمنى أن نراك مجدداً في رحلة نمو أخرى." });
      router.push('/login');
    } catch (e: any) {
      console.error(e);
      toast({ 
        variant: "destructive", 
        title: "خطأ في الحذف", 
        description: "يرجى تسجيل الدخول مجدداً للتحقق من هويتك قبل حذف الحساب." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
        <header className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Settings size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary">الإعدادات</h1>
            <p className="text-muted-foreground font-medium">إدارة تفضيلات حسابك وتجربة التطبيق.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Moon className="text-accent" />
                المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="text-accent" /> : <Sun className="text-yellow-500" />}
                  <div>
                    <p className="font-bold text-primary">الوضع الليلي</p>
                    <p className="text-sm text-muted-foreground">التبديل بين المظهر الفاتح والمظلم.</p>
                  </div>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Bell className="text-accent" />
                التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div>
                  <p className="font-bold text-primary">تذكيرات يومية</p>
                  <p className="text-sm text-muted-foreground">تنبيهك عندما يحين وقت مهمتك اليومية.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 shadow-none rounded-[2.5rem] bg-destructive/5 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-destructive flex items-center gap-3">
                <Trash2 />
                منطقة الخطر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <p className="text-muted-foreground text-sm font-medium">بمجرد حذف حسابك، ستختفي كافة نقاطك وسلسلة إنجازاتك للأبد.</p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="rounded-xl font-bold h-12 px-8"
              >
                حذف الحساب نهائياً
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
