"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { type Profile } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface StatsRadarProps {
  stats: Profile['stats'];
}

export function StatsRadar({ stats }: StatsRadarProps) {
  if (!stats) return null;

  const data = [
    { subject: 'STR', A: stats.str },
    { subject: 'AGI', A: stats.agi },
    { subject: 'VIT', A: stats.vit },
    { subject: 'PER', A: stats.per },
  ];

  return (
    <div className="w-full relative py-2">
      {/* Background Stats Numbers - Redesigned as HUD Bar */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl mb-2">
        {[
          { label: 'STR', val: stats.str, color: 'text-red-400' },
          { label: 'AGI', val: stats.agi, color: 'text-green-400' },
          { label: 'VIT', val: stats.vit, color: 'text-blue-400' },
          { label: 'PER', val: stats.per, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="text-center p-2 rounded-xl bg-black/40 border border-white/5 group">
            <p className={cn("text-[8px] font-black tracking-widest mb-0.5 opacity-70", s.color)}>{s.label}</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-mono font-bold text-white tracking-tighter">{s.val}</span>
              <span className="text-[7px] font-black text-zinc-700">/100</span>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-[220px] -mt-10 relative z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#222" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} 
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Stats"
              dataKey="A"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="#8b5cf6"
              fillOpacity={0.3}
              isAnimationActive={true}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
