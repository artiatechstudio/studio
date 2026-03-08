
"use client"

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Mascot } from './mascot';
import { useUser, useFirebase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { X, ChevronLeft, ChevronRight, Sparkles, Trophy, MessageCircle, Crown, Settings, ShieldAlert, Trash2, Smartphone, Download, Share2, HelpCircle, PhoneCall, Milestone } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

const TOUR_STEPS = [
  {
    title: "مرحباً بك في عالم كارينجو! 🐱",
    content: "أنا 'كاري'، مساعدك الذكي للتحسين من ذاتك. نستخدم نظاماً مجتمعياً فريداً يساعدك على التحفيز اليومي لتصبح نسخة أفضل من نفسك.",
    icon: Sparkles,
    color: "text-primary"
  },
  {
    title: "تواصل، تحدى، تطور 🚀",
    content: "هذا هو شعارنا وهدفنا. كارينجو ليس مجرد تطبيق، بل هو رفيق دربك في رحلة التغيير الحقيقية والنمو المستمر.",
    icon: Sparkles,
    color: "text-accent"
  },
  {
    title: "مسارات النمو الأربعة 🧗‍♂️",
    content: "لدينا 4 مسارات أساسية: لياقة، تغذية، سلوك، ودراسة. كل مسار به 30 مرحلة. يمكنك إنجاز مرحلة واحدة فقط في كل مسار يومياً لبناء عادة حقيقية.",
    icon: Trophy,
    color: "text-primary"
  },
  {
    title: "المسار العام (Master) 👑",
    content: "للأبطال الذين تجاوزوا الحدود! هنا تجد 'تحديات الأساطير' العشوائية، وقائمة مهامك الشخصية (Todos) التي تمنحك نقاطاً إضافية وتمدد حماستك.",
    icon: Crown,
    color: "text-yellow-600"
  },
  {
    title: "سجل الحماسة (Streak) 🔥",
    content: "نبض التزامك! كل يوم تنجز فيه أي مهمة تزداد حماستك. إذا غبت يوماً واحداً سيفقد العداد حرارته ويعود للصفر.. لا تستسلم أبداً!",
    icon: Crown,
    color: "text-orange-500"
  },
  {
    title: "نظام الرتب (Ranks) 🎖️",
    content: "ارتقِ بمكانتك! تبدأ كـ 'مكتشف جديد' وتصل إلى 'الأسطورة' بجمع النقاط. كل رتبة تمنحك هيبة أكبر وتظهر بجانب اسمك في كل مكان.",
    icon: Milestone,
    color: "text-blue-600"
  },
  {
    title: "قائمة العظماء 🏆",
    content: "نافس أصدقاءك! الترتيب يعتمد على نشاطك في آخر 3 أيام. احذر من التكاسل لكي لا يظهر اسمك في 'جدار العار' باللون الأحمر!",
    icon: Trophy,
    color: "text-yellow-500"
  },
  {
    title: "المجتمع والدردشة 🌍",
    content: "انشر إلهامك في المجتمع العام. وفي الدردشة الخاصة، الحذف يتم من الطرفين نهائياً لضمان خصوصيتك وأمانك الكامل.",
    icon: MessageCircle,
    color: "text-blue-500"
  },
  {
    title: "الموارد والدعم 📚",
    content: "في قسم 'الموارد' ستجد أدلة شاملة للياقة والتعلم. وإذا واجهت أي مشكلة، قسم 'تواصل معنا' في الإعدادات يربطك مباشرة بفريق الدعم.",
    icon: HelpCircle,
    color: "text-green-600"
  },
  {
    title: "العضوية الملكية (Premium) 👑",
    content: "احصل على 'تجميد الحماسة' لحمايتك عند الغياب، وإمكانية رفع صورة شخصية حقيقية، وتجربة نقية بدون إعلانات.",
    icon: Crown,
    color: "text-yellow-600"
  },
  {
    title: "منطقة الأمان والحذف ⚠️",
    content: "نحن نحترم قرارك. يمكنك حذف حسابك نهائياً من الإعدادات، مما سيؤدي لمسح كافة بياناتك ونقاطك من النظام فوراً دون تراجع.",
    icon: Trash2,
    color: "text-destructive"
  },
  {
    title: "تطبيق ويب تقدمي (PWA) 📱",
    content: "كارينجو هو تطبيق ويب متطور! يمكنك تثبيته على شاشتك الرئيسية ليعمل كأي تطبيق أصلي وبسرعة البرق.",
    icon: Smartphone,
    color: "text-primary"
  },
  {
    title: "التثبيت على Android 🤖",
    content: "من متصفح Chrome، اضغط على النقاط الثلاث (⋮) في الأعلى، ثم اختر 'تثبيت التطبيق' (Install App) ليظهر في قائمة تطبيقاتك.",
    icon: Download,
    color: "text-green-600"
  },
  {
    title: "التثبيت على iPhone 🍎",
    content: "من متصفح Safari، اضغط على زر 'مشاركة' (Share) في الأسفل، ثم مرر واختر 'إضافة للشاشة الرئيسية' (Add to Home Screen).",
    icon: Share2,
    color: "text-primary"
  },
  {
    title: "جاهز للانطلاق؟ 🚀",
    content: "الآن عالم كارينجو بين يديك. ابدأ بأول مهمة لك اليوم واصنع نسخة أفضل من نفسك. كاري يثق بك!",
    icon: Sparkles,
    color: "text-primary"
  }
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const { user } = useUser();
  const { database } = useFirebase();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    playSound('click');
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    playSound('click');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    playSound('success');
    if (user) {
      await update(ref(database, `users/${user.uid}`), {
        hasSeenTour: true
      });
    }
    onComplete();
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md rounded-[3rem] overflow-hidden border-none shadow-2xl bg-card animate-in zoom-in duration-300">
        <div className="p-2 flex justify-end">
          <button onClick={handleFinish} className="p-2 rounded-full text-muted-foreground hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-8 pb-10 space-y-6 text-center">
          <div className={cn("w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center bg-secondary/50 shadow-inner", step.color)}>
            <Icon size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className={cn("text-2xl font-black leading-tight", step.color)}>{step.title}</h2>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">
              {step.content}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-2">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-secondary")} />
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="outline" className="flex-1 h-12 rounded-2xl font-black border-2">
                <ChevronRight size={18} className="ml-1" /> السابق
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 h-12 rounded-2xl bg-primary text-white font-black shadow-lg">
              {currentStep === TOUR_STEPS.length - 1 ? "فهمت، لنبدأ! 🚀" : "التالي"}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronLeft size={18} className="mr-1" />}
            </Button>
          </div>
        </div>

        <div className="bg-primary/5 p-4 flex items-center justify-center border-t border-border/50">
          <Mascot messageOnly customMessage="استمتع برحلتك في كارينجو! 🐱" />
        </div>
      </Card>
    </div>
  );
}
