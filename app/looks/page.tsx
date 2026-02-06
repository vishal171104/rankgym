"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, Sparkles, CheckCircle2, Shield, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
    PhotoCapture, 
    AnalysisResult, 
    analyzeImageQuality, 
    performAnalysis,
    generateHunterSeed
} from '@/lib/facial-analysis';
import { Storage } from "@/lib/storage";

type CaptureStep = 'front' | 'left' | 'right';

const CAPTURE_INSTRUCTIONS = {
    front: {
        title: "Front View",
        instruction: "Face camera directly. Keep expression neutral. Ensure even lighting.",
        icon: "📸"
    },
    left: {
        title: "Left Profile",
        instruction: "Turn head slightly left (~15°). Maintain neutral expression.",
        icon: "↖️"
    },
    right: {
        title: "Right Profile",
        instruction: "Turn head slightly right (~15°). Keep face relaxed.",
        icon: "↗️"
    }
};

export default function LooksPage() {
  const router = useRouter();
  const [captureStep, setCaptureStep] = useState<CaptureStep | null>(null);
  const [photos, setPhotos] = useState<PhotoCapture[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const startCapture = () => {
      setPhotos([]);
      setResult(null);
      setCaptureStep('front');
  };

  const capturePhoto = async (pose: CaptureStep) => {
      try {
          const { Capacitor } = await import('@capacitor/core');
          
          if (!Capacitor.isNativePlatform()) {
              alert("Camera feature only works on iPhone. Please deploy to your device via Xcode.");
              return;
          }
          
          const image = await CapCamera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.DataUrl,
              source: CameraSource.Camera,
              saveToGallery: false,
              correctOrientation: true
          });

          if (!image.dataUrl) return;

          // Analyze quality
          const quality = analyzeImageQuality(image.dataUrl);
          
          const photo: PhotoCapture = {
              dataUrl: image.dataUrl,
              timestamp: Date.now(),
              pose,
              quality
          };

          const newPhotos = [...photos, photo];
          setPhotos(newPhotos);

          // Move to next step
          if (pose === 'front') {
              setCaptureStep('left');
          } else if (pose === 'left') {
              setCaptureStep('right');
          } else {
              // All photos captured, analyze
              setCaptureStep(null);
              analyzePhotos(newPhotos);
          }

      } catch (error: any) {
          console.error("Camera error:", error);
          
          if (error.message?.includes('permission')) {
              alert("Camera permission denied. Please enable camera access in Settings > Privacy > Camera > gymw");
          } else if (!error.message?.includes('cancelled')) {
              alert(`Camera error: ${error.message || 'Unknown error'}`);
          }
      }
  };

  const analyzePhotos = (capturedPhotos: PhotoCapture[]) => {
      setScanning(true);
      
      // Get existing Hunter Seed from storage if available
      const profile = Storage.getProfile();
      const existingSeed = profile?.hunterSeed;
      
      setTimeout(() => {
          const analysis = performAnalysis(capturedPhotos, existingSeed);
          
          // Save Hunter Seed to profile if new
          if (!existingSeed && profile) {
              Storage.saveProfile({
                  ...profile,
                  hunterSeed: analysis.hunterSeed
              });
          }
          
          setResult(analysis);
          setScanning(false);
      }, 3000);
  };

  const retakePhoto = (pose: CaptureStep) => {
      const filtered = photos.filter(p => p.pose !== pose);
      setPhotos(filtered);
      setCaptureStep(pose);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24">
         <header className="flex items-center mb-6">
             <Button variant="ghost" size="icon" onClick={() => router.replace('/')}>
                 <ChevronLeft className="w-6 h-6" />
             </Button>
             <h1 className="text-xl font-bold ml-2">HUNTER ASSESSMENT</h1>
         </header>

         <div className="space-y-6">
            
            {/* Privacy Notice */}
            <Card className="glass-card border-green-500/20 bg-zinc-900/40">
                <CardContent className="p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-400">
                        <p className="text-green-400 font-bold mb-1">Privacy Guaranteed</p>
                        <p>Photos are analyzed instantly and <span className="text-white font-semibold">never stored</span>. Multi-photo analysis ensures consistency.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Capture Flow */}
            {!result && !scanning && photos.length === 0 && !captureStep && (
                <Card className="glass-card border-cyan-500/20 bg-zinc-900/40">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center ring-1 ring-cyan-500/50 animate-pulse mx-auto">
                            <Camera className="w-10 h-10 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-cyan-100 mb-2">Begin Assessment</h3>
                            <p className="text-xs text-zinc-500 mb-4">
                                Capture 3 photos for accurate analysis<br/>
                                Front view + Left/Right profiles
                            </p>
                            <Button 
                                className="w-full bg-cyan-600 hover:bg-cyan-700" 
                                onClick={startCapture}
                            >
                                Start Capture
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Capture Step */}
            <AnimatePresence>
                {captureStep && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="glass-card border-cyan-500/50 bg-zinc-900/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-cyan-400">
                                    <span className="text-2xl">{CAPTURE_INSTRUCTIONS[captureStep].icon}</span>
                                    <span>{CAPTURE_INSTRUCTIONS[captureStep].title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-zinc-300">
                                    {CAPTURE_INSTRUCTIONS[captureStep].instruction}
                                </p>
                                
                                {/* Progress Indicator */}
                                <div className="flex gap-2 justify-center">
                                    <div className={`w-3 h-3 rounded-full ${photos.some(p => p.pose === 'front') ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                                    <div className={`w-3 h-3 rounded-full ${photos.some(p => p.pose === 'left') ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                                    <div className={`w-3 h-3 rounded-full ${photos.some(p => p.pose === 'right') ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                                </div>

                                <Button 
                                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                                    onClick={() => capturePhoto(captureStep)}
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Capture {CAPTURE_INSTRUCTIONS[captureStep].title}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo Review (before analysis) */}
            {photos.length > 0 && !scanning && !result && !captureStep && (
                <Card className="glass-card border-zinc-700 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-sm">Captured Photos ({photos.length}/3)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(['front', 'left', 'right'] as CaptureStep[]).map(pose => {
                            const photo = photos.find(p => p.pose === pose);
                            return (
                                <div key={pose} className="flex items-center justify-between p-2 bg-black/40 rounded">
                                    <span className="text-xs capitalize">{pose} View</span>
                                    {photo ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => retakePhoto(pose)}
                                                className="h-6 text-xs"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-zinc-600" />
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Scanning State */}
            {scanning && (
                <Card className="glass-card border-cyan-500/50 bg-zinc-900/60">
                    <CardContent className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <div>
                            <p className="text-cyan-400 font-mono text-sm">ANALYZING HUNTER POTENTIAL...</p>
                            <p className="text-zinc-500 text-xs mt-2">Processing {photos.length} captures</p>
                            <p className="text-zinc-600 text-xs">Calculating ensemble metrics...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {result && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Hunter Seed */}
                    <Card className="glass-card border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-zinc-900/40">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] text-purple-400 uppercase mb-1">Hunter ID</p>
                            <p className="text-sm font-mono text-purple-300">{result.hunterSeed}</p>
                            <p className="text-[9px] text-zinc-600 mt-1">Permanent baseline established</p>
                        </CardContent>
                    </Card>

                    {/* Stats Comparison */}
                    <Card className="glass-card border-cyan-500/30 bg-zinc-900/60">
                        <CardHeader>
                            <CardTitle className="text-cyan-400">Assessment Results</CardTitle>
                            <p className="text-xs text-zinc-500">Variance: ±{result.variance} (Lower = More Reliable)</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Current vs Potential */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
                                    <p className="text-[10px] text-orange-400 uppercase mb-1">Current State</p>
                                    <p className="text-3xl font-bold text-orange-300">{result.currentState.overall}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-lg p-4 border border-cyan-500/50">
                                    <p className="text-[10px] text-cyan-300 uppercase mb-1">Max Potential</p>
                                    <p className="text-3xl font-bold text-cyan-300">{result.potential.overall}</p>
                                </div>
                            </div>
                            <p className="text-center text-xs text-zinc-600">
                                +{result.potential.overall - result.currentState.overall} points achievable
                            </p>

                            {/* Detailed Stats */}
                            <div className="space-y-3">
                                {[
                                    { label: 'Symmetry', current: result.currentState.symmetry, potential: result.potential.symmetry },
                                    { label: 'Skin Clarity', current: result.currentState.skinClarity, potential: result.potential.skinClarity },
                                    { label: 'Definition', current: result.currentState.definition, potential: result.potential.definition },
                                    { label: 'Eye Area', current: result.currentState.eyeArea, potential: result.potential.eyeArea }
                                ].map(stat => (
                                    <div key={stat.label} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-400">{stat.label}</span>
                                            <span className="text-orange-400">{stat.current}</span>
                                        </div>
                                        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div 
                                                className="absolute h-full bg-orange-500/50" 
                                                style={{ width: `${stat.current}%` }}
                                            />
                                            <div 
                                                className="absolute h-full bg-cyan-500/30 border-r-2 border-cyan-400" 
                                                style={{ width: `${stat.potential}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-zinc-600 text-right">
                                            Potential: {stat.potential} (+{stat.potential - stat.current})
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                className="w-full" 
                                variant="outline" 
                                onClick={startCapture}
                            >
                                New Assessment
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quests */}
                    {result.quests.length > 0 && (
                        <Card className="glass-card border-yellow-500/30 bg-zinc-900/40">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-400">
                                    <Sparkles className="w-5 h-5" />
                                    <span>System Quests</span>
                                </CardTitle>
                                <p className="text-xs text-zinc-500">Complete these to unlock your potential</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {result.quests.map(quest => (
                                    <div 
                                        key={quest.id} 
                                        className="p-3 bg-black/40 rounded-lg border border-zinc-800 hover:border-yellow-600/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{quest.title}</h4>
                                                <p className="text-[10px] text-zinc-500 uppercase">
                                                    {quest.category} • Rank {quest.difficulty} • {quest.duration}
                                                </p>
                                            </div>
                                            <div className="text-xs font-mono text-yellow-400">
                                                {Object.entries(quest.statBoost).map(([key, val]) => (
                                                    <span key={key} className="block">+{val}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-400">{quest.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            )}

         </div>
    </div>
  );
}
