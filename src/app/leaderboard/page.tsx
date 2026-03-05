"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, Flame } from "lucide-react";

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Sarah Miller', score: 4500, avatar: 'https://picsum.photos/seed/user1/100/100', streak: 12 },
  { id: 2, name: 'John Doe', score: 4200, avatar: 'https://picsum.photos/seed/user2/100/100', streak: 25 },
  { id: 3, name: 'Chris Evans', score: 3900, avatar: 'https://picsum.photos/seed/user3/100/100', streak: 8 },
  { id: 4, name: 'Emma Wilson', score: 3600, avatar: 'https://picsum.photos/seed/user4/100/100', streak: 15 },
  { id: 5, name: 'Alex Rivera (You)', score: 3450, avatar: 'https://picsum.photos/seed/user123/100/100', streak: 5 },
  { id: 6, name: 'Liam Neeson', score: 3100, avatar: 'https://picsum.photos/seed/user6/100/100', streak: 4 },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shadow-xl">
              <Trophy size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary">Leaderboard</h1>
              <p className="text-muted-foreground font-medium">See how you stack up against the Careingo community.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl rounded-3xl bg-primary text-white text-center p-8">
            <Star className="mx-auto mb-4 text-yellow-400" size={32} fill="currentColor" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Your Score</p>
            <p className="text-4xl font-black">3,450</p>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl bg-accent text-white text-center p-8">
            <Trophy className="mx-auto mb-4 text-white" size={32} />
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Your Rank</p>
            <p className="text-4xl font-black">#5</p>
          </Card>
          <Card className="border-none shadow-xl rounded-3xl bg-white text-center p-8">
            <Flame className="mx-auto mb-4 text-orange-500" size={32} fill="currentColor" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Best Streak</p>
            <p className="text-4xl font-black text-primary">14 Days</p>
          </Card>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border">
          <div className="p-8 border-b border-border bg-secondary/20">
            <h2 className="text-2xl font-black text-primary">Global Ranking</h2>
          </div>
          <div className="divide-y divide-border">
            {MOCK_LEADERBOARD.map((user, index) => (
              <div 
                key={user.id} 
                className={`p-6 flex items-center justify-between hover:bg-secondary/10 transition-colors ${user.name.includes('(You)') ? 'bg-secondary/30' : ''}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-8 text-center font-black text-xl text-primary">
                    {index === 0 ? <Medal className="text-yellow-500 mx-auto" /> : 
                     index === 1 ? <Medal className="text-slate-400 mx-auto" /> : 
                     index === 2 ? <Medal className="text-amber-600 mx-auto" /> : 
                     index + 1}
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-primary text-lg">{user.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame size={14} className="text-orange-500" /> {user.streak} day streak</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary text-xl">{user.score.toLocaleString()}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}