"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Dumbbell, Wind } from "lucide-react";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Profile } from "@/lib/storage";

interface ProfileSetupProps {
  step: number;
  setStep: (step: number) => void;
  formData: Partial<Profile>;
  benchmarks: any;
  handleInputChange: (field: keyof Profile, value: any) => void;
  handleBenchmarkChange: (field: string, value: any) => void;
  finishSetup: () => void;
  loading: boolean;
}

export function ProfileSetup({
  step,
  setStep,
  formData,
  benchmarks,
  handleInputChange,
  handleBenchmarkChange,
  finishSetup,
  loading
}: ProfileSetupProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="w-full max-w-md">
            <HunterCard title="Hunter Registration" description="Step 1: Personal Data">
              <div className="space-y-4">
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
                <HunterButton className="w-full mt-4" onClick={() => setStep(2)}>Next <ChevronRight className="ml-2 w-4 h-4" /></HunterButton>
              </div>
            </HunterCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="w-full max-w-md">
            <HunterCard 
              title="Strength Evaluation" 
              description="Enter your 1-Rep Max (or estimate)."
              headerAction={<Dumbbell className="w-8 h-8 text-red-500"/>}
              variant="penalty"
            >
              <div className="space-y-4">
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
                  <HunterButton className="flex-1" variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 w-4 h-4"/> Back</HunterButton>
                  <HunterButton className="flex-1 bg-red-600 hover:bg-red-500 text-white" onClick={() => setStep(3)}>Next <ChevronRight className="ml-2 w-4 h-4"/></HunterButton>
                </div>
              </div>
            </HunterCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="w-full max-w-md">
            <HunterCard 
              title="Agility Evaluation" 
              description="Test your speed and endurance."
              headerAction={<Wind className="w-8 h-8 text-green-500"/>}
              className="border-green-500/20"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>5km Run Time (Min:Sec) - Optional</Label>
                  <Input placeholder="e.g. 25:00" value={benchmarks.run5km} onChange={(e) => handleBenchmarkChange('run5km', e.target.value)} className="bg-black/50 border-green-500/30" />
                </div>
                <div className="space-y-2">
                  <Label>Max Burpees in 1 Min (Reps)</Label>
                  <Input type="number" placeholder="0" value={benchmarks.maxBurpees || ''} onChange={(e) => handleBenchmarkChange('maxBurpees', Number(e.target.value))} className="bg-black/50 border-green-500/30" />
                </div>
                
                <div className="flex gap-2 mt-4">
                  <HunterButton className="flex-1" variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-2 w-4 h-4"/> Back</HunterButton>
                  <HunterButton className="flex-1" glow onClick={finishSetup}>
                    {loading ? "CALCULATING..." : "AWAKEN"}
                  </HunterButton>
                </div>
              </div>
            </HunterCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
