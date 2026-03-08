
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Dumbbell, Lightbulb, ChevronLeft, AlertTriangle, Info, ShieldCheck, Gavel, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import { playSound } from '@/lib/sounds';

export default function ResourcesPage() {
  const categories = [
    {
      title: "دليل التعليمات",
      description: "تعرف على آليات حساب النقاط، الحماسة، وقوانين الـ 90 مرحلة الإضافية.",
      icon: Info,
      href: "/resources/instructions",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "دليل اللياقة والتمارين",
      description: "شرح تفصيلي لكافة التمارين الرياضية ونظام التغذية المتوازن.",
      icon: Dumbbell,
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
      title: "أسرار النمو والدراسة",
      description: "نظريات التعلم، بناء الانضباط، وتطوير العقلية الحديدية.",
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
          <div className="space-y-10">
            {/* سياسة الخصوصية */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck size={28} />
                <h2 className="text-2xl font-black">سياسة الخصوصية</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="privacy-data">
                  <AccordionTrigger className="text-right font-black text-lg">كيف نحمي بياناتك؟</AccordionTrigger>
                  <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm space-y-4">
                    <p>● <span className="text-primary font-black">جمع المعلومات:</span> نقوم بجمع بيانات الطول، الوزن، والعمر حصرياً لحساب مؤشر كتلة الجسم (BMI) وتقديم تجربة نمو مخصصة لك. هذه البيانات مخزنة بشكل آمن في قواعد بيانات Firebase المشفرة.</p>
                    <p>● <span className="text-primary font-black">الصور الشخصية:</span> في حال رفع صورة شخصية (لمشتركي البريميوم)، يتم ضغطها وتحويلها إلى كود مشفر داخل حسابك فقط ولا يتم استخدامها في أي غرض تجاري.</p>
                    <p>● <span className="text-primary font-black">مشاركة البيانات:</span> نلتزم في "كارينجو" بعدم بيع أو مشاركة بياناتك مع أي طرف ثالث أو شركات إعلانية خارجية. بيانات نشاطك هي ملكك وحدك.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* الشروط والأحكام */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent">
                <Gavel size={28} />
                <h2 className="text-2xl font-black">الشروط والأحكام</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="terms-rules">
                  <AccordionTrigger className="text-right font-black text-lg">قوانين المجتمع والاستخدام</AccordionTrigger>
                  <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm space-y-4">
                    <p>● <span className="text-primary font-black">السلوك العام:</span> يُحظر تماماً التنمر، التحرش، أو نشر محتوى غير لائق في الدردشة العامة أو الخاصة. يتم حظر الحسابات المخالفة نهائياً دون سابق إنذار.</p>
                    <p>● <span className="text-primary font-black">إخلاء مسؤولية طبية:</span> تطبيق "كارينجو" هو أداة تحفيزية. التمارين والنصائح الغذائية المقدمة لا تغني عن استشارة الطبيب المختص، خاصة للأشخاص الذين يعانون من مشاكل صحية مزمنة.</p>
                    <p>● <span className="text-primary font-black">النقاط والحماسة:</span> النظام يعتمد على مبدأ الالتزام الشخصي. أي تلاعب في إكمال المهام يضر بمصداقية سجل إنجازاتك. عقوبة الانسحاب من المهام تهدف لتعزيز الانضباط.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* الأسئلة الشائعة */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <HelpCircle size={28} />
                <h2 className="text-2xl font-black">الأسئلة الشائعة (FAQ)</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-streak">
                  <AccordionTrigger className="text-right font-black text-lg">لماذا فقدت حماستي (Streak)؟</AccordionTrigger>
                  <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm">
                    يتم تمديد الحماسة عند إكمال أول مهمة في اليوم الجديد. إذا لم تقم بأي نشاط لمدة 24 ساعة (تنتهي عند منتصف الليل)، ستفقد الحماسة ما لم تكن مشتركاً في البريميوم ولديك رصيد "تجميد حماسة".
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-points">
                  <AccordionTrigger className="text-right font-black text-lg">كيف أحصل على رتبة "أسطورة كاري"؟</AccordionTrigger>
                  <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm">
                    تعتمد الرتب على إجمالي النقاط. رتبة الأسطورة تتطلب الوصول إلى 10,000 نقطة. يمكنك جمع النقاط عبر إكمال المهام اليومية، التبكير في الإنجاز، والالتزام بالمسار العام.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-premium">
                  <AccordionTrigger className="text-right font-black text-lg">كيف يتم تفعيل اشتراك البريميوم؟</AccordionTrigger>
                  <AccordionContent className="text-right font-bold text-muted-foreground leading-relaxed text-sm">
                    بعد تقديم الطلب من الإعدادات وتحويل الرصيد، يقوم فريق الإدارة بمراجعة الطلب يدوياً وتفعيله خلال مدة لا تتجاوز 24 ساعة. ستصلك إشعار فوري فور التفعيل.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <footer className="pt-10 opacity-40 font-black text-primary text-[10px] text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
