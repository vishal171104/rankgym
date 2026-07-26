"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { type AnalysisResult } from "@/lib/facial-analysis";

interface AssessmentResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AssessmentResults({ result, onReset }: AssessmentResultsProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hunter Seed */}
      <HunterCard variant="system" className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-zinc-900/40">
        <div className="text-center">
          <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest mb-1">Hunter ID Baseline</p>
          <p className="text-sm font-mono text-purple-300 font-bold">{result.hunterSeed}</p>
          <p className="text-[9px] text-zinc-600 mt-2 italic">Genetic ceiling established by system analysis</p>
        </div>
      </HunterCard>

      {/* Stats Comparison */}
      <HunterCard 
        title="Assessment Results" 
        description={`Variance: ±${result.variance} (Lower = More Reliable)`}
        variant="looks"
        className="border-cyan-500/30"
      >
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-900/10 rounded-2xl p-4 border border-orange-500/20">
              <p className="text-[9px] text-orange-400 uppercase font-black mb-1">Current State</p>
              <p className="text-4xl font-black text-orange-400 italic tracking-tighter">{result.currentState.overall}</p>
            </div>
            <div className="bg-cyan-950/10 rounded-2xl p-4 border border-cyan-500/20">
              <p className="text-[9px] text-cyan-300 uppercase font-black mb-1">Max Potential</p>
              <p className="text-4xl font-black text-cyan-400 italic tracking-tighter">{result.potential.overall}</p>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            +{result.potential.overall - result.currentState.overall} points to genetic peak
          </p>

          <div className="space-y-4">
            {[
              { label: 'Symmetry', current: result.currentState.symmetry, potential: result.potential.symmetry, color: 'from-orange-500 to-orange-400', potColor: 'bg-cyan-500/30' },
              { label: 'Skin Clarity', current: result.currentState.skinClarity, potential: result.potential.skinClarity, color: 'from-emerald-500 to-emerald-400', potColor: 'bg-cyan-500/30' },
              { label: 'Definition', current: result.currentState.definition, potential: result.potential.definition, color: 'from-blue-500 to-blue-400', potColor: 'bg-cyan-500/30' },
              { label: 'Eye Area', current: result.currentState.eyeArea, potential: result.potential.eyeArea, color: 'from-purple-500 to-purple-400', potColor: 'bg-cyan-500/30' }
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                  <span className="text-zinc-500">{stat.label}</span>
                  <div className="flex gap-2">
                    <span className="text-orange-400">{stat.current}</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-cyan-400">{stat.potential}</span>
                  </div>
                </div>
                <div className="relative h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className={stat.potColor + " absolute h-full rounded-full transition-all duration-1000"} style={{ width: `${stat.potential}%` }} />
                  <div className={"bg-gradient-to-r " + stat.color + " absolute h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(251,146,60,0.2)]"} style={{ width: `${stat.current}%` }} />
                </div>
              </div>
            ))}
          </div>

          <HunterButton className="w-full mt-4" variant="outline" onClick={onReset}>
            New Assessment
          </HunterButton>
        </div>
      </HunterCard>

      {/* Quests */}
      {result.quests.length > 0 && (
        <HunterCard 
          title="System Quests" 
          description="Complete these to unlock your potential"
          headerAction={<Sparkles className="w-5 h-5 text-yellow-400" />}
          variant="side"
          className="border-yellow-500/30"
        >
          <div className="space-y-3 mt-4">
            {result.quests.map(quest => (
              <div key={quest.id} className="p-4 bg-black/40 rounded-2xl border border-zinc-800 group hover:border-yellow-600/50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{quest.title}</h4>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                      {quest.category} • Rank {quest.difficulty} • {quest.duration}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                    {Object.entries(quest.statBoost).map(([key, val]) => (
                      <span key={key} className="block">+{val} {key.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">{quest.description}</p>
              </div>
            ))}
          </div>
        </HunterCard>
      )}
    </motion.div>
  );
}
