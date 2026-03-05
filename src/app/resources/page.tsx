
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Shield, ScrollText, Mail, Heart, HelpCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-32">
        <header className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary">مركز الموارد</h1>
              <p className="text-muted-foreground font-medium text-lg">نصائح عامة، معلومات صحية، والوثائق القانونية.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden group">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-black">نصائح الصحة والسلامة</h3>
              <p className="opacity-80 leading-relaxed font-medium">تعلم كيف تحافظ على توازن حياتك بأمان وفعالية من خلال أدلتنا المختارة.</p>
              <Button variant="secondary" className="rounded-xl font-bold px-8">اقرأ الأدلة</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-accent text-white overflow-hidden group">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-black">أعطنا رأيك</h3>
              <p className="opacity-80 leading-relaxed font-medium">رأيك يهمنا لتطوير كارينجو. هل لديك اقتراح أو وجدت مشكلة؟</p>
              <Button variant="secondary" className="rounded-xl font-bold px-8">إرسال ملاحظة</Button>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <HelpCircle className="text-accent" />
            الأسئلة الشائعة
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
              <AccordionItem value="item-2" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  هل يمكنني تغيير المسار لاحقاً؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  نعم، جميع المسارات متاحة لك منذ اليوم الأول. يمكنك التقدم فيها جميعاً في نفس الوقت، ولكن مرحلة واحدة فقط لكل مسار في اليوم.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-3" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  كيف يتم حساب النقاط؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  تحصل على نقاط أساسية عند الإنجاز، بالإضافة إلى "بونص التبكير"؛ كلما أنجزت مهمتك في وقت أبكر من اليوم، زادت نقاطك في لوحة المتصدرين.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <Shield className="text-accent" />
            القانون والخصوصية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-md rounded-2xl hover:bg-secondary/20 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                    <Shield size={20} />
                  </div>
                  <span className="font-bold text-primary">سياسة الخصوصية</span>
                </div>
                <ExternalLink size={18} className="text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md rounded-2xl hover:bg-secondary/20 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                    <ScrollText size={20} />
                  </div>
                  <span className="font-bold text-primary">الشروط والأحكام</span>
                </div>
                <ExternalLink size={18} className="text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
