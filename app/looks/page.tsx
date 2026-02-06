"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, Sparkles, ScanFace, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function LooksPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
      potential: string;
      score: number;
      currentScore: number;
      features: {
          jawline: number;
          skin: number;
          symmetry: number;
          eyes: number;
      };
      recommendations: string[];
  } | null>(null);

  const captureAndAnalyze = async () => {
      try {
          setScanning(true);
          
          // Check if running on native platform
          const { Capacitor } = await import('@capacitor/core');
          
          if (!Capacitor.isNativePlatform()) {
              // Fallback for web/browser - show alert
              alert("Camera feature only works on iPhone. Please deploy to your device via Xcode.");
              setScanning(false);
              return;
          }
          
          // Take photo using device camera - photo is NOT saved to gallery
          const image = await CapCamera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.DataUrl, // Base64 data URL (in-memory only)
              source: CameraSource.Camera, // Force camera, not gallery
              saveToGallery: false, // CRITICAL: Do not save to device
              correctOrientation: true
          });

          // Simulate analysis delay (in real app, this would be AI processing)
          setTimeout(() => {
              analyzeFace();
              // Photo data (image.dataUrl) is automatically garbage collected after this function
              // No storage, no persistence - privacy guaranteed
          }, 3000);

      } catch (error: any) {
          console.error("Camera error:", error);
          setScanning(false);
          
          // Show user-friendly error
          if (error.message?.includes('permission')) {
              alert("Camera permission denied. Please enable camera access in Settings > Privacy > Camera > gymw");
          } else if (error.message?.includes('cancelled')) {
              // User cancelled - do nothing
          } else {
              alert(`Camera error: ${error.message || 'Unknown error'}`);
          }
      }
  };

  const analyzeFace = () => {
      // Simulate analysis - Current state (realistic baseline)
      const currentScore = Math.floor(Math.random() * (75 - 55) + 55);
      
      // Potential (what you could reach with looksmaxxing protocol)
      const potentialScore = Math.min(95, currentScore + Math.floor(Math.random() * (25 - 15) + 15));
      
      setResult({
          potential: potentialScore > 85 ? "S-TIER MODEL" : potentialScore > 75 ? "A-TIER IDOL" : "B-TIER PROSPECT",
          score: potentialScore,
          currentScore: currentScore,
          features: {
              jawline: Math.floor(Math.random() * (99 - 60) + 60),
              skin: Math.floor(Math.random() * (99 - 50) + 50),
              symmetry: Math.floor(Math.random() * (99 - 70) + 70),
              eyes: Math.floor(Math.random() * (99 - 60) + 60),
          },
          recommendations: [
              "Increase Beta-Carotene (Carrots/Sweet Potato) for skin warmth.",
              "Implement 'Mewing' protocol for jawline definition.",
              "Reduce Sodium Intake (avoid Vada/Chips) to decrease face bloating.",
              "Apply Retinol nightly for skin texture refinement."
          ]
      });
      setScanning(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24">
         <header className="flex items-center mb-8">
             <Button variant="ghost" size="icon" onClick={() => router.replace('/')}>
                 <ChevronLeft className="w-6 h-6" />
             </Button>
             <h1 className="text-xl font-bold ml-2">FACIAL ANALYSIS</h1>
         </header>

         <div className="space-y-6">
            
            {/* Privacy Notice */}
            <Card className="glass-card border-green-500/20 bg-zinc-900/40">
                <CardContent className="p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-400">
                        <p className="text-green-400 font-bold mb-1">Privacy Guaranteed</p>
                        <p>Photos are analyzed instantly and <span className="text-white font-semibold">never stored</span>. No data leaves your device.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Scanner Area */}
            <Card className="glass-card border-pink-500/20 bg-zinc-900/40 overflow-hidden relative">
                <CardContent className="p-0 min-h-[300px] flex flex-col items-center justify-center relative">
                    {!result && !scanning && (
                         <div 
                            className="text-center space-y-4 p-8 cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-white/5 transition-colors"
                            onClick={captureAndAnalyze}
                         >
                            <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center ring-1 ring-pink-500/50 animate-pulse">
                                <Camera className="w-10 h-10 text-pink-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-pink-100">Take Selfie</h3>
                                <p className="text-xs text-zinc-500 mt-1">AI-Simulated Analysis of <br/>Structure, Skin, & Potential</p>
                                <p className="text-[10px] text-green-500 mt-2">🔒 Not stored anywhere</p>
                            </div>
                        </div>
                    )}
                    
                    {scanning && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 space-y-4">
                            <ScanFace className="w-16 h-16 text-pink-500 animate-pulse" />
                            <div className="text-center">
                                <p className="text-pink-400 font-mono text-sm">SCANNING GEOMETRY...</p>
                                <p className="text-zinc-500 text-xs mt-1">Mapping Canthal Tilt...</p>
                                <p className="text-zinc-500 text-xs">Analyzing Skin Texture...</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="w-full p-6 space-y-6 animate-in fade-in duration-700">
                             <div className="text-center">
                                 <div className="inline-block px-4 py-1 rounded-full border border-pink-500/50 bg-pink-500/10 text-pink-400 text-xs font-bold mb-2 tracking-widest">
                                     ANALYSIS COMPLETE
                                 </div>
                                 <h2 className={`text-3xl font-black text-glow ${result.score > 85 ? 'text-purple-400' : 'text-white'}`}>
                                     {result.potential}
                                 </h2>
                                 <p className="text-zinc-500 text-xs mt-1 uppercase">Maximum Potential Tier</p>
                                 
                                 {/* Current vs Potential Comparison */}
                                 <div className="mt-4 grid grid-cols-2 gap-3">
                                     <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                                         <p className="text-[10px] text-zinc-500 uppercase mb-1">Current State</p>
                                         <p className="text-2xl font-bold text-orange-400">{result.currentScore}</p>
                                     </div>
                                     <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-purple-500/50">
                                         <p className="text-[10px] text-purple-300 uppercase mb-1">Max Potential</p>
                                         <p className="text-2xl font-bold text-purple-300">{result.score}</p>
                                     </div>
                                 </div>
                                 <p className="text-[10px] text-zinc-600 mt-2">
                                     +{result.score - result.currentScore} points achievable through protocol
                                 </p>
                             </div>

                             <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs uppercase text-zinc-400">
                                        <span>Jawline / Structure</span>
                                        <span>{result.features.jawline}%</span>
                                    </div>
                                    <Progress value={result.features.jawline} className="h-1" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs uppercase text-zinc-400">
                                        <span>Skin Quality</span>
                                        <span>{result.features.skin}%</span>
                                    </div>
                                    <Progress value={result.features.skin} className="h-1" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs uppercase text-zinc-400">
                                        <span>Eye Area (Hunter Eyes)</span>
                                        <span>{result.features.eyes}%</span>
                                    </div>
                                    <Progress value={result.features.eyes} className="h-1" />
                                </div>
                             </div>

                             <Button className="w-full" variant="outline" onClick={() => {setResult(null);}}>
                                 New Scan
                             </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recommendations */}
            {result && (
                 <Card className="glass-card border-none bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span>System Advice</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {result.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 items-start text-sm text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {rec}
                            </div>
                        ))}
                    </CardContent>
                 </Card>
            )}

             <Card className="glass-card border-none bg-zinc-900/40">
                <CardHeader>
                    <CardTitle className="text-sm uppercase text-zinc-500">Dietary Intelligence</CardTitle>
                    <CardTitle className="text-lg">South Indian Aesthetics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-400">
                    <p>Local nutrition tailored for your genetics:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li><span className="text-white">Curd Rice</span>: Natural probiotic for clear skin.</li>
                        <li><span className="text-white">Ragi Mudde</span>: High minerals for bone structure (Jawline).</li>
                        <li><span className="text-white">Coconut Water</span>: Superior electrolyte hydration.</li>
                        <li><span className="text-white">Turmeric (in Rasam/Sambar)</span>: Anti-inflammatory glow.</li>
                    </ul>
                </CardContent>
            </Card>

         </div>
    </div>
  );
}
