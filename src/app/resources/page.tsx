
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Shield, ScrollText, Heart, HelpCircle, ExternalLink, MessageSquare, Instagram, Facebook, Youtube, Send, Phone, AlertTriangle, Lightbulb, Activity, Droplets, Moon, Brain, Apple, Target, UserCheck } from 'lucide-react';
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
              <p className="text-muted-foreground font-medium text-lg">دليلك الشامل لنمط حياة صحي ومتطور تحت إشراف Artiatech Studio.</p>
            </div>
          </div>
        </header>

        {/* قسم نصائحنا - معلومات مشبعة ومفصلة */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <Heart className="text-accent" /> نصائحنا الذهبية للنمو
          </h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* معلومات صحية مفصلة */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-card border border-border overflow-hidden">
              <div className="bg-blue-600 p-6 text-white flex items-center gap-4">
                <Activity size={32} />
                <h3 className="text-2xl font-black">الموسوعة الصحية اليومية</h3>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-600 font-black text-xl">
                      <Droplets /> هيدرات الجسم (الماء)
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      الماء يمثل 60% من كتلة جسمك. شرب الماء ليس للارتواء فقط، بل هو المحرك الأساسي لعمليات الأيض ونقل العناصر الغذائية. 
                      <br /><br />
                      <span className="text-primary font-bold">التوصية:</span> احرص على شرب 35 مل لكل كيلوجرام من وزنك. ابدأ يومك بكوب دافئ لتنشيط الجهاز الهضمي، ولا تنتظر الشعور بالعطش، فالعطش هو إشارة متأخرة للجفاف.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-purple-600 font-black text-xl">
                      <Moon /> جودة النوم والترميم
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      أثناء النوم، يقوم جسمك بإفراز هرمون النمو وإصلاح الأنسجة العضلية المجهدة خلال التمرين. 
                      <br /><br />
                      <span className="text-primary font-bold">سر المحترفين:</span> ثبت مواعيد نومك. دورة النوم الكاملة تستغرق 90 دقيقة، لذا استهدف 5 دورات (7.5 ساعة) أو 6 دورات (9 ساعات). تجنب الضوء الأزرق قبل النوم بـ 60 دقيقة لتحفيز هرمون الميلاتونين الطبيعي.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-green-600 font-black text-xl">
                      <Apple /> التغذية المتوازنة
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      اجعل طبقك ملوناً؛ فكل لون في الخضروات يمثل نوعاً مختلفاً من مضادات الأكسدة. 
                      <br /><br />
                      <span className="text-primary font-bold">قاعدة الـ 80/20:</span> تناول طعاماً صحياً غير مصنع بنسبة 80% من وقتك، واترك 20% للاستمتاع بوجباتك المفضلة باعتدال لضمان الاستمرارية النفسية.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-orange-600 font-black text-xl">
                      <Brain /> الصحة الذهنية
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      التوتر المزمن يرفع مستويات الكورتيزول، مما يعيق حرق الدهون وبناء العضلات. 
                      <br /><br />
                      <span className="text-primary font-bold">تمرين سريع:</span> جرب التنفس المربع (شهيق 4 ثوانٍ، حبس 4، زفير 4، حبس 4) عند الشعور بالضغط النفسي.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الطوارئ والسلامة */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-card border border-border overflow-hidden">
              <div className="bg-red-600 p-6 text-white flex items-center gap-4">
                <AlertTriangle size={32} />
                <h3 className="text-2xl font-black">دليل الطوارئ والسلامة الرياضية</h3>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border-r-4 border-red-600">
                  <h4 className="text-red-600 font-black text-xl mb-4">متى يجب عليك التوقف فوراً؟</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground font-bold">
                    <li className="flex items-start gap-2"><span className="text-red-600">●</span> ألم حاد أو مفاجئ في الصدر أو الذراع اليسرى.</li>
                    <li className="flex items-start gap-2"><span className="text-red-600">●</span> دوار شديد أو فقدان مؤقت للرؤية.</li>
                    <li className="flex items-start gap-2"><span className="text-red-600">●</span> سماع صوت "فرقعة" في المفاصل يصاحبه ألم.</li>
                    <li className="flex items-start gap-2"><span className="text-red-600">●</span> ضيق تنفس حاد لا يتناسب مع المجهود المبذول.</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-primary font-black text-xl">الإسعاف الأولي للإصابات (R.I.C.E)</h4>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      1. <span className="font-black">Rest (الراحة):</span> توقف عن الحركة فوراً لمنع تفاقم الإصابة.
                      <br />
                      2. <span className="font-black">Ice (الثلج):</span> ضع الثلج لمدة 15-20 دقيقة كل ساعة لتقليل التورم.
                      <br />
                      3. <span className="font-black">Compression (الضغط):</span> استخدم ضمادة مرنة لدعم المنطقة المصابة.
                      <br />
                      4. <span className="font-black">Elevation (الرفع):</span> ارفع العضو المصاب أعلى من مستوى القلب.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-primary font-black text-xl">أرقام وتنبيهات حيوية</h4>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      دائماً احتفظ برقم الطوارئ المحلي في جهات الاتصال السريعة. أخبر شخصاً مقرباً بمكان تدريبك أو موعده. لا تتمرن بكثافة عالية إذا كنت تعاني من الحمى أو التهاب حاد، فجسمك يحتاج لطاقته للمناعة وليس للعضلات.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* التحسين الذاتي */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-card border border-border overflow-hidden">
              <div className="bg-amber-500 p-6 text-white flex items-center gap-4">
                <Lightbulb size={32} />
                <h3 className="text-2xl font-black">أسرار التحسين الذاتي المستدام</h3>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-secondary/20 p-6 rounded-3xl space-y-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                      <Target size={20} />
                    </div>
                    <h4 className="font-black text-primary text-lg">قاعدة الـ 1%</h4>
                    <p className="text-sm text-muted-foreground font-bold">لا تحاول تغيير حياتك في ليلة واحدة. تحسن بنسبة 1% فقط كل يوم، وبنهاية العام ستكون أفضل بـ 37 ضعفاً مما كنت عليه.</p>
                  </div>
                  <div className="bg-secondary/20 p-6 rounded-3xl space-y-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <UserCheck size={20} />
                    </div>
                    <h4 className="font-black text-primary text-lg">بناء الانضباط</h4>
                    <p className="text-sm text-muted-foreground font-bold">الانضباط هو القيام بما يجب عليك فعله، حتى عندما لا تشعر بالرغبة في ذلك. هو العضلة التي تقوى مع كل "نعم" تقولها لأهدافك.</p>
                  </div>
                  <div className="bg-secondary/20 p-6 rounded-3xl space-y-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="font-black text-primary text-lg">التعلم المستمر</h4>
                    <p className="text-sm text-muted-foreground font-bold">خصص 15 دقيقة يومياً للقراءة أو الاستماع لكتاب. العقل الذي يتوقف عن التعلم يبدأ بالانكماش. غذِ فضولك دائماً.</p>
                  </div>
                </div>
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
                  يعتمد كارينجو على نموذج 30 يوماً لبناء عادات مستدامة. كل مسار يتكون من 30 مرحلة، ويمكنك إنجاز مرحلة واحدة فقط يومياً لضمان النمو الحقيقي. هذا التصميم يمنع الاحتراق النفسي ويضمن أن التغيير جزء من هويتك وليس مجرد حماس مؤقت.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-4" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  كيف أحافظ على سلسلة الحماسة؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  يجب عليك إكمال مهمة واحدة على الأقل في أي مسار قبل نهاية اليوم (الساعة 12 منتصف الليل بتوقيتك المحلي). إذا فاتك يوم، سيعود العداد للصفر. ننصحك باستخدام ميزة التنبيهات وضبط وقت ثابت يومياً لتكون المهمة جزءاً من روتينك.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-5" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  لماذا أحصل على نقاط إضافية في الصباح؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  هذا هو "بونص التبكير"! يبدأ من الساعة 5 صباحاً. أثبتت الدراسات أن إنجاز المهام الصعبة في الصباح الباكر يمنحك شعوراً بالانتصار يمتد لبقية اليوم ويزيد من إنتاجيتك العامة، لذا نحن نكافئك على هذا الانضباط.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-6" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6 text-right">
                  هل التطبيق مجاني بالكامل؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed text-right">
                  نعم، كارينجو مشروع يهدف لنشر الوعي والنمو وهو متاح للجميع. نحن في Artiatech Studio نؤمن بأن أدوات التطوير الذاتي يجب أن تكون في متناول كل شخص يطمح للأفضل.
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
                نحن في Artiatech Studio نحترم خصوصيتك. بياناتك الحيوية (الطول، الوزن، العمر) تُستخدم فقط محلياً داخل التطبيق لتخصيص تجربتك وحساب تقدمك، ولا يتم مشاركتها أو بيعها لأي أطراف خارجية تحت أي ظرف. بيانات الدخول مؤمنة عبر تشفير Firebase القياسي.
              </p>
            </Card>
            <Card className="border-none shadow-md rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 text-primary">
                <ScrollText size={24} />
                <h4 className="font-black">الشروط والأحكام</h4>
              </div>
              <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                باستخدامك لكارينجو، أنت توافق على أنك المسؤول الأول عن سلامتك الجسدية. التطبيق يقدم نصائح عامة وتحديات تحفيزية، وليس بديلاً عن الاستشارة الطبية أو المدرب الشخصي المتخصص، خاصة إذا كنت تعاني من حالات طبية مزمنة.
              </p>
            </Card>
          </div>
        </section>

        <div className="text-center py-10 opacity-40 font-black text-primary text-xs">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </div>
      </div>
    </div>
  );
}
