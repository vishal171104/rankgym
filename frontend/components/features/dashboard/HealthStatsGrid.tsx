"use client";

import { motion } from "framer-motion";
import { Footprints, Flame, Moon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type HealthStats, HealthService } from "@/lib/health";
import { useEffect, useState } from "react";

interface HealthStatsGridProps {
  initialStats: HealthStats | null;
}

export function HealthStatsGrid({ initialStats }: HealthStatsGridProps) {
  const [stats, setStats] = useState<HealthStats | null>(initialStats);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const refreshStats = async () => {
    setStats(null);
    const newStats = await HealthService.getTodayStats();
    setStats(newStats);
  };

  const items = [
    { icon: <Footprints className="w-5 h-5 text-emerald-400" />, label: "STEPS", value: stats?.steps.toLocaleString() || "0", unit: "logged" },
    { icon: <Flame className="w-5 h-5 text-orange-400" />, label: "CALORIES", value: stats?.calories.toLocaleString() || "0", unit: "kcal" },
    { icon: <Moon className="w-5 h-5 text-indigo-400" />, label: "SLEEP", value: ((stats?.sleepMinutes || 0) / 60).toFixed(1), unit: "hours" },
  ];

  return (
    <div className="relative my-4 z-10">
      <div className="absolute -top-6 right-0">
        <Button 
          variant="ghost" size="sm" 
          className="h-6 text-xs text-zinc-500 hover:text-white" 
          onClick={refreshStats}
        >
          <RotateCcw className="w-3 h-3 mr-1" /> SYNC
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl flex flex-col items-center text-center group active:scale-95 transition-all"
          >
            <div className="mb-2 bg-black/40 p-2 rounded-lg group-hover:bg-black/60 transition-colors">
              {item.icon}
            </div>
            <span className="text-[9px] text-zinc-600 font-black tracking-widest uppercase mb-1">{item.label}</span>
            <div className="flex flex-col">
              <span className="text-lg font-mono font-bold text-zinc-200">{item.value}</span>
              <span className="text-[8px] text-zinc-600 uppercase">{item.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
