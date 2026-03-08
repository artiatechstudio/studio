
"use client"

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Mascot } from './mascot';
import { useUser, useFirebase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { X, ChevronLeft, ChevronRight, Sparkles, ShieldAlert, Trash2, Crown, Trophy, MessageCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

const TOUR_STEPS = [
  {
    title: "مرحباً بك في عالم كارينجو! 🐱",
    content: "أنا 'كاري'، رفيقك في هذه الرحلة. سآخذك في جولة سريعة لنفهم معاً كيف يعمل التطبيق لتصبح بطلاً حقيقياً.",
    icon: Sparkles,
    color: "text-primary"
  },
  {
    title: "مسارات النمو الأربعة 🧗‍♂️",
    content: "لدينا 4 مسارات: لياقة، تغذية، سلوك، ودراسة. كل مسار به 30 مرحلة. يمكنك إنجاز مرحلة واحدة فقط في كل مسار يومياً لبناء عادة حقيقية.",
    icon: Trophy,
    color: "text-accent"
  },
  {
    title: "سجل الحماسة (Streak) 🔥",
    content: "هنا نبض التزامك! كل يوم تنجز فيه مهمة تزداد حماستك. إذا غبت يوماً واحداً سيفقد العداد حرارته ويعود للصفر.. لا تستسلم!",
    icon: Crown,
    color: "text-orange-500"
  },
  {
    title: "قائمة العظماء والمتصدرين 🏆",
    content: "نافس أصدقاءك! الترتيب يعتمد على نشاطك في آخر 3 أيام. احذر من التكاسل لكي لا يظهر اسمك في 'جدار العار' باللون الأحمر!",
    icon: Trophy,
    color: "text-yellow-500"
  },
  {
    title: "المجتمع والدردشة 🌍",
    content: "انشر إلهامك في المجتمع العام. يمكنك حذف منشورك في أي وقت. وفي الدردشة الخاصة، الحذف يتم من الطرفين لضمان خصوصيتك الكاملة.",
    icon: MessageCircle,
    color: "text-blue-500"
  },
  {
    title: "الأوسمة والإنجازات 🏅",
    content: "كلما تطورت، حصلت على أوسمة نادرة تظهر في ملفك الشخصي. اجمعها كلها لتثبت أنك أسطورة من أساطير كارينجو.",
    icon: ShieldAlert,
    color: "text-purple-500"
  },
  {
    title: "العضوية الملكية (Premium) 👑",
    content: "مشتركو البريميوم يحصلون على 'تجميد الحماسة' عند الغياب، وإمكانية رفع صورة شخصية حقيقية بدلاً من الإيموجي، وتجربة بدون إعلانات.",
    icon: Crown,
    color: "text-yellow-600"
  },
  {
    title: "إدارة الحساب والأفاتار ⚙️",
    content: "من الإعدادات يمكنك تغيير اسمك، عمرك، وتغيير رفيقك (الأفاتار). البريميوم فقط هم من يمكنهم رفع صور مخصصة من الاستوديو.",
    icon: ShieldAlert,
    color: "text-slate-600"
  },
  {
    title: "منطقة الأمان والحذف ⚠️",
    content: "نحن نحترم قرارك دائماً. يمكنك حذف حسابك نهائياً من الإعدادات، مما سيؤدي لمسح كافة بياناتك ونقاطك من النظام فوراً.",
    icon: Trash2,
    color: "text-destructive"
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
          <Button onClick={handleFinish} variant="ghost" size="icon" className="rounded-full text-muted-foreground">
            <X size={20} />
          </Button>
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
          <Mascot messageOnly customMessage="لا تتردد في سؤالي عن أي شيء لاحقاً! 🐱" />
        </div>
      </Card>
    </div>
  );
}
