"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Upload, ChevronLeft, Save, User, Dumbbell, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Storage, type Profile } from "@/lib/storage";

export default function ProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'loading' | 'setup' | 'view' | 'edit'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: "Hunter",
    dob: "2000-01-01",
    weight: 70,
    height: 175,
    goal: 'bulk',
    experience: 'intermediate',
    favoriteFoods: [],
  });

  const [benchmarks, setBenchmarks] = useState({
      benchPress: 0,
      squat: 0,
      deadlift: 0,
      maxPushups: 0,
      run5km: "",
      maxBurpees: 0
  });
  
  const [foodInput, setFoodInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     if (typeof window !== 'undefined') {
         const existing = Storage.getProfile();
         if (existing && existing.name) {
             setProfile(existing);
             setFormData(existing);
             setBenchmarks({
                 benchPress: existing.benchmarks?.benchPress || 0,
                 squat: existing.benchmarks?.squat || 0,
                 deadlift: existing.benchmarks?.deadlift || 0,
                 maxPushups: existing.benchmarks?.maxPushups || 0,
                 run5km: existing.benchmarks?.run5km || "",
                 maxBurpees: existing.benchmarks?.maxBurpees || 0
             });
             setMode('view');
         } else {
             setMode('setup');
         }
     }
  }, []);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBenchmarkChange = (field: keyof typeof benchmarks, value: any) => {
      setBenchmarks(prev => ({ ...prev, [field]: value }));
  };

  const calculateStats = () => {
      // Logic to determine S/A/B/C/D based on benchmarks
      // STR Calculation
      let strScore = 10;
      const totalLift = benchmarks.benchPress + benchmarks.squat + benchmarks.deadlift;
      const bwRatio = formData.weight ? totalLift / formData.weight : 0;
      
      if (bwRatio > 5.0) strScore = 95; // Elite (e.g. 70kg person lifting 350kg total)
      else if (bwRatio > 4.0) strScore = 80;
      else if (bwRatio > 3.0) strScore = 60;
      else if (bwRatio > 2.0) strScore = 40;
      else if (bwRatio > 1.0) strScore = 20;
      
      // Pushups bonus
      if (benchmarks.maxPushups > 60) strScore += 10;
      else if (benchmarks.maxPushups > 40) strScore += 5;

      // AGI Calculation
      let agiScore = 10;
      if (benchmarks.maxBurpees > 30) agiScore = 80;
      else if (benchmarks.maxBurpees > 20) agiScore = 50;
      else if (benchmarks.maxBurpees > 10) agiScore = 30;

      // VIT (Based on BMI/General fit + AGI bleed)
      let vitScore = Math.floor((strScore + agiScore) / 2);

      // Cap at 100
      return {
          str: Math.min(100, Math.max(1, strScore)),
          agi: Math.min(100, Math.max(1, agiScore)),
          vit: Math.min(100, Math.max(1, vitScore)),
          per: 10 // Base perception
      };
  };

  const finishSetup = () => {
    const stats = calculateStats();
    // Avg score for Rank
    const avgScore = (stats.str + stats.agi + stats.vit) / 3;
    
    const newProfile: Profile = {
        ...(formData as Profile),
        startDate: new Date().toISOString().split('T')[0],
        startRank: Math.floor(avgScore),
        currentRank: Math.floor(avgScore),
        stats: stats,
        benchmarks: benchmarks
    };
    
    Storage.saveProfile(newProfile);
    Storage.saveQuest(null);

    setLoading(true);
    setTimeout(() => {
         window.location.href = "/";
    }, 1500);
  };

  const saveEdit = () => {
      if (profile) {
          const stats = calculateStats();
          const updated: Profile = {
              ...profile,
              ...formData as Profile,
              benchmarks: benchmarks,
              stats: stats
          };
          Storage.saveProfile(updated);
          setProfile(updated);
          setMode('view');
      }
  };

  const calculateAge = (dobString?: string) => {
      if (!dobString) return 0;
      const dob = new Date(dobString);
      const diff_ms = Date.now() - dob.getTime();
      const age_dt = new Date(diff_ms); 
      return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const calculateDaysStart = (startString?: string) => {
      if (!startString) return 0;
      const start = new Date(startString);
      const diff = Date.now() - start.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (mode === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center text-primary animate-pulse">LOADING PROFILE...</div>;

  if (mode === 'view' && profile) {
      return (
        <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24">
             <header className="flex items-center mb-8">
                 <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                     <ChevronLeft className="w-6 h-6" />
                 </Button>
                 <h1 className="text-xl font-bold ml-2">HUNTER PROFILE</h1>
             </header>

             <Card className="glass-card mb-6 border-primary/20 bg-zinc-900/50">
                 <CardHeader className="text-center pb-2">
                     <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto mb-2 border-2 border-primary flex items-center justify-center">
                         <User className="w-12 h-12 text-zinc-500" />
                     </div>
                     <CardTitle className="text-2xl text-primary">{profile.name}</CardTitle>
                     <CardDescription>{profile.experience.toUpperCase()} CLASS HUNTER</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4 text-center">
                         <div className="p-3 bg-zinc-900 rounded-lg">
                             <div className="text-xs text-zinc-500 uppercase">Age</div>
                             <div className="text-xl font-bold">{calculateAge(profile.dob)}</div>
                         </div>
                         <div className="p-3 bg-zinc-900 rounded-lg">
                             <div className="text-xs text-zinc-500 uppercase">Active</div>
                             <div className="text-xl font-bold text-primary">{calculateDaysStart(profile.startDate)}d</div>
                         </div>
                     </div>
                     
                     <div className="space-y-2">
                         <h3 className="text-sm text-zinc-500 uppercase">Physical stats</h3>
                         <div className="grid grid-cols-3 gap-2 text-center text-sm">
                             <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                 <span className="text-red-400 font-bold block">STR</span> {profile.stats.str}
                             </div>
                             <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                 <span className="text-green-400 font-bold block">AGI</span> {profile.stats.agi}
                             </div>
                             <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                 <span className="text-blue-400 font-bold block">VIT</span> {profile.stats.vit}
                             </div>
                         </div>
                     </div>

                     <Button className="w-full mt-4" variant="outline" onClick={() => setMode('edit')}>
                         Edit Profile
                     </Button>
                 </CardContent>
             </Card>
        </div>
      );
  }

  if (mode === 'edit') {
      return (
        <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24 overflow-y-auto">
            <header className="flex items-center mb-8">
                 <Button variant="ghost" size="icon" onClick={() => setMode('view')}>
                     <ChevronLeft className="w-6 h-6" />
                 </Button>
                 <h1 className="text-xl font-bold ml-2">EDIT PROFILE</h1>
             </header>
             
             <div className="space-y-6">
                <Card className="glass-card bg-zinc-900/50">
                    <CardHeader><CardTitle className="text-lg">Basics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Code Name</Label>
                            <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-black/50 border-primary/30" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input type="date" value={formData.dob} onChange={(e) => handleInputChange('dob', e.target.value)} className="bg-black/50 border-primary/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-zinc-900/50">
                    <CardHeader><CardTitle className="text-lg">Stats Recalibration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bench Press (kg)</Label>
                                <Input type="number" value={benchmarks.benchPress} onChange={(e) => handleBenchmarkChange('benchPress', Number(e.target.value))} className="bg-black/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Squat (kg)</Label>
                                <Input type="number" value={benchmarks.squat} onChange={(e) => handleBenchmarkChange('squat', Number(e.target.value))} className="bg-black/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadlift (kg)</Label>
                                <Input type="number" value={benchmarks.deadlift} onChange={(e) => handleBenchmarkChange('deadlift', Number(e.target.value))} className="bg-black/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Pushups</Label>
                                <Input type="number" value={benchmarks.maxPushups} onChange={(e) => handleBenchmarkChange('maxPushups', Number(e.target.value))} className="bg-black/50" />
                            </div>
                        </div>
                        <Button className="w-full bg-primary mt-2" onClick={saveEdit}>
                            <Save className="w-4 h-4 mr-2" /> Save & Recalibrate
                        </Button>
                    </CardContent>
                </Card>
             </div>
        </div>
      );
  }

  // SETUP MODE
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0f] to-black">
        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div
                    key="step1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="w-full max-w-md"
                >
                    <Card className="glass-card border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-3xl text-primary text-glow">Hunter Registration</CardTitle>
                            <CardDescription>Step 1: Personal Data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Code Name</Label>
                                <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-black/50 border-primary/30 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" value={formData.dob} onChange={(e) => handleInputChange('dob', e.target.value)} className="bg-black/50 border-primary/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Weight (kg)</Label>
                                    <Input type="number" value={formData.weight} onChange={(e) => handleInputChange('weight', Number(e.target.value))} className="bg-black/50 border-primary/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Height (cm)</Label>
                                    <Input type="number" value={formData.height} onChange={(e) => handleInputChange('height', Number(e.target.value))} className="bg-black/50 border-primary/30" />
                                </div>
                            </div>
                            <Button className="w-full mt-4 bg-primary" onClick={() => setStep(2)}>Next <ChevronRight className="ml-2 w-4 h-4" /></Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="w-full max-w-md"
                >
                    <Card className="glass-card border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-3xl text-red-500 text-glow flex items-center gap-2">
                                <Dumbbell className="w-8 h-8"/> Strength Evaluation
                            </CardTitle>
                            <CardDescription>Enter your 1-Rep Max (or estimate).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Bench Press (kg)</Label>
                                    <Input type="number" placeholder="0" value={benchmarks.benchPress || ''} onChange={(e) => handleBenchmarkChange('benchPress', Number(e.target.value))} className="bg-black/50 border-red-500/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Squat (kg)</Label>
                                    <Input type="number" placeholder="0" value={benchmarks.squat || ''} onChange={(e) => handleBenchmarkChange('squat', Number(e.target.value))} className="bg-black/50 border-red-500/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deadlift (kg)</Label>
                                    <Input type="number" placeholder="0" value={benchmarks.deadlift || ''} onChange={(e) => handleBenchmarkChange('deadlift', Number(e.target.value))} className="bg-black/50 border-red-500/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Pushups (Reps)</Label>
                                    <Input type="number" placeholder="0" value={benchmarks.maxPushups || ''} onChange={(e) => handleBenchmarkChange('maxPushups', Number(e.target.value))} className="bg-black/50 border-red-500/30" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button className="flex-1" variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 w-4 h-4"/> Back</Button>
                                <Button className="flex-1 bg-red-600 hover:bg-red-500" onClick={() => setStep(3)}>Next <ChevronRight className="ml-2 w-4 h-4"/></Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="w-full max-w-md"
                >
                    <Card className="glass-card border-green-500/20">
                        <CardHeader>
                            <CardTitle className="text-3xl text-green-500 text-glow flex items-center gap-2">
                                <Wind className="w-8 h-8"/> Agility Evaluation
                            </CardTitle>
                            <CardDescription>Test your speed and endurance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>5km Run Time (Min:Sec) - Optional</Label>
                                <Input placeholder="e.g. 25:00" value={benchmarks.run5km} onChange={(e) => handleBenchmarkChange('run5km', e.target.value)} className="bg-black/50 border-green-500/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Burpees in 1 Min (Reps)</Label>
                                <Input type="number" placeholder="0" value={benchmarks.maxBurpees || ''} onChange={(e) => handleBenchmarkChange('maxBurpees', Number(e.target.value))} className="bg-black/50 border-green-500/30" />
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                                <Button className="flex-1" variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-2 w-4 h-4"/> Back</Button>
                                <Button className="flex-1 bg-primary hover:bg-primary/80" onClick={finishSetup}>
                                    {loading ? "CALCULATING..." : "AWAKEN"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
