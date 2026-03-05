
"use client"

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';

const MESSAGES = [
  "أهلاً! أنا كاري 🐱. دعنا ننمو معاً اليوم!",
  "كل خطوة صغيرة تقربك من هدفك الكبير، استمر!",
  "هل أنجزت مهمتك اليوم؟ السلسلة في انتظارك! 🔥",
  "تذكر، الاستمرارية أهم من السرعة. كاري فخور بك!",
  "يوم جديد، فرصة جديدة لتكون أفضل من الأمس!",
  "لا تدع السلسلة تنكسر، أنت تبلي بلاءً حسناً!"
];

interface MascotProps {
  messageOnly?: boolean;
}

export function Mascot({ messageOnly = false }: MascotProps) {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * MESSAGES.length);
    setMessage(MESSAGES[randomIdx]);
  }, []);

  if (messageOnly) {
    return (
      <Card className="p-4 bg-primary text-primary-foreground border-none shadow-lg rounded-2xl relative">
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rotate-45" />
        <p className="text-sm font-medium text-right">{message}</p>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-4 max-w-lg" dir="rtl">
      <div className="relative shrink-0 animate-float">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full scale-110" />
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white relative z-10">
          🐱
        </div>
        <div className="absolute -bottom-1 -left-1 bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-black z-20 shadow-md">
          كاري
        </div>
      </div>
      <Card className="p-4 bg-white text-primary border-none shadow-xl rounded-[2rem] relative overflow-visible flex-1">
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45" />
        <p className="text-sm font-bold leading-relaxed text-right">{message}</p>
      </Card>
    </div>
  );
}
