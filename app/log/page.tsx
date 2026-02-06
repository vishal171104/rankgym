"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Skull, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Storage, type DailyLog, type Profile, type Quest, type QuestTask } from "@/lib/storage";
import { gymAI } from "@/lib/ai";
import { cn } from "@/lib/utils";

export default function QuestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showPenalty, setShowPenalty] = useState(false);

  useEffect(() => {
    // Load or Generate Quest
    const loadQuest = async () => {
        const profile = Storage.getProfile();
        if (!profile) {
            router.push('/profile');
            return;
        }

        let currentQuest = Storage.getCurrentQuest();
        const today = new Date().toISOString().split('T')[0];

        // If no quest or quest is from old date (and not completed/failed), generate new
        // Ideally if old pending quest exists, it should be marked failed? 
        // For simple flow: if date mismatch, generate new.
        if (!currentQuest || currentQuest.date !== today) {
             const logs = Storage.getLogs();
             currentQuest = gymAI.generateDailyQuest(profile, logs);
             Storage.saveQuest(currentQuest);
        }

        setQuest(currentQuest);
        setLoading(false);
    };
    loadQuest();
  }, [router]);

  const toggleTask = (index: number) => {
      if (!quest) return;
      
      const newTasks = [...quest.tasks];
      newTasks[index].completed = !newTasks[index].completed;
      
      const updatedQuest = { ...quest, tasks: newTasks };
      setQuest(updatedQuest);
      Storage.saveQuest(updatedQuest);
  };

  const completeQuest = async () => {
      if (!quest) return;
      
      // Save to logs for history
      const totalRepVolume = quest.tasks.reduce((acc, t) => acc + (t.unit === 'reps' ? t.target : 0), 0); // Simplified volume
      
      const newLog: DailyLog = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          workoutType: "Daily Quest Completion",
          volume: totalRepVolume,
          soreness: 3, // Default average
          sleep: 7,
          stress: 3,
          xpGained: quest.xpReward
      };
      Storage.addLog(newLog);

      // Update Profile Rank & Stats
      const profile = Storage.getProfile();
      if (profile) {
          let newRank = profile.currentRank + (quest.xpReward / 100);
          if (newRank > 100) newRank = 100;
          
          const newStats = { ...profile.stats };
          if (quest.statReward) {
              if (quest.statReward.str) newStats.str = (newStats.str || 10) + quest.statReward.str;
              if (quest.statReward.agi) newStats.agi = (newStats.agi || 10) + quest.statReward.agi;
              if (quest.statReward.vit) newStats.vit = (newStats.vit || 10) + quest.statReward.vit;
              if (quest.statReward.per) newStats.per = (newStats.per || 10) + quest.statReward.per;
          }

          Storage.saveProfile({ 
              ...profile, 
              currentRank: newRank,
              stats: newStats
          });
      }

      // Mark Quest Completed
      const completedQuest: Quest = { ...quest, status: 'completed' };
      Storage.saveQuest(completedQuest);
      setQuest(completedQuest);

      // Show Reward
      setShowReward(true);
      
      // Train AI
      await gymAI.train();
  };

  const triggerPenalty = () => {
      // Switch to Penalty Quest
      const penalty = gymAI.generatePenaltyQuest();
      Storage.saveQuest(penalty);
      setQuest(penalty);
      setShowPenalty(true);
  };

  if (loading || !quest) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">LOADING SYSTEM...</div>;

  const allCompleted = quest.tasks.every(t => t.completed);
  const isPenalty = quest.type === 'PENALTY';

  return (
    <div className={cn("min-h-screen p-4 pb-20 pt-[calc(env(safe-area-inset-top)+1rem)] text-white transition-colors duration-500", isPenalty ? "bg-red-950/20" : "bg-black")}>
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-black" />
        
        {/* Header */}
        <header className="relative z-10 flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className={cn("text-2xl font-black italic tracking-tighter flex items-center gap-2", isPenalty ? "text-red-600" : "text-primary")}>
                    {isPenalty ? "PENALTY QUEST" : "DAILY QUEST"}
                    {isPenalty && <Skull className="w-6 h-6 animate-pulse" />}
                </h1>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">
                    Difficulty: <span className={cn("font-bold", isPenalty ? "text-red-500" : "text-white")}>{quest.difficulty}-RANK</span>
                </p>
            </div>
        </header>

        {/* Quest Card */}
        <div className="relative z-10 space-y-6">
            <Card className={cn("border-l-4 transition-colors", isPenalty ? "bg-red-900/10 border-red-600" : "bg-zinc-900/50 border-primary")}>
                <CardHeader>
                    <CardTitle className="text-lg">Objective</CardTitle>
                    <CardDescription>Complete all checking to receive rewards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {quest.tasks.map((task, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => quest.status === 'pending' && toggleTask(idx)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                                task.completed 
                                    ? "bg-primary/20 border-primary text-white" 
                                    : "bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-600",
                                quest.status !== 'pending' && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className={cn("font-medium", task.completed && "line-through")}>
                                {task.name}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-mono">{task.target} {task.unit}</span>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    task.completed ? "border-primary bg-primary" : "border-zinc-600"
                                )}>
                                    {task.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
                                </div>
                            </div>
                        </div>
                    ))}

                    {quest.statReward && (
                        <div className="flex gap-2 justify-center pt-2">
                             {Object.entries(quest.statReward).map(([key, val]) => (
                                 <div key={key} className="bg-zinc-800 px-3 py-1 rounded text-xs uppercase text-zinc-400 border border-zinc-700">
                                     {key} +{val}
                                 </div>
                             ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            {quest.status === 'pending' && (
                <div className="space-y-3">
                    <Button 
                        className={cn(
                            "w-full h-14 text-lg font-bold tracking-wider transition-all",
                            allCompleted 
                                ? "bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(139,92,246,0.5)] animate-pulse" 
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        )}
                        disabled={!allCompleted}
                        onClick={completeQuest}
                    >
                        {allCompleted ? "COMPLETE QUEST" : "INCOMPLETE"}
                    </Button>

                    {!isPenalty && (
                         <Button 
                            variant="ghost" 
                            className="w-full text-zinc-600 hover:text-red-500 hover:bg-red-950/10"
                            onClick={triggerPenalty}
                        >
                            Give Up (Accept Penalty)
                        </Button>
                    )}
                </div>
            )}

            {quest.status === 'completed' && (
                <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-center">
                    <h3 className="text-green-500 font-bold mb-1">QUEST COMPLETED</h3>
                    <p className="text-green-400/80 text-sm">Rewards have been distributed.</p>
                </div>
            )}
        </div>

        {/* Reward Modal Overlay */}
        <AnimatePresence>
            {showReward && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-sm"
                    >
                         <Card className="bg-zinc-900 border-primary shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                            <CardHeader className="text-center">
                                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <CardTitle className="text-2xl text-primary text-glow">QUEST CLEAR</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 text-center">
                                <div className="space-y-2">
                                    <p className="text-zinc-400 uppercase text-xs">Reward</p>
                                    <p className="text-xl font-bold text-white leading-tight">
                                        {quest.reward}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="p-3 bg-black/50 rounded-lg">
                                        <p className="text-zinc-500 text-xs">XP Gained</p>
                                        <p className="text-xl font-bold text-primary">+{quest.xpReward}</p>
                                     </div>
                                     <div className="p-3 bg-black/50 rounded-lg">
                                        <p className="text-zinc-500 text-xs">Status</p>
                                        <p className="text-xl font-bold text-green-500">Recovered</p>
                                     </div>
                                </div>
                                <Button className="w-full" onClick={() => { setShowReward(false); router.push('/'); }}>
                                    Close
                                </Button>
                            </CardContent>
                         </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

         {/* Penalty Warning Overlay */}
         <AnimatePresence>
            {showPenalty && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md"
                    onClick={() => setShowPenalty(false)} 
                >
                    <motion.div 
                        initial={{ scale: 0.9 }} animate={{ scale: 1, x: [0, 10, -10, 0] }}
                        className="w-full max-w-sm text-center"
                    >
                        <Skull className="w-24 h-24 text-red-600 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-4xl font-black text-red-600 mb-2">PENALTY ZONE</h2>
                        <p className="text-red-200 mb-8">
                            You failed to complete the daily quest. <br/>
                            Survival protocol initiated.
                        </p>
                        <Button variant="destructive" className="w-full h-12 text-lg" onClick={() => setShowPenalty(false)}>
                            ACCEPT FATE
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
