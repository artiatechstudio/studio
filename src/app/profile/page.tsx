"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { MOCK_USER } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Shield, Bell, Trash2, Camera, ChevronRight, BadgeCheck } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        <header className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-border">
          <div className="relative">
            <Avatar className="w-40 h-40 border-8 border-secondary shadow-2xl">
              <AvatarImage src={MOCK_USER.avatar} />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute bottom-2 right-2 rounded-full bg-primary shadow-lg border-4 border-white">
              <Camera size={18} />
            </Button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-4xl font-black text-primary">{MOCK_USER.name}</h1>
              <BadgeCheck className="text-accent" size={32} fill="currentColor" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">Careingo Enthusiast • Member since 2023</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <div className="bg-secondary px-4 py-2 rounded-xl text-primary font-bold text-sm">Rank: Legend</div>
              <div className="bg-secondary px-4 py-2 rounded-xl text-primary font-bold text-sm">ID: #{MOCK_USER.id}</div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Button className="w-full md:w-auto rounded-2xl bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-bold">Edit Profile</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Settings Nav */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase tracking-widest px-4">Settings</h2>
            <nav className="space-y-2">
              {[
                { label: 'Personal Information', icon: User, active: true },
                { label: 'Security & Privacy', icon: Shield, active: false },
                { label: 'Notifications', icon: Bell, active: false },
                { label: 'Danger Zone', icon: Trash2, active: false, destructive: true },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    item.active ? 'bg-primary text-white shadow-lg' : 'hover:bg-secondary text-primary'
                  } ${item.destructive ? 'text-destructive hover:bg-destructive/10' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="font-bold">{item.label}</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black text-primary">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" defaultValue={MOCK_USER.name} className="h-12 rounded-xl bg-secondary border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="alex.r@example.com" className="h-12 rounded-xl bg-secondary border-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about your goals..." className="h-12 rounded-xl bg-secondary border-none" />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="ghost" className="rounded-xl font-bold">Discard</Button>
                  <Button className="rounded-xl bg-accent hover:bg-accent/90 px-8 font-bold">Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive/20 shadow-none rounded-[2.5rem] bg-destructive/5 overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black text-destructive">Account Management</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-4">
                <p className="text-muted-foreground text-sm font-medium">Once you delete your account, there is no going back. Please be certain.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="rounded-xl border-destructive text-destructive font-bold hover:bg-destructive hover:text-white">Deactivate Account</Button>
                  <Button variant="destructive" className="rounded-xl font-bold">Delete Account Forever</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}