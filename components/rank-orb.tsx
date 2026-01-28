"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RankOrbProps {
  rank: string; // E, D, C, B, A, S
  progress: number; // 0-100
  size?: number;
}

const rankColors: Record<string, string> = {
  E: "var(--rank-e)",
  D: "var(--rank-d)",
  C: "var(--rank-c)",
  B: "var(--rank-b)",
  A: "var(--rank-a)", // Using hex for framer motion if needed, but var works in style
  S: "var(--rank-s)",
};

const rankGlows: Record<string, string> = {
  E: "drop-shadow(0 0 10px var(--rank-e))",
  D: "drop-shadow(0 0 15px var(--rank-d))",
  C: "drop-shadow(0 0 20px var(--rank-c))",
  B: "drop-shadow(0 0 25px var(--rank-b))",
  A: "drop-shadow(0 0 30px var(--rank-a))",
  S: "drop-shadow(0 0 40px var(--rank-s))",
};

export function RankOrb({ rank, progress, size = 200 }: RankOrbProps) {
  const [pulse, setPulse] = useState(false);
  const color = rankColors[rank] || rankColors.E;
  const glow = rankGlows[rank] || rankGlows.E;

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderColor: color,
          boxShadow: `0 0 30px ${color}40`,
        }}
      />

      {/* Progress Fill */}
      <svg width={size} height={size} viewBox="0 0 100 100" className="absolute rotate-[-90deg]">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.2"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="283"
          strokeDashoffset={283 - (283 * progress) / 100}
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Core Orb */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center font-bold text-4xl text-black"
        style={{
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: color,
            filter: glow,
        }}
        animate={{
            y: [0, -10, 0],
        }}
        transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }}
      >
        {rank}
      </motion.div>
      
       {/* Particles (Simplified CSS) */}
       <div className="absolute inset-0 pointer-events-none">
           {/* We can add particle effects here later */}
       </div>
    </div>
  );
}
