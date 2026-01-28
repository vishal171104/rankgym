"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, MessageSquare, Dumbbell, User as UserIcon, Zap } from "lucide-react";
import { RankOrb } from "@/components/rank-orb";
import { ProgressChart } from "@/components/progress-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Storage, type Profile, type DailyLog, type Quest } from "@/lib/storage";
import { gymAI } from "@/lib/ai";

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
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sideQuest, setSideQuest] = useState<Quest | null>(null);

  useEffect(() => {
    // Check for profile immediately
    const userProfile = Storage.getProfile();
    if (!userProfile) {
      router.push("/profile");
      return;
    }
    setProfile(userProfile);
    setLogs(Storage.getLogs());
    setLoading(false);

    // Random Side Quest Trigger (10% chance on load, or can be a timeout)
    const currentQuest = Storage.getCurrentQuest();
    // Only trigger fit NO active side quest and current main quest isn't penalty
    if (!currentQuest || currentQuest.type !== 'PENALTY') {
         if (Math.random() < 0.2) { // 20% chance on dashboard load
             const newSideQuest = gymAI.generateSideQuest();
             setSideQuest(newSideQuest);
         }
    }

  }, [router]);

  const acceptSideQuest = () => {
      if (sideQuest) {
          Storage.saveQuest(sideQuest);
          router.push('/log');
      }
  };

  if (loading || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-primary animate-pulse">SYSTEM LOADING...</div>;

  const currentRankTitle = getRankTitle(profile.currentRank);
  const rankColor = getRankColor(currentRankTitle);
  // Calculate progress to next rank (simplified)
  // E.g. if rank is 45 (C), and B starts at 60. Progress is (45-30)/(60-30). 
  // For simplicity, we just use the raw 0-100 score as the fill for now, 
  // or modulo logic if we want "levels" within ranks. 
  // Let's just use the raw score relative to 100 for the visual orb for now.
  
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0f] to-black text-white p-4 pb-20">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-2">
        <div>
            <h1 className="text-xl font-bold tracking-wider">STATUS WINDOW</h1>
            <p className="text-xs text-zinc-500">PLAYER: {profile.name?.toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
             <Button size="icon" variant="ghost" className="rounded-full text-zinc-400" onClick={() => router.push('/profile')}>
                <UserIcon />
            </Button>
        </div>
      </header>

      {/* Main Orb Area */}
      <section className="flex flex-col items-center justify-center py-8 relative">
        <div className="absolute top-0 right-10 text-xs text-zinc-500 font-mono">
            XP: {Math.floor(profile.currentRank * 100)} / 10000
        </div>
        
        <RankOrb rank={currentRankTitle} progress={profile.currentRank} size={280} />
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center space-y-1"
        >
            <h2 className={`text-4xl font-black ${rankColor} text-glow tracking-tighter`}>
                {profile.experience.toUpperCase()} CLASS
            </h2>
            <p className="text-zinc-500 text-sm">Keep grinding to reach the next tier.</p>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 my-8">
        <Card className="glass-card border-none bg-zinc-900/40">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-zinc-400 text-xs uppercase">Recent Volume</span>
                <span className="text-2xl font-bold text-white mt-1">
                    {logs.length > 0 ? logs[logs.length-1].volume + 'kg' : '-'}
                </span>
            </CardContent>
        </Card>
        <Card className="glass-card border-none bg-zinc-900/40">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className="text-zinc-400 text-xs uppercase">Streak</span>
                <div className="flex items-center gap-1 mt-1">
                     <span className="text-2xl font-bold text-orange-500">
                         {logs.length > 0 ? '3' : '0'} {/* Mock streak for v1 */}
                     </span>
                     <span className="text-orange-500 text-xs">🔥</span>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        <Card 
            className="glass-card border-l-4 border-l-primary cursor-pointer hover:bg-zinc-900/60 transition-colors group"
            onClick={() => router.push('/log')}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                     <CardTitle className="text-lg text-white group-hover:text-primary transition-colors">Daily Quest</CardTitle>
                     <CardDescription>Log today's workout to gain XP</CardDescription>
                </div>
                <Button size="icon" className="group-hover:translate-x-1 transition-transform bg-primary/20 text-primary hover:bg-primary hover:text-white">
                    <Activity className="w-5 h-5" />
                </Button>
            </CardHeader>
        </Card>

        {/* Timeline Chart */}
        <Card className="glass-card border-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-zinc-500">Physique Growth</CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                <ProgressChart data={logs} />
            </CardContent>
        </Card>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center justify-around z-50">
           <Button variant="ghost" className="flex flex-col items-center gap-1 h-full w-full rounded-none hover:bg-white/5" onClick={() => router.push('/')}>
                <Dumbbell className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary">Status</span>
           </Button>
           <Button variant="ghost" className="flex flex-col items-center gap-1 h-full w-full rounded-none hover:bg-white/5" onClick={() => router.push('/chat')}>
                <MessageSquare className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">Coach</span>
           </Button>
           <Button variant="ghost" className="flex flex-col items-center gap-1 h-full w-full rounded-none hover:bg-white/5" onClick={() => router.push('/log')}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg shadow-primary/40">
                    <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">Log</span>
           </Button>
      </nav>

      {/* Side Quest Modal */}
      <AnimatePresence>
        {sideQuest && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                     <Card className="bg-zinc-900 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                        <CardHeader className="text-center pb-2">
                             <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                                <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
                             </div>
                             <CardTitle className="text-xl text-blue-400">SUDDEN QUEST</CardTitle>
                             <CardDescription>A random event has occurred!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <div className="p-4 bg-black/40 rounded-lg border border-blue-500/20">
                                <h3 className="text-lg font-bold text-white mb-1">{sideQuest.tasks[0].name}</h3>
                                <p className="text-2xl font-black text-blue-400">{sideQuest.tasks[0].target} {sideQuest.tasks[0].unit}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button className="flex-1 bg-zinc-800 hover:bg-zinc-700" onClick={() => setSideQuest(null)}>Ignore</Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={acceptSideQuest}>Accept</Button>
                            </div>
                        </CardContent> 
                     </Card>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
