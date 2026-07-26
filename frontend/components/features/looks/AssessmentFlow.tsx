"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { type PhotoCapture } from "@/lib/facial-analysis";

type CaptureStep = 'front' | 'left' | 'right';

const CAPTURE_INSTRUCTIONS = {
  front: { title: "Front View", instruction: "Face camera directly. Keep expression neutral. Ensure even lighting.", icon: "📸" },
  left: { title: "Left Profile", instruction: "Turn head slightly left (~15°). Maintain neutral expression.", icon: "↖️" },
  right: { title: "Right Profile", instruction: "Turn head slightly right (~15°). Keep face relaxed.", icon: "↗️" }
};

interface AssessmentFlowProps {
  captureStep: CaptureStep | null;
  photos: PhotoCapture[];
  scanning: boolean;
  onStart: () => void;
  onCapture: (pose: CaptureStep) => void;
  onRetake: (pose: CaptureStep) => void;
}

export function AssessmentFlow({
  captureStep,
  photos,
  scanning,
  onStart,
  onCapture,
  onRetake
}: AssessmentFlowProps) {
  if (scanning) {
    return (
      <HunterCard variant="looks" className="border-cyan-500/50 bg-zinc-900/60">
        <div className="p-12 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <p className="text-cyan-400 font-mono text-sm uppercase font-black italic">Analyzing Hunter Potential...</p>
            <p className="text-zinc-500 text-xs mt-2">Processing {photos.length} captures</p>
            <p className="text-zinc-600 text-xs italic">Calculating ensemble metrics...</p>
          </div>
        </div>
      </HunterCard>
    );
  }

  if (!photos.length && !captureStep) {
    return (
      <HunterCard variant="looks">
        <div className="p-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center ring-1 ring-cyan-500/50 animate-pulse mx-auto">
            <Camera className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-cyan-100 mb-2">Begin Assessment</h3>
            <p className="text-xs text-zinc-500 mb-6 italic lead-relaxed">
              Capture 3 photos for accurate analysis<br/>
              Front view + Left/Right profiles
            </p>
            <HunterButton className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={onStart}>
              Start Capture
            </HunterButton>
          </div>
        </div>
      </HunterCard>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {captureStep && (
          <motion.div key={captureStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <HunterCard 
              variant="looks" 
              className="border-cyan-500/50 bg-zinc-900/60"
              title={CAPTURE_INSTRUCTIONS[captureStep].title}
              headerAction={<span className="text-2xl">{CAPTURE_INSTRUCTIONS[captureStep].icon}</span>}
            >
              <div className="space-y-4">
                <p className="text-sm text-zinc-300 italic">{CAPTURE_INSTRUCTIONS[captureStep].instruction}</p>
                <div className="flex gap-2 justify-center py-2">
                  <div className={`w-3 h-3 rounded-full ${photos.some(p => p.pose === 'front') ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                  <div className={`w-3 h-3 rounded-full ${photos.some(p => p.pose === 'left') ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                  <div className={`w-3 h-3 rounded-full ${photos.some(p => p.pose === 'right') ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                </div>
                <HunterButton className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => onCapture(captureStep)}>
                  <Camera className="w-4 h-4 mr-2" /> Capture {CAPTURE_INSTRUCTIONS[captureStep].title}
                </HunterButton>
              </div>
            </HunterCard>
          </motion.div>
        )}
      </AnimatePresence>

      {photos.length > 0 && !captureStep && (
        <HunterCard title={`Review Photos (${photos.length}/3)`}>
          <div className="space-y-2 pt-2">
            {(['front', 'left', 'right'] as CaptureStep[]).map(pose => {
              const photo = photos.find(p => p.pose === pose);
              return (
                <div key={pose} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{pose} View</span>
                  {photo ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                      <HunterButton variant="ghost" size="sm" onClick={() => onRetake(pose)} className="h-8 w-8 p-0 text-zinc-600 hover:text-white">
                        <RotateCcw className="w-4 h-4" />
                      </HunterButton>
                    </div>
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-900/50" />
                  )}
                </div>
              );
            })}
          </div>
        </HunterCard>
      )}
    </div>
  );
}
