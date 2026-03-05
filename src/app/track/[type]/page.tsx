"use client"

import React, { use } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { StageNode } from '@/components/track/stage-node';
import { MOCK_USER, TrackType } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map as MapIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { Mascot } from '@/components/mascot';

export default function TrackPathPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const typeKey = resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1) as TrackType;
  const progress = MOCK_USER.trackProgress[typeKey] || { currentStage: 1, completedStages: [] };

  // Generate offsets for the Duolingo-style snake path
  const stages = Array.from({ length: 30 }, (_, i) => {
    const id = i + 1;
    let status: 'locked' | 'open' | 'completed' = 'locked';
    if (progress.completedStages.includes(id)) status = 'completed';
    else if (id === progress.currentStage) status = 'open';

    // Snake logic: offset goes from -60 to 60 then back
    const cycle = 8; // Full wave length
    const pos = i % cycle;
    let offset = 0;
    if (pos < 4) offset = pos * 40 - 60;
    else offset = (8 - pos) * 40 - 60;

    return { id, status, offset };
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NavSidebar />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-3xl mx-auto p-6 md:p-12 relative">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              <ArrowLeft size={18} />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MapIcon className="text-primary" size={24} />
            <h1 className="text-3xl font-black text-primary tracking-tight">{typeKey} Path</h1>
          </div>
          <Button variant="outline" size="icon" className="rounded-full border-primary text-primary">
            <Info size={18} />
          </Button>
        </div>

        {/* Mascot Contextual Message */}
        <div className="mb-20">
          <Mascot currentTrack={typeKey} />
        </div>

        {/* Path Layout */}
        <div className="relative flex flex-col items-center gap-16 pb-32">
          {/* Connecting Path Lines (CSS simplified representation) */}
          <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-secondary/50 -translate-x-1/2 rounded-full -z-0" />
          
          {stages.map((stage) => (
            <StageNode 
              key={stage.id}
              id={stage.id}
              status={stage.status}
              trackType={resolvedParams.type}
              offset={stage.offset}
            />
          ))}
        </div>
      </div>
    </div>
  );
}