
"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/mascot';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="max-w-md space-y-8 flex flex-col items-center">
        <div className="relative w-48 h-48 animate-float">
          <Image src="/logo.png" alt="404" fill className="object-contain" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-primary">أوووه!</h1>
          <p className="text-xl font-bold text-muted-foreground">يبدو أنك ضللت الطريق في عالم كاري. هذه الصفحة غير موجودة!</p>
        </div>
        
        <div className="bg-secondary/20 p-6 rounded-[2.5rem] border border-border w-full">
          <Mascot customMessage="لا تقلق، العودة للمسار الصحيح هي أول خطوة في النمو!" />
        </div>

        <Link href="/" className="w-full">
          <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-xl group">
            <ArrowRight className="ml-2 group-hover:-translate-x-1 transition-transform" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
