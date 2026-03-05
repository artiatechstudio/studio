"use client"

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Apple, Brain, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackType } from '@/lib/mock-data';

const icons = {
  Fitness: Dumbbell,
  Nutrition: Apple,
  Behavior: Brain,
  Study: BookOpen
};

interface TrackCardProps {
  type: TrackType;
  currentStage: number;
  totalStages: number;
}

export function TrackCard({ type, currentStage, totalStages }: TrackCardProps) {
  const Icon = icons[type];
  const progressPercent = (currentStage / totalStages) * 100;

  return (
    <Link href={`/track/${type.toLowerCase()}`}>
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
              <ChevronRight size={18} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-primary mb-2">{type}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
            {type === 'Fitness' && 'Master your body with routines and strength training.'}
            {type === 'Nutrition' && 'Optimized fuel for a healthier, more energetic you.'}
            {type === 'Behavior' && 'Psychological tools and daily habits for success.'}
            {type === 'Study' && 'Learning frameworks and cognitive mastery steps.'}
          </p>

          <div className="space-y-2 mt-auto">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
              <span className="text-sm font-black text-primary">{currentStage}/{totalStages} Stages</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-secondary rounded-full" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}