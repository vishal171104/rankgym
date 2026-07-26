"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Dumbbell, User as UserIcon, Zap, Footprints, Flame, Moon, Send, MessageSquare, ScanFace } from "lucide-react";
import { RankOrb } from "@/components/rank-orb";
import { HunterButton } from "@/components/shared/hunter-button";
import { Storage, type Profile, type DailyLog, type Quest } from "@/lib/storage";
import { gymAI } from "@/lib/ai";
import { HealthService, type HealthStats } from "@/lib/health";
import { NotificationService } from "@/lib/notifications";
import { getRandomTip } from "@/lib/knowledge-base";
import { LooksMaxxingWidget } from "@/components/features/looks/LooksMaxxingWidget";
import { StatusScanner } from "@/components/features/dashboard/StatusScanner";
import { HealthStatsGrid } from "@/components/features/dashboard/HealthStatsGrid";
import { StatsRadar } from "@/components/features/dashboard/StatsRadar";

function getRankTitle(rankScore: number) {
  if (rankScore >= 90) return 'S';
  if (rankScore >= 75) return 'A';
  if (rankScore >= 60) return 'B';
  if (rankScore >= 45) return 'C';
  if (rankScore >= 30) return 'D';
  return 'E';
}

function getRankColor(rank: string) {
    if (rank === 'S') return 'text-[var(--rank-s)]';
    if (rank === 'A') return 'text-[var(--rank-a)]';
    if (rank === 'B') return 'text-[var(--rank-b)]';
    if (rank === 'C') return 'text-[var(--rank-c)]';
    if (rank === 'D') return 'text-[var(--rank-d)]';
    return 'text-[var(--rank-e)]';
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sideQuest, setSideQuest] = useState<Quest | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [systemMessage, setSystemMessage] = useState<{ text: string, type: 'vitality' | 'toxicity' | 'info' | 'neutral' } | null>(null);

  useEffect(() => {
    const userProfile = Storage.getProfile();
    if (!userProfile) {
      router.push("/profile");
      return;
    }
    setProfile(userProfile);

    const initHealth = async () => {
        await HealthService.requestPermissions();
        const stats = await HealthService.getTodayStats();
        setHealthStats(stats);
    };
    initHealth();
    
    NotificationService.requestPermissions().then(() => {
        NotificationService.scheduleDailyReminder();
    });

    setLoading(false);

    const currentDaily = Storage.getDailyQuest();
    if (!currentDaily || currentDaily.type !== 'PENALTY') {
         if (Math.random() < 0.2) {
             const newSideQuest = gymAI.generateSideQuest();
             setSideQuest(newSideQuest);
         }
    }

    if (Math.random() < 0.3) {
        setSystemMessage({
            text: `SYSTEM TIP: ${getRandomTip()}`,
            type: 'info'
        });
        setTimeout(() => setSystemMessage(null), 6000);
    }
  }, [router]);

  const acceptSideQuest = () => {
      if (sideQuest) {
          Storage.addSideQuest(sideQuest);
          setSideQuest(null);
          setSystemMessage({ text: "SIDE QUEST ACCEPTED. CHECK LOG.", type: 'info' });
          setTimeout(() => setSystemMessage(null), 3000);
      }
  };

  if (loading || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black italic animate-pulse">SYNCHRONIZING SYSTEM...</div>;

  const currentRankTitle = getRankTitle(profile.currentRank);
  const rankColor = getRankColor(currentRankTitle);

  return (
    <main className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24 overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.05)_0%,_transparent_50%)] pointer-events-none" />

      {/* System Alerts */}
      <AnimatePresence>
        {systemMessage && (
            <motion.div 
                initial={{ opacity: 0, y: -50 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-[calc(env(safe-area-inset-top)+1.5rem)] left-4 right-4 z-[60] p-4 rounded-lg border backdrop-blur-md shadow-2xl ${
                    systemMessage.type === 'vitality' ? 'bg-green-500/10 border-green-500 text-green-400' :
                    systemMessage.type === 'toxicity' ? 'bg-red-500/10 border-red-500 text-red-500 font-bold' :
                    'bg-blue-500/10 border-blue-500 text-blue-400'
                }`}
            >
                <div className="flex items-center gap-3">
                    {systemMessage.type === 'vitality' && <Zap className="w-6 h-6 animate-pulse" />}
                    {systemMessage.type === 'toxicity' && <Flame className="w-6 h-6 animate-pulse" />}
                    {systemMessage.type === 'info' && <MessageSquare className="w-6 h-6" />}
                    <p className="text-sm font-mono tracking-wide uppercase">{systemMessage.text}</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-2">
        <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-zinc-100">Status Window</h1>
            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Player: {profile.name}</p>
        </div>
        <HunterButton size="icon" variant="ghost" className="rounded-full text-zinc-400" onClick={() => router.push('/profile')}>
            <UserIcon className="w-5 h-5" />
        </HunterButton>
      </header>

      {/* Main Orb Area */}
      <section className="flex flex-col items-center justify-center py-12 relative">
        <div className="absolute top-0 right-10 text-[10px] text-zinc-600 font-mono font-bold tracking-widest uppercase">
            XP: {Math.floor(profile.currentRank * 100)} / 10000
        </div>
        
        <RankOrb rank={currentRankTitle} progress={profile.currentRank} size={240} />
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
        >
            <h2 className={`text-5xl font-black ${rankColor} text-glow italic tracking-tighter uppercase leading-none`}>
                {profile.experience} Class
            </h2>
        </motion.div>
      </section>

      {/* Action Zone */}
      <div className="space-y-8 relative z-10">
        <StatusScanner onScanResult={setSystemMessage} />
        
        <div className="relative">
          <StatsRadar stats={profile.stats} />
          <HealthStatsGrid initialStats={healthStats} />
        </div>

        <LooksMaxxingWidget />

        {/* Side Quest Alert */}
        <AnimatePresence>
            {sideQuest && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8">
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-amber-500 mb-3">
                                <Zap className="w-5 h-5 fill-amber-500" />
                                <span className="text-xs font-black italic uppercase tracking-widest">Secret Mission Discovery</span>
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-white">{sideQuest.tasks[0].name}</h3>
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed italic">{sideQuest.reward}</p>
                            <div className="flex gap-3">
                                <HunterButton 
                                  className="flex-1 h-12 bg-amber-500 text-black border-none"
                                  onClick={acceptSideQuest}
                                >
                                  Accept Quest
                                </HunterButton>
                                <HunterButton 
                                  variant="ghost" 
                                  className="flex-1 h-12 border border-zinc-800 text-zinc-500"
                                  onClick={() => setSideQuest(null)}
                                >
                                  Decline
                                </HunterButton>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Nav Bridge */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-50">
          <nav className="max-w-md mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl flex justify-around shadow-2xl shadow-primary/10">
              <HunterButton variant="ghost" className="flex-1 gap-2 text-primary" onClick={() => router.push('/')}>
                  <Activity className="w-5 h-5" />
                  <span className="text-[10px]">STATUS</span>
              </HunterButton>
              <HunterButton variant="ghost" className="flex-1 gap-2 text-zinc-500" onClick={() => router.push('/log')}>
                  <Dumbbell className="w-5 h-5" />
                  <span className="text-[10px]">QUESTS</span>
              </HunterButton>
              <HunterButton variant="ghost" className="flex-1 gap-2 text-zinc-500" onClick={() => router.push('/looks')}>
                  <ScanFace className="w-5 h-5" />
                  <span className="text-[10px]">ANALYSIS</span>
              </HunterButton>
          </nav>
      </footer>
    </main>
  );
}
