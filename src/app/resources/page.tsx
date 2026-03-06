
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Shield, ScrollText, Heart, HelpCircle, ExternalLink, MessageSquare, Instagram, Facebook, Youtube, Send, Phone, AlertTriangle, Lightbulb, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ResourcesPage() {
  const socialLinks = [
    { name: 'واتساب', icon: Phone, url: 'https://wa.me/249929196425', color: 'bg-green-500' },
    { name: 'فيسبوك', icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61584838507463', color: 'bg-blue-600' },
    { name: 'انستجرام', icon: Instagram, url: 'https://instagram.com/artiatechstudio', color: 'bg-pink-600' },
    { name: 'يوتيوب', icon: Youtube, url: 'https://youtube.com/@artiatechstudio?si=80mNO6QsIRP7mn5z', color: 'bg-red-600' },
    { name: 'إيميل', icon: Send, url: 'mailto:artiateech@gmail.com', color: 'bg-primary' },
  ];

  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-32">
        <header className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary">مركز الموارد</h1>
              <p className="text-muted-foreground font-medium text-lg">بوابتك للمعرفة، الصحة، والدعم الفني.</p>
            </div>
          </div>
        </header>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <Heart className="text-accent" /> نصائحنا الذهبية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg rounded-[2rem] bg-card border border-border hover:scale-[1.02] transition-transform">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Activity size={24} />
                </div>
                <h3 className="font-black text-xl text-primary">معلومات صحية</h3>
                <p className="text-sm text-muted-foreground font-bold">اشرب 8 أكواب ماء يومياً، ونم 7-8 ساعات لتحسين كفاءة عقلك وجسدك.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-[2rem] bg-card border border-border hover:scale-[1.02] transition-transform">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="font-black text-xl text-primary">حالات الطوارئ</h3>
                <p className="text-sm text-muted-foreground font-bold">توقف فوراً إذا شعرت بألم حاد. ابقِ هاتفك قريباً وتعرف على أرقام الطوارئ المحلية.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-[2rem] bg-card border border-border hover:scale-[1.02] transition-transform">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                  <Lightbulb size={24} />
                </div>
                <h3 className="font-black text-xl text-primary">التحسين الذاتي</h3>
                <p className="text-sm text-muted-foreground font-bold">ابدأ صغيراً بـ 5 دقائق يومياً. الانضباط يتغلب على الدافع الموقت في المدى البعيد.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <MessageSquare className="text-accent" /> تواصل معنا
          </h2>
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-right space-y-2">
                <h3 className="text-2xl font-black">أعطنا رأيك أو اطلب الدعم</h3>
                <p className="opacity-80 font-bold">فريق Artiatech Studio جاهز لسماع اقتراحاتك لتطوير كارينجو.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button className={`w-12 h-12 rounded-full p-0 ${link.color} text-white shadow-lg hover:scale-110 transition-transform`}>
                      <link.icon size={24} />
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <HelpCircle className="text-accent" /> الأسئلة الشائعة
          </h2>
          <Card className="border-none shadow-xl rounded-[2.5rem] p-4 bg-white">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  ما هو نظام الـ 30 يوماً؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  يعتمد كارينجو على نموذج 30 يوماً لبناء عادات مستدامة. كل مسار يتكون من 30 مرحلة، ويمكنك إنجاز مرحلة واحدة فقط يومياً لضمان النمو الحقيقي.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-4" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  كيف أحافظ على سلسلة الحماسة؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  يجب عليك إكمال مهمة واحدة على الأقل في أي مسار قبل نهاية اليوم (الساعة 12 منتصف الليل بتوقيتك المحلي) لضمان عدم تصفير العداد.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-5" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  لماذا أحصل على نقاط إضافية في الصباح؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  هذا هو "بونص التبكير"! يبدأ من الساعة 5 صباحاً، وكلما أنجزت مهمتك مبكراً، زادت المكافأة لتحفيزك على بدء يومك بنشاط.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <Shield className="text-accent" /> القانون والخصوصية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-md rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 text-primary">
                <Shield size={24} />
                <h4 className="font-black">سياسة الخصوصية</h4>
              </div>
              <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                نحن في Artiatech Studio نحترم خصوصيتك. بياناتك (الطول، الوزن، العمر) تُستخدم محلياً لتخصيص تجربتك ولا يتم مشاركتها مع أطراف خارجية.
              </p>
            </Card>
            <Card className="border-none shadow-md rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 text-primary">
                <ScrollText size={24} />
                <h4 className="font-black">الشروط والأحكام</h4>
              </div>
              <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                باستخدامك لكارينجو، أنت توافق على تحمل مسؤولية صحتك الجسدية. التطبيق رفيق للنمو وليس بديلاً عن الاستشارة الطبية المتخصصة.
              </p>
            </Card>
          </div>
        </section>

        <div className="text-center py-10 opacity-40 font-black text-primary text-xs">
          جميع الحقوق محفوظة © Artiatech Studio 2024
        </div>
      </div>
    </div>
  );
}
