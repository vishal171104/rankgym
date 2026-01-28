"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronRight, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Storage, type Profile } from "@/lib/storage";

export default function ProfileSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: "Hunter",
    age: 24,
    weight: 70,
    height: 175,
    goal: 'bulk',
    experience: 'intermediate',
    favoriteFoods: [], // Default empty
  });
  
  const [foodInput, setFoodInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const simulateAnalysis = (file: File) => {
    setLoading(true);
    // Simulate generic "AI" delay and pose estimation
    setTimeout(() => {
        const randomScore = Math.floor(Math.random() * (85 - 60) + 60); // Random score 60-85
        setAnalysisScore(randomScore);
        setLoading(false);
    }, 2500);
  };



  const addFood = () => {
      if (foodInput.trim()) {
          setFormData(prev => ({ 
              ...prev, 
              favoriteFoods: [...(prev.favoriteFoods || []), foodInput.trim()] 
          }));
          setFoodInput("");
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        simulateAnalysis(e.target.files[0]);
    }
  };

  const finishSetup = () => {
    const startRank = analysisScore || 10;
    const profile: Profile = {
        ...formData as Profile,
        startRank: startRank,
        currentRank: startRank
    };
    Storage.saveProfile(profile);
    
    // Simulate "Awakening" delay
    setLoading(true);
    setTimeout(() => {
         router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0f] to-black">
        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div
                    key="step1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="glass-card border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-3xl text-primary text-glow">Identity Verification</CardTitle>
                            <CardDescription>Enter your hunter details to begin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Code Name</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => handleInputChange('name', e.target.value)} 
                                    className="bg-black/50 border-primary/30 text-white"
                                />
                            </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Input type="number" value={formData.age} onChange={(e) => handleInputChange('age', Number(e.target.value))} className="bg-black/50 border-primary/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weight (kg)</Label>
                                    <Input type="number" value={formData.weight} onChange={(e) => handleInputChange('weight', Number(e.target.value))} className="bg-black/50 border-primary/30" />
                                </div>
                           </div>
                           
                           <div className="space-y-2 pt-2">
                                <Label>Experience Level: <span className="text-primary">{formData.experience?.toUpperCase()}</span></Label>
                                <Slider 
                                    min={0} max={2} step={1} 
                                    value={formData.experience === 'beginner' ? [0] : formData.experience === 'intermediate' ? [1] : [2]}
                                    onValueChange={(v) => {
                                        const levels: Profile['experience'][] = ['beginner', 'intermediate', 'advanced'];
                                        handleInputChange('experience', levels[v[0]]);
                                    }}
                                />

                           </div>

                             <div className="space-y-2 pt-2">
                                <Label>Favorite Reward Meal <span className="text-zinc-500 text-xs">(for Quest Rewards)</span></Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={foodInput} 
                                        onChange={(e) => setFoodInput(e.target.value)} 
                                        placeholder="e.g. Pizza, Sushi"
                                        className="bg-black/50 border-primary/30"
                                    />
                                    <Button type="button" onClick={addFood} variant="outline" size="sm">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.favoriteFoods?.map((f, i) => (
                                        <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{f}</span>
                                    ))}
                                </div>
                           </div>

                           <Button className="w-full mt-4 bg-primary hover:bg-primary/80" onClick={() => setStep(2)}>
                                Next Step <ChevronRight className="ml-2 w-4 h-4" />
                           </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                     <Card className="glass-card border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-3xl text-primary text-glow">Physique Scan</CardTitle>
                            <CardDescription>Upload a full body shot for AI structural analysis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 flex flex-col items-center">
                            
                            {!analysisScore ? (
                                <div 
                                    className="w-full h-64 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-black/40 relative overflow-hidden"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {loading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"/>
                                            <p className="text-primary animate-pulse">Scanning Shoulder/Hip Ratio...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-zinc-500 mb-2" />
                                            <p className="text-zinc-400">Click to upload physique</p>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center mx-auto text-4xl font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                                        {analysisScore}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white">Analysis Complete</h3>
                                        <p className="text-zinc-400">Estimated Potential: <span className="text-primary-400">S-Rank Candidate</span></p>
                                    </div>
                                </div>
                            )}

                            <Button 
                                className="w-full bg-primary hover:bg-primary/80" 
                                disabled={!analysisScore || loading}
                                onClick={finishSetup}
                            >
                                {loading ? "INITIALIZING SYSTEM..." : "AWAKEN"}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
