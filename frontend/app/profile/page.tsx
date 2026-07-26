"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Storage, type Profile } from "@/lib/storage";
import { HunterHeader } from "@/components/shared/hunter-header";
import { ProfileView } from "@/components/features/profile/ProfileView";
import { ProfileEdit } from "@/components/features/profile/ProfileEdit";
import { ProfileSetup } from "@/components/features/profile/ProfileSetup";

export default function ProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'loading' | 'setup' | 'view' | 'edit'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
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

  useEffect(() => {
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
  }, []);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBenchmarkChange = (field: string, value: any) => {
      setBenchmarks(prev => ({ ...prev, [field]: value }));
  };

  const calculateStats = () => {
      let strScore = 10;
      const totalLift = benchmarks.benchPress + benchmarks.squat + benchmarks.deadlift;
      const bwRatio = formData.weight ? totalLift / formData.weight : 0;
      
      if (bwRatio > 5.0) strScore = 95;
      else if (bwRatio > 4.0) strScore = 80;
      else if (bwRatio > 3.0) strScore = 60;
      else if (bwRatio > 2.0) strScore = 40;
      else if (bwRatio > 1.0) strScore = 20;
      
      if (benchmarks.maxPushups > 60) strScore += 10;
      else if (benchmarks.maxPushups > 40) strScore += 5;

      let agiScore = 10;
      if (benchmarks.maxBurpees > 30) agiScore = 80;
      else if (benchmarks.maxBurpees > 20) agiScore = 50;
      else if (benchmarks.maxBurpees > 10) agiScore = 30;

      let vitScore = Math.floor((strScore + agiScore) / 2);

      return {
          str: Math.max(1, strScore),
          agi: Math.max(1, agiScore),
          vit: Math.max(1, vitScore),
          per: 10
      };
  };

  const finishSetup = () => {
    const stats = calculateStats();
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
    Storage.saveDailyQuest(null);
    Storage.saveSideQuests([]);

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

  if (mode === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black italic animate-pulse">SYNCHRONIZING PROFILE...</div>;

  if (mode === 'setup') {
    return (
      <ProfileSetup 
        step={step}
        setStep={setStep}
        formData={formData}
        benchmarks={benchmarks}
        handleInputChange={handleInputChange}
        handleBenchmarkChange={handleBenchmarkChange}
        finishSetup={finishSetup}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24">
      <HunterHeader 
        title={mode === 'view' ? "Hunter Profile" : "Edit Profile"} 
        onBack={() => mode === 'edit' ? setMode('view') : router.push('/')} 
      />

      {mode === 'view' && profile ? (
        <ProfileView profile={profile} onEdit={() => setMode('edit')} />
      ) : (
        <ProfileEdit 
          formData={formData}
          benchmarks={benchmarks}
          handleInputChange={handleInputChange}
          handleBenchmarkChange={handleBenchmarkChange}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
