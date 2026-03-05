"use client"

import React, { use, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { dailyChallengeGeneration, DailyChallengeGenerationOutput } from '@/ai/flows/daily-challenge-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, BarChart3, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { TrackType } from '@/lib/mock-data';
import { Mascot } from '@/components/mascot';
import { toast } from '@/hooks/use-toast';

export default function StageDetailPage({ params }: { params: Promise<{ type: string, stageId: string }> }) {
  const resolvedParams = use(params);
  const trackType = resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1) as TrackType;
  const stageId = parseInt(resolvedParams.stageId);
  
  const [challenge, setChallenge] = useState<DailyChallengeGenerationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadChallenge() {
      setLoading(true);
      try {
        // Only Nutrition, Behavior, Study use GenAI based on proposal
        if (trackType !== 'Fitness') {
          const res = await dailyChallengeGeneration({
            track: trackType as any,
            currentDay: stageId,
            userPreferences: "focus on progress and sustainability"
          });
          setChallenge(res);
        } else {
          // Mock fitness challenge
          setChallenge({
            challengeTitle: `Day ${stageId}: Full Body Strength`,
            challengeDescription: "Complete 3 sets of pushups, squats, and planks. Focus on form and consistent breathing throughout the routine.",
            challengeType: 'Fitness' as any,
            difficulty: 'Medium',
            estimatedCompletionTimeMinutes: 20
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
  }, [trackType, stageId]);

  const handleComplete = () => {
    setCompleted(true);
    toast({
      title: "Task Completed!",
      description: `Amazing job! Day ${stageId} of ${trackType} is finished.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
        <Link href={`/track/${resolvedParams.type}`}>
          <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
            <ArrowLeft size={18} />
            Back to Path
          </Button>
        </Link>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 w-2/3 bg-secondary rounded-xl" />
            <div className="h-64 bg-secondary rounded-3xl" />
          </div>
        ) : challenge ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <header>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-black uppercase tracking-tighter">Day {stageId}</div>
                  <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-black uppercase tracking-tighter">{trackType}</div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">{challenge.challengeTitle}</h1>
              </header>

              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Your Task</CardTitle>
                    <div className="flex gap-4 text-sm font-medium opacity-90">
                      <div className="flex items-center gap-1"><Clock size={16} /> {challenge.estimatedCompletionTimeMinutes}m</div>
                      <div className="flex items-center gap-1"><Zap size={16} /> {challenge.difficulty}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {challenge.challengeDescription}
                  </div>
                  
                  {!completed ? (
                    <Button 
                      onClick={handleComplete}
                      className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-xl font-black shadow-xl shadow-accent/20"
                    >
                      I Finished Today!
                    </Button>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
                      <CheckCircle className="text-green-500" size={64} />
                      <div>
                        <h3 className="text-2xl font-black text-green-700">Excellent Work!</h3>
                        <p className="text-green-600 font-medium">You've completed your daily care task.</p>
                      </div>
                      <Link href="/" className="w-full">
                        <Button className="w-full rounded-2xl bg-green-600 hover:bg-green-700">Go to Dashboard</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resource Hub Link integration */}
              <div className="bg-secondary/40 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <Star fill="currentColor" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Need help?</h4>
                    <p className="text-sm text-muted-foreground">Check out our resource hub for tips.</p>
                  </div>
                </div>
                <Link href="/resources">
                  <Button variant="outline" className="rounded-xl border-primary text-primary font-bold">View Hub</Button>
                </Link>
              </div>
            </div>

            {/* Sidebar Mascot & Stats */}
            <div className="space-y-6">
              <div className="sticky top-12">
                <Mascot messageOnly currentTrack={trackType} />
                
                <Card className="mt-8 border-none shadow-xl rounded-3xl overflow-hidden">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <BarChart3 size={20} />
                      Stats for {trackType}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Total Stages</span>
                        <span className="text-sm font-bold text-primary">30</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
                        <span className="text-sm font-bold text-primary">12%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
                        <span className="text-sm font-bold text-primary">5 Days</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <p>Failed to load challenge.</p>
        )}
      </div>
    </div>
  );
}