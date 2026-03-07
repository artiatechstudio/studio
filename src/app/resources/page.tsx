
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
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-right font-black text-lg">سياسة الخصوصية والأحكام</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm space-y-4">
                <div className="space-y-4">
                  <p>● <span className="text-primary font-black">حماية البيانات:</span> نلتزم في "كارينجو" بحماية معلوماتك الشخصية (الاسم، الوزن، الطول) واستخدامها فقط لتحسين تجربتك الصحية. لا يتم مشاركة هذه البيانات مع أطراف خارجية لأغراض إعلانية.</p>
                  <p>● <span className="text-primary font-black">سلوك المستخدم:</span> يُتوقع من جميع الأعضاء الاحترام المتبادل في غرف الدردشة. أي تنمر أو إساءة سيؤدي إلى حظر الحساب نهائياً دون سابق إنذار.</p>
                  <p>● <span className="text-primary font-black">إخلاء مسؤولية طبية:</span> جميع النصائح المقدمة عبر المساعد الذكي "كاري" هي نصائح تحفيزية وتثقيفية فقط، وليست بديلاً عن الاستشارة الطبية المتخصصة.</p>
                  <div className="p-3 bg-red-50 rounded-xl border-r-2 border-red-200 text-xs text-red-700">
                    تنبيه: الدردشات العامة والخاصة لا تخضع للتشفير التام (End-to-End)، يرجى تجنب مشاركة كلمات المرور أو البيانات الحساسة جداً.
                  </div>
                  <p>● <span className="text-primary font-black">حذف الحساب:</span> يحق للمستخدم حذف حسابه في أي وقت، وسيتم مسح كافة سجلات تقدمه من قواعد البيانات بشكل نهائي.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq">
              <AccordionTrigger className="text-right font-black text-lg">الأسئلة الشائعة</AccordionTrigger>
              <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-primary font-black">كيف يمكنني تغيير مساري الحالي؟</h4>
                    <p>يمكنك التبديل بين المسارات الأربعة (اللياقة، التغذية، السلوك، الدراسة) في أي وقت من الصفحة الرئيسية. تقدمك في كل مسار منفصل تماماً.</p>
                  </div>
                  <div>
                    <h4 className="text-primary font-black">لماذا لا يمكنني فتح أكثر من مرحلة يومياً؟</h4>
                    <p>فلسفة كارينجو تقوم على "التراكم المستدام". الهدف هو بناء عادة يومية وليس إنهاء التحديات بسرعة. الصبر هو مفتاح النمو.</p>
                  </div>
                  <div>
                    <h4 className="text-primary font-black">كيف يتم حساب "رقم العضوية"؟</h4>
                    <p>رقمك يعكس ترتيبك الزمني في الانضمام لمجتمعنا. العضو رقم 1 هو أول من سجل، وهكذا. هذا الرقم فخري ويبقى ثابتاً.</p>
                  </div>
                  <div>
                    <h4 className="text-primary font-black">هل يمكنني استعادة سجل دردشة محذوف؟</h4>
                    <p>للأسف لا. بمجرد الضغط على زر حذف السجل، يتم مسح الرسائل نهائياً من خوادمنا لحماية خصوصيتك.</p>
                  </div>
                  <div>
                    <h4 className="text-primary font-black">ما هو دور "بونص التبكير"؟</h4>
                    <p>نحن نكافئ من يستيقظ مبكراً لإنجاز مهامه. كلما أنجزت مهمتك في الصباح الباكر، حصلت على نقاط إضافية تصل إلى 75 نقطة.</p>
                  </div>
                </div>
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
