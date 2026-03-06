
"use client"

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Apple, Brain, BookOpen, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackType } from '@/lib/mock-data';
import { playSound } from '@/lib/sounds';

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

interface TrackCardProps {
  type: TrackType;
  currentStage: number;
  totalStages: number;
}

export function TrackCard({ type, currentStage, totalStages }: TrackCardProps) {
  const Icon = icons[type];
  const progressPercent = (currentStage / totalStages) * 100;

  const handleOnClick = () => {
    playSound('click');
  };

  return (
    <Link href={`/track/${type.toLowerCase()}`} onClick={handleOnClick}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none rounded-[2rem] group cursor-pointer h-full bg-card shadow-md">
        <CardContent className="p-4 flex flex-col h-full items-center text-center">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg",
            (type === 'Fitness' || type === 'Behavior') ? "bg-primary text-white" : "bg-accent text-white"
          )}>
            <Icon size={24} />
          </div>
          
          <h3 className="text-sm font-black text-primary mb-1">{labels[type]}</h3>
          
          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between items-end px-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase">المستوى</span>
              <span className="text-[10px] font-black text-primary">{currentStage}/{totalStages}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5 bg-secondary rounded-full" />
          </div>

          <div className="mt-4 w-6 h-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
