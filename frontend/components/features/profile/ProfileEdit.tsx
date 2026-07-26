"use client";

import { Save } from "lucide-react";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Profile } from "@/lib/storage";

interface ProfileEditProps {
  formData: Partial<Profile>;
  benchmarks: any;
  handleInputChange: (field: keyof Profile, value: any) => void;
  handleBenchmarkChange: (field: string, value: any) => void;
  onSave: () => void;
}

export function ProfileEdit({
  formData,
  benchmarks,
  handleInputChange,
  handleBenchmarkChange,
  onSave
}: ProfileEditProps) {
  return (
    <div className="space-y-6">
      <HunterCard title="Basics">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Code Name</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              className="bg-black/50 border-primary/30" 
            />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input 
              type="date" 
              value={formData.dob} 
              onChange={(e) => handleInputChange('dob', e.target.value)} 
              className="bg-black/50 border-primary/30" 
            />
          </div>
        </div>
      </HunterCard>

      <HunterCard title="Stats Recalibration">
        <div className="space-y-4">
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
          <HunterButton className="w-full mt-2" onClick={onSave} glow>
            <Save className="w-4 h-4 mr-2" /> Save & Recalibrate
          </HunterButton>
        </div>
      </HunterCard>
    </div>
  );
}
