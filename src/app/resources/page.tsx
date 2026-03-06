
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Heart, Lightbulb, ChevronLeft, AlertTriangle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import { playSound } from '@/lib/sounds';

export default function ResourcesPage() {
  const categories = [
    {
      title: "دليل التعليمات",
      description: "تعرف على آليات حساب النقاط، الحماسة، وكيفية تصدر القائمة.",
      icon: Info,
      href: "/resources/instructions",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "الموسوعة الصحية",
      description: "دليلك الشامل للتغذية، الترطيب، والنوم المثالي لنمو جسدي سليم.",
      icon: Heart,
      href: "/resources/health",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      title: "دليل السلامة والطوارئ",
      description: "تعلم كيف تتعامل مع الإصابات ومتى يجب عليك التوقف فوراً لسلامتك.",
      icon: AlertTriangle,
      href: "/resources/safety",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "أسرار التحسين الذاتي",
      description: "قواعد ذهبية لبناء الانضباط، الاستمرارية، وتطوير العقلية الإيجابية.",
      icon: Lightbulb,
      href: "/resources/growth",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-32">
        <header className="space-y-4 text-right">
          <div className="flex items-center justify-start gap-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl">
              < BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary">مركز الموارد</h1>
              <p className="text-muted-foreground font-medium text-lg">استكشف أدلة النمو والتعليمات الشاملة.</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} onClick={() => playSound('click')}>
              <Card className="h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden hover:scale-[1.03] transition-all cursor-pointer group">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <div className={`w-16 h-16 ${cat.bgColor} ${cat.color} rounded-[1.5rem] flex items-center justify-center mb-2 group-hover:rotate-6 transition-transform`}>
                    <cat.icon size={32} />
                  </div>
                  <h3 className="text-xl font-black text-primary">{cat.title}</h3>
                  <p className="text-muted-foreground font-bold text-xs leading-relaxed line-clamp-2">{cat.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-primary font-black text-sm">
                    عرض التفاصيل <ChevronLeft size={16} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section className="bg-card p-8 rounded-[2.5rem] shadow-xl border border-border">
          <h2 className="text-2xl font-black text-primary mb-6 text-right">السياسات والمعلومات</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq">
              <AccordionTrigger className="text-right font-black text-lg">الأسئلة الشائعة</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed">
                <p className="mb-2">1. كيف أحافظ على حماستي؟ الإنجاز اليومي هو المفتاح، حتى لو كان بسيطاً.</p>
                <p className="mb-2">2. هل يمكنني تغيير مساري؟ نعم، يمكنك التبديل بين المسارات في أي وقت.</p>
                <p>3. كيف تُحسب النقاط؟ تعتمد على وقت الإنجاز وصعوبة المهمة، وتجد تفاصيلها في "دليل التعليمات".</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="terms">
              <AccordionTrigger className="text-right font-black text-lg">الشروط والأحكام</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed">
                استخدام تطبيق كارينجو يعني موافقتك على الالتزام بالقواعد الصحية والأخلاقية للمجتمع. نحن نوفر الأدوات، والمسؤولية الكاملة عن التنفيذ الصحي تقع على عاتق المستخدم.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-right font-black text-lg">سياسة الخصوصية</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed">
                خصوصيتك مقدسة. بياناتك الصحية والبدنية مشفرة ولا يتم مشاركتها مع أي طرف ثالث. نستخدم البيانات فقط لتحسين تجربتك الشخصية داخل التطبيق.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="about">
              <AccordionTrigger className="text-right font-black text-lg">عن كارينجو</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed">
                كارينجو هو مشروع طموح من تطوير Artiatech Studio، نهدف من خلاله إلى جعل عملية التطوير الذاتي رحلة ممتعة وتفاعلية تشبه الألعاب. نحن نؤمن أن النمو يبدأ بخطوة صغيرة يومية.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <footer className="pt-10 opacity-40 font-black text-primary text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
