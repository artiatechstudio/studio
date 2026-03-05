
"use client"

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Apple, Brain, BookOpen, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackType } from '@/lib/mock-data';

const icons = {
  Fitness: Dumbbell,
  Nutrition: Apple,
  Behavior: Brain,
  Study: BookOpen
};

const labels: Record<TrackType, string> = {
  Fitness: 'اللياقة',
  Nutrition: 'التغذية',
  Behavior: 'السلوك',
  Study: 'الدراسة'
};

const descriptions: Record<TrackType, string> = {
  Fitness: 'قوِّ جسدك بتمارين يومية مخصصة.',
  Nutrition: 'وقود أفضل لحياة أكثر صحة ونشاطاً.',
  Behavior: 'أدوات نفسية وعادات يومية للنجاح.',
  Study: 'أطر تعليمية وخطوات لإتقان المعرفة.'
};

interface TrackCardProps {
  type: TrackType;
  currentStage: number;
  totalStages: number;
}

export function TrackCard({ type, currentStage, totalStages }: TrackCardProps) {
  const Icon = icons[type];
  const progressPercent = (currentStage / totalStages) * 100;

  const playClickSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.play().catch(() => {});
  };

  return (
    <Link href={`/track/${type.toLowerCase()}`} onClick={playClickSound}>
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none rounded-3xl group cursor-pointer h-full">
        <CardContent className="p-6 flex flex-col h-full bg-white group-hover:bg-secondary/20">
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-black/5",
              type === 'Fitness' || type === 'Behavior' ? "bg-primary text-white" : "bg-accent text-white"
            )}>
              <Icon size={28} />
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-primary mb-2">{labels[type]}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
            {descriptions[type]}
          </p>

          <div className="space-y-2 mt-auto">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">التقدم</span>
              <span className="text-sm font-black text-primary">{currentStage}/{totalStages} مرحلة</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-secondary rounded-full" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
