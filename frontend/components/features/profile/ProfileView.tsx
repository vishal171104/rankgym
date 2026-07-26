"use client";

import { User } from "lucide-react";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { Storage, type Profile } from "@/lib/storage";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
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

  return (
    <HunterCard
      variant="system"
      className="mb-6 border-primary/20"
    >
      <div className="text-center pb-2">
        <div className="w-24 h-24 rounded-full bg-zinc-800 mx-auto mb-2 border-2 border-primary flex items-center justify-center">
          <User className="w-12 h-12 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-primary italic tracking-tighter uppercase">{profile.name}</h2>
        <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">{profile.experience} CLASS HUNTER</p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-black">Age</div>
            <div className="text-xl font-bold font-mono">{calculateAge(profile.dob)}</div>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-black">Active</div>
            <div className="text-xl font-bold font-mono text-primary">{calculateDaysStart(profile.startDate)}d</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Physical stats</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
              <span className="text-red-400 font-black block text-[9px]">STR</span> 
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="font-mono font-bold text-lg">{profile.stats.str}</span>
                <span className="text-[8px] text-zinc-600">/100</span>
              </div>
            </div>
            <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
              <span className="text-green-400 font-black block text-[9px]">AGI</span> 
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="font-mono font-bold text-lg">{profile.stats.agi}</span>
                <span className="text-[8px] text-zinc-600">/100</span>
              </div>
            </div>
            <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
              <span className="text-blue-400 font-black block text-[9px]">VIT</span> 
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="font-mono font-bold text-lg">{profile.stats.vit}</span>
                <span className="text-[8px] text-zinc-600">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <HunterButton className="flex-1" variant="outline" onClick={onEdit}>
            Edit Profile
          </HunterButton>
          <HunterButton 
            className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30" 
            variant="outline" 
            onClick={() => {
              const dump = Storage.exportUserData();
              const blob = new Blob([dump], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hunter-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
          >
            Backup Data
          </HunterButton>
        </div>
      </div>
    </HunterCard>
  );
}
