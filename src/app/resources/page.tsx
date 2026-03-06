"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Heart, Lightbulb, ChevronLeft, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
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
      title: "دليل السلامة",
      description: "تعلم كيف تتعامل مع الإصابات ومتى يجب عليك التوقف فوراً لسلامتك.",
      icon: AlertTriangle,
      href: "/resources/safety",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "أسرار النمو",
      description: "قواعد ذهبية لبناء الانضباط، الاستمرارية، وتطوير العقلية الإيجابية.",
      icon: Lightbulb,
      href: "/resources/growth",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background md:pr-64 pb-32" dir="rtl">
      <NavSidebar />
      <div className="app-container py-8 md:py-12 space-y-12">
        <header className="space-y-4 text-right mx-2">
          <div className="flex items-center justify-start gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
              <BookOpen size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-primary">مركز الموارد</h1>
              <p className="text-muted-foreground font-medium text-sm md:text-lg">استكشف أدلة النمو والتعليمات الشاملة.</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mx-2">
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} onClick={() => playSound('click')}>
              <Card className="h-full border-none shadow-xl rounded-[2rem] overflow-hidden hover:scale-[1.03] transition-all cursor-pointer group">
                <CardContent className="p-4 md:p-8 flex flex-col items-center text-center gap-2 md:gap-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${cat.bgColor} ${cat.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                    <cat.icon size={24} className="md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-sm md:text-xl font-black text-primary">{cat.title}</h3>
                  <p className="text-muted-foreground font-bold text-[10px] md:text-xs leading-tight line-clamp-2 hidden sm:block">{cat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section className="bg-card p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border mx-2 space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck size={32} />
            <h2 className="text-2xl font-black">الخصوصية والسياسات</h2>
          </div>
          
          <div className="bg-orange-50 border-r-4 border-orange-500 p-6 rounded-2xl mb-6">
            <h4 className="font-black text-orange-700 text-lg mb-2">تنبيه هام حول الدردشة:</h4>
            <p className="text-sm font-bold text-orange-900/80 leading-relaxed">
              نحيطكم علماً بأن الرسائل المتداولة في نظام الدردشة داخل التطبيق **غير مشفرة** طرف-إلى-طرف. يمكن لإدارة "استوديو ارتياتك" (Artiatech Studio) الاطلاع على محتوى المحادثات لأغراض الرقابة، تحسين الخدمة، والتأكد من عدم مخالفة شروط المجتمع. يرجى توخي الحذر وعدم مشاركة أي معلومات حساسة، أرقام سرية، أو بيانات بنكية عبر الدردشة.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq">
              <AccordionTrigger className="text-right font-black text-lg">الأسئلة الشائعة</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm">
                <p className="mb-2">● كيف أحافظ على حماستي؟ الإنجاز اليومي هو المفتاح، حتى لو كان بسيطاً.</p>
                <p className="mb-2">● هل يمكنني تغيير مساري؟ نعم، يمكنك التبديل بين المسارات في أي وقت من الرئيسية.</p>
                <p>● كيف تُحسب النقاط؟ تعتمد على وقت الإنجاز (نظام بونص التبكير) وصعوبة المهمة الأساسية.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-right font-black text-lg">سياسة الخصوصية المعمقة</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm space-y-4">
                <p>نحن في ارتياتك نلتزم بحماية بياناتك الشخصية الأساسية (الاسم، العمر، الطول، الوزن). يتم استخدام هذه البيانات فقط لحساب مؤشراتك الصحية الشخصية ووضعك في قائمة المتصدرين.</p>
                <p>نحن لا نبيع بياناتك لأطراف خارجية. ومع ذلك، وكما ذُكر أعلاه، فإن ميزات التفاعل الاجتماعي مثل الدردشة تخضع للرقابة لضمان بيئة آمنة للجميع.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <footer className="pt-10 opacity-40 font-black text-primary text-[10px] text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}