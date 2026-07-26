"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
    PhotoCapture, 
    AnalysisResult, 
    analyzeImageQuality, 
    performAnalysis
} from '@/lib/facial-analysis';
import { Storage } from "@/lib/storage";
import { HunterHeader } from "@/components/shared/hunter-header";
import { HunterCard } from "@/components/shared/hunter-card";
import { AssessmentFlow } from "@/components/features/looks/AssessmentFlow";
import { AssessmentResults } from "@/components/features/looks/AssessmentResults";

type CaptureStep = 'front' | 'left' | 'right';

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
          let dataUrl = "";
          
          if (!Capacitor.isNativePlatform()) {
              // Web fallback using file input trigger
              dataUrl = await new Promise<string>((resolve, reject) => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'user';
                  input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.onerror = (err) => reject(err);
                          reader.readAsDataURL(file);
                      } else {
                          reject(new Error('No file selected'));
                      }
                  };
                  input.click();
              });
          } else {
              const image = await CapCamera.getPhoto({
                  quality: 90,
                  allowEditing: false,
                  resultType: CameraResultType.DataUrl,
                  source: CameraSource.Camera,
                  saveToGallery: false,
                  correctOrientation: true
              });
              dataUrl = image.dataUrl || "";
          }

          if (!dataUrl) return;

          const quality = analyzeImageQuality(dataUrl);
          
          const photo: PhotoCapture = {
              dataUrl,
              timestamp: Date.now(),
              pose,
              quality
          };

          const newPhotos = [...photos, photo];
          setPhotos(newPhotos);

          if (pose === 'front') {
              setCaptureStep('left');
          } else if (pose === 'left') {
              setCaptureStep('right');
          } else {
              setCaptureStep(null);
              analyzePhotos(newPhotos);
          }

      } catch (error: any) {
          console.error("Camera error:", error);
          if (!error.message?.includes('cancelled') && !error.message?.includes('No file selected')) {
              alert(error.message?.includes('permission') 
                ? "Camera permission denied." 
                : `Camera error: ${error.message}`);
          }
      }
  };

  const analyzePhotos = (capturedPhotos: PhotoCapture[]) => {
      setScanning(true);
      const profile = Storage.getProfile();
      const existingSeed = profile?.hunterSeed;
      
      setTimeout(() => {
          const analysis = performAnalysis(capturedPhotos, existingSeed);
          if (!existingSeed && profile) {
              Storage.saveProfile({ ...profile, hunterSeed: analysis.hunterSeed });
          }
          setResult(analysis);
          setScanning(false);
      }, 3000);
  };

  const retakePhoto = (pose: CaptureStep) => {
      setPhotos(prev => prev.filter(p => p.pose !== pose));
      setCaptureStep(pose);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24">
         <HunterHeader title="Hunter Assessment" onBack={() => router.replace('/')} />

         <div className="space-y-6">
            <HunterCard variant="system" className="border-green-500/20 bg-zinc-900/40">
                <div className="flex items-start gap-4 p-1">
                    <Shield className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                    <div className="text-xs text-zinc-400 leading-relaxed">
                        <p className="text-green-400 font-black uppercase tracking-widest mb-1">Privacy Guaranteed</p>
                        <p className="italic">Analysis is performed locally on your device. Photos are <span className="text-white font-bold">never stored</span> or uploaded to any server.</p>
                    </div>
                </div>
            </HunterCard>

            {!result ? (
              <AssessmentFlow 
                captureStep={captureStep}
                photos={photos}
                scanning={scanning}
                onStart={startCapture}
                onCapture={capturePhoto}
                onRetake={retakePhoto}
              />
            ) : (
              <AssessmentResults 
                result={result}
                onReset={startCapture}
              />
            )}
         </div>
    </div>
  );
}
