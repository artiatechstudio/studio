
"use client"

import React, { useState } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser, useFirebase } from '@/firebase';
import { ref, update } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Settings, Bell, Shield, Moon, Trash2, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Logic for saving preferences in RTDB would go here
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update settings." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
        <header className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Settings size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary">Settings</h1>
            <p className="text-muted-foreground font-medium">Manage your account preferences and app experience.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Bell className="text-accent" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div>
                  <p className="font-bold text-primary">Daily Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified when it's time for your daily task.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div>
                  <p className="font-bold text-primary">Streak Alerts</p>
                  <p className="text-sm text-muted-foreground">Alerts to help you keep your streak alive.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Moon className="text-accent" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div>
                  <p className="font-bold text-primary">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark visual themes.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 shadow-none rounded-[2.5rem] bg-destructive/5 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-destructive flex items-center gap-3">
                <Trash2 />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <p className="text-muted-foreground text-sm font-medium">Once you delete your account, all your progress, streaks, and achievements will be gone forever.</p>
              <Button variant="destructive" className="rounded-xl font-bold h-12 px-8">Delete Account Forever</Button>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="rounded-2xl bg-primary hover:bg-primary/90 px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20"
            >
              <Save className="mr-2" /> Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
