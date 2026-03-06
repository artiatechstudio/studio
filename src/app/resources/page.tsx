
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Shield, Heart, HelpCircle, Activity, AlertTriangle, Lightbulb, ChevronLeft, Scale, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';

export default function ResourcesPage() {
  const categories = [
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

  const legalLinks = [
    { title: "الأسئلة الشائعة", icon: HelpCircle, href: "#faq" },
    { title: "الشروط والأحكام", icon: Scale, href: "#terms" },
    { title: "سياسة الخصوصية", icon: Shield, href: "#privacy" },
    { title: "عن كارينجو", icon: Info, href: "#about" },
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
              <p className="text-muted-foreground font-medium text-lg">استكشف أدلة النمو والتعلم الشاملة.</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} onClick={() => playSound('click')}>
              <Card className="h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden hover:scale-[1.03] transition-all cursor-pointer group">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <div className={`w-20 h-20 ${cat.bgColor} ${cat.color} rounded-[2rem] flex items-center justify-center mb-2 group-hover:rotate-6 transition-transform`}>
                    <cat.icon size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-primary">{cat.title}</h3>
                  <p className="text-muted-foreground font-bold text-sm leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-primary font-black">
                    عرض التفاصيل <ChevronLeft size={20} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
             السياسات والمعلومات
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {legalLinks.map((link) => (
              <Button 
                key={link.title} 
                variant="outline" 
                onClick={() => { playSound('click'); toast({ title: link.title, description: "قريباً في التحديث القادم!" }); }}
                className="h-20 rounded-2xl border-2 border-primary/10 hover:border-primary text-primary font-black text-lg gap-3"
              >
                <link.icon size={24} />
                {link.title}
              </Button>
            ))}
          </div>
        </section>

        <div className="text-center py-10 opacity-40 font-black text-primary text-xs">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </div>
      </div>
    </div>
  );
}
