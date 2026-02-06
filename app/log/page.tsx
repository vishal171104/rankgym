"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Skull, Trophy, AlertTriangle, Sparkles, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Storage, type DailyLog, type Profile, type Quest, type QuestTask } from "@/lib/storage";
import { gymAI } from "@/lib/ai";
import { cn } from "@/lib/utils";

export default function QuestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyQuest, setDailyQuest] = useState<Quest | null>(null);
  const [sideQuests, setSideQuests] = useState<Quest[]>([]);
  const [showReward, setShowReward] = useState<{quest: Quest, active: boolean} | null>(null);
  const [showPenalty, setShowPenalty] = useState(false);
  const [stagedDaily, setStagedDaily] = useState<number[]>([]);
  const [stagedSides, setStagedSides] = useState<string[]>([]);
  const [activeRepInput, setActiveRepInput] = useState<{index: number, value: string} | null>(null);

  useEffect(() => {
    const loadQuests = async () => {
        const profile = Storage.getProfile();
        if (!profile) {
            router.push('/profile');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        
        // 1. Load Daily Quest
        let currentDaily = Storage.getDailyQuest();
        if (!currentDaily || currentDaily.date !== today) {
             const logs = Storage.getLogs();
             currentDaily = gymAI.generateDailyQuest(profile, logs);
             Storage.saveDailyQuest(currentDaily);
        }
        setDailyQuest(currentDaily);

        // 2. Load Side Quests
        const currentSides = Storage.getSideQuests();
        setSideQuests(currentSides);

        setLoading(false);
    };
    loadQuests();
  }, [router]);

  const toggleStagedDaily = (index: number) => {
      const task = dailyQuest?.tasks[index];
      if (task && task.unit === 'reps' && (task.current || 0) < task.target) {
          // If not done yet, open the input instead of toggling box
          setActiveRepInput({ index, value: "" });
          return;
      }
      setStagedDaily(prev => 
          prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
  };

  const addRepsToTask = (index: number) => {
      if (!dailyQuest || !activeRepInput) return;
      const amount = parseInt(activeRepInput.value) || 0;
      const newTasks = [...dailyQuest.tasks];
      const task = newTasks[index];
      
      const newCurrent = (task.current || 0) + amount;
      task.current = newCurrent;
      
      if (newCurrent >= task.target) {
          task.completed = true;
          setStagedDaily(prev => prev.filter(i => i !== index));
      }

      const updated = { ...dailyQuest, tasks: newTasks };
      setDailyQuest(updated);
      Storage.saveDailyQuest(updated);
      setActiveRepInput(null);
  };

  const toggleStagedSide = (questId: string) => {
      setStagedSides(prev => 
          prev.includes(questId) ? prev.filter(id => id !== questId) : [...prev, questId]
      );
  };

  const confirmDailyTask = (index: number) => {
      if (!dailyQuest) return;
      const newTasks = [...dailyQuest.tasks];
      newTasks[index].completed = true; // Permanent lock
      const updated = { ...dailyQuest, tasks: newTasks };
      setDailyQuest(updated);
      Storage.saveDailyQuest(updated);
      setStagedDaily(prev => prev.filter(i => i !== index));
  };

  const confirmSideTask = (questId: string, taskIndex: number) => {
      const newSides = sideQuests.map(q => {
          if (q.id === questId) {
              const newTasks = [...q.tasks];
              newTasks[taskIndex].completed = true; // Permanent lock
              return { ...q, tasks: newTasks };
          }
          return q;
      });
      setSideQuests(newSides);
      Storage.saveSideQuests(newSides);
      setStagedSides(prev => prev.filter(id => id !== questId));
  };

  const completeQuest = async (quest: Quest) => {
      // Save to logs
      const totalRepVolume = quest.tasks.reduce((acc, t) => acc + (t.unit === 'reps' ? t.target : 0), 0);
      const newLog: DailyLog = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          workoutType: `${quest.type} Quest Completion`,
          volume: totalRepVolume,
          soreness: 3,
          sleep: 7,
          stress: 3,
          xpGained: quest.xpReward
      };
      Storage.addLog(newLog);

      // Update Profile
      const profile = Storage.getProfile();
      if (profile) {
          let newRank = profile.currentRank + (quest.xpReward / 100);
          if (newRank > 100) newRank = 100;
          const newStats = { ...profile.stats };
          if (quest.statReward) {
              Object.entries(quest.statReward).forEach(([key, val]) => {
                  (newStats as any)[key] = ((newStats as any)[key] || 10) + val;
              });
          }
          Storage.saveProfile({ ...profile, currentRank: newRank, stats: newStats });
      }

      // Mark Completed
      const completed: Quest = { ...quest, status: 'completed' };
      if (quest.type === 'DAILY' || quest.type === 'PENALTY') {
          setDailyQuest(completed);
          Storage.saveDailyQuest(completed);
      } else {
          const updatedSides = sideQuests.map(q => q.id === quest.id ? completed : q);
          setSideQuests(updatedSides);
          Storage.saveSideQuests(updatedSides);
      }

      setShowReward({ quest, active: true });
      await gymAI.train();
  };

  const triggerPenalty = () => {
      const penalty = gymAI.generatePenaltyQuest();
      Storage.saveDailyQuest(penalty);
      setDailyQuest(penalty);
      setShowPenalty(true);
  };

  if (loading || !dailyQuest) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono animate-pulse">RECAPTURING SYSTEM STATE...</div>;

  const isPenalty = dailyQuest.type === 'PENALTY';

  return (
    <div className={cn("min-h-screen p-4 pb-20 pt-[calc(env(safe-area-inset-top)+1rem)] text-white transition-colors duration-500", isPenalty ? "bg-red-950/20" : "bg-black")}>
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-black" />
        
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full bg-zinc-900/50">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2 text-primary">
                        QUEST LOG
                    </h1>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Hunter Status: Normal</p>
                </div>
            </div>
        </header>

        <div className="relative z-10 space-y-12">
            {/* 1. DAILY QUEST SECTION */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Target className={cn("w-4 h-4", isPenalty ? "text-red-500" : "text-primary")} />
                    <h2 className={cn("text-xs font-bold uppercase tracking-widest", isPenalty ? "text-red-500" : "text-zinc-400")}>
                        {isPenalty ? "MANDATORY PENALTY" : "DAILY SYSTEM REQUIREMENT"}
                    </h2>
                </div>

                <Card className={cn(
                    "border-l-4 transition-all duration-500 shadow-2xl", 
                    isPenalty ? "bg-red-900/10 border-red-600 shadow-red-900/20" : "bg-zinc-900/40 border-primary shadow-primary/5"
                )}>
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl font-bold italic tracking-tight">
                                    {isPenalty ? "SURVIVAL QUEST" : "DAILY LEVELING"}
                                </CardTitle>
                                <CardDescription className="text-zinc-500">
                                    {isPenalty ? "Failure is not an option." : "Complete these to maintain your hunter rank."}
                                </CardDescription>
                            </div>
                            <div className={cn("px-3 py-1 rounded text-xs font-black", isPenalty ? "bg-red-600 text-white" : "bg-primary/20 text-primary border border-primary/30")}>
                                {dailyQuest.difficulty}-RANK
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {dailyQuest.tasks.map((task, idx) => {
                            const isStaged = stagedDaily.includes(idx);
                            const isNumeric = task.unit === 'reps';
                            const remaining = Math.max(0, task.target - (task.current || 0));
                            const isInputActive = activeRepInput?.index === idx;

                            return (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "flex flex-col p-4 rounded-xl border transition-all relative overflow-hidden",
                                        task.completed 
                                            ? "bg-primary/10 border-primary/50 text-white" 
                                            : isStaged 
                                                ? "bg-primary/5 border-primary/30 text-white"
                                                : "bg-black/40 border-zinc-800 text-zinc-400",
                                        dailyQuest.status !== 'pending' && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div 
                                            className="flex flex-1 items-center gap-3 cursor-pointer"
                                            onClick={() => {
                                                if (task.completed || dailyQuest.status !== 'pending') return;
                                                if (isNumeric && remaining > 0) {
                                                    setActiveRepInput({ index: idx, value: "" });
                                                } else {
                                                    toggleStagedDaily(idx);
                                                }
                                            }}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                task.completed ? "border-primary bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" : 
                                                isStaged ? "border-primary/50 bg-primary/20" : "border-zinc-700 bg-black/20"
                                            )}>
                                                {(task.completed || isStaged) && <CheckCircle2 className={cn("w-4 h-4", task.completed ? "text-black" : "text-primary")} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("font-medium", task.completed && "line-through text-zinc-500")}>
                                                    {task.name}
                                                </span>
                                                {isNumeric && !task.completed && (
                                                    <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">
                                                        {task.current || 0} / {task.target} LOGGED
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-mono font-bold">{remaining}</span>
                                                <span className="text-[8px] text-zinc-600 font-normal uppercase">{task.unit} left</span>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isInputActive && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: "auto", opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-zinc-500 uppercase font-black">Add Reps Performed</span>
                                                    <Button 
                                                        variant="ghost" size="icon" className="h-4 w-4 text-zinc-600"
                                                        onClick={(e) => { e.stopPropagation(); setActiveRepInput(null); }}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        autoFocus
                                                        type="number"
                                                        inputMode="numeric"
                                                        placeholder="0"
                                                        value={activeRepInput.value}
                                                        onChange={(e) => setActiveRepInput({ ...activeRepInput, value: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && addRepsToTask(idx)}
                                                        className="bg-black/40 border-primary/20 text-white text-lg font-mono text-center h-12"
                                                    />
                                                    <Button 
                                                        className="bg-primary text-black font-black italic px-8 h-12"
                                                        onClick={() => addRepsToTask(idx)}
                                                    >
                                                        OK
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {isStaged && !task.completed && (
                                        <Button 
                                            size="sm" 
                                            className="w-full mt-3 bg-primary text-black font-black italic tracking-tighter h-8"
                                            onClick={() => confirmDailyTask(idx)}
                                        >
                                            DONE
                                        </Button>
                                    )}

                                    {task.completed && (
                                        <div className="text-[9px] text-zinc-600 uppercase italic font-bold tracking-widest mt-2 ml-9">
                                            Log Verified
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-zinc-800/50">
                            <div className="flex gap-2">
                                {Object.entries(dailyQuest.statReward || {}).map(([key, val]) => (
                                    <span key={key} className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                                        {key} +{val}
                                    </span>
                                ))}
                            </div>
                            {dailyQuest.status === 'pending' && (
                                <Button 
                                    size="sm"
                                    className={cn(
                                        "h-10 px-6 font-black italic tracking-tighter transition-all",
                                        dailyQuest.tasks.every(t => t.completed)
                                            ? "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                                            : "bg-zinc-800 text-zinc-500 opacity-50"
                                    )}
                                    disabled={!dailyQuest.tasks.every(t => t.completed)}
                                    onClick={() => completeQuest(dailyQuest)}
                                >
                                    COMPLETE
                                </Button>
                            )}
                            {dailyQuest.status === 'completed' && (
                                <div className="flex items-center gap-2 text-green-500 text-xs font-bold italic">
                                    <CheckCircle2 className="w-4 h-4" /> SUCCESS
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {dailyQuest.status === 'pending' && !isPenalty && (
                    <button 
                        onClick={triggerPenalty}
                        className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-zinc-700 hover:text-red-900 transition-colors py-2"
                    >
                        [ ABANDON MISSION ]
                    </button>
                )}
            </section>

            {/* 2. SIDE QUESTS SECTION */}
            {(sideQuests.length > 0 || true) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">SIDE QUESTS / SECRET MISSIONS</h2>
                    </div>

                    {sideQuests.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-zinc-900 rounded-3xl text-center">
                            <p className="text-zinc-700 text-xs italic">No active side missions. Return to dashboard to scout for opportunities.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sideQuests.map((sq) => (
                                <Card key={sq.id} className={cn(
                                    "bg-zinc-900/20 border-zinc-800/50 overflow-hidden relative group transition-all",
                                    sq.status === 'completed' && "opacity-60"
                                )}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-sm font-black italic uppercase tracking-tighter text-amber-500">
                                                    {sq.tasks[0].name}
                                                </h3>
                                                <p className="text-[10px] text-zinc-500">{sq.reward}</p>
                                            </div>
                                            <div className="text-[10px] font-bold text-zinc-600 bg-zinc-800/40 px-2 py-0.5 rounded ring-1 ring-zinc-700/50">
                                                {sq.difficulty}-RANK
                                            </div>
                                        </div>

                                        <div 
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                                sq.tasks[0].completed 
                                                    ? "bg-amber-500/10 border-amber-500/50 text-white" 
                                                    : stagedSides.includes(sq.id)
                                                        ? "bg-amber-500/5 border-amber-500/30 text-white"
                                                        : "bg-black/40 border-zinc-800 text-zinc-500"
                                            )}
                                            onClick={() => !sq.tasks[0].completed && sq.status === 'pending' && toggleStagedSide(sq.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                    sq.tasks[0].completed ? "border-amber-500 bg-amber-500" : 
                                                    stagedSides.includes(sq.id) ? "border-amber-500/50 bg-amber-500/20" : "border-zinc-700 bg-black/20"
                                                )}>
                                                    {(sq.tasks[0].completed || stagedSides.includes(sq.id)) && <CheckCircle2 className={cn("w-2 h-2", sq.tasks[0].completed ? "text-black" : "text-amber-500")} />}
                                                </div>
                                                <span className="text-xs font-bold">{sq.tasks[0].target} {sq.tasks[0].unit}</span>
                                            </div>
                                        </div>

                                        {stagedSides.includes(sq.id) && !sq.tasks[0].completed && sq.status === 'pending' && (
                                            <Button 
                                                size="sm"
                                                className="w-full mt-3 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase h-8"
                                                onClick={() => confirmSideTask(sq.id, 0)}
                                            >
                                                DONE
                                            </Button>
                                        )}

                                        {sq.status === 'pending' && (
                                            <Button 
                                                className={cn(
                                                    "w-full mt-4 h-8 text-[10px] font-black uppercase tracking-widest transition-all",
                                                    sq.tasks.every(t => t.completed) 
                                                        ? "bg-amber-600 hover:bg-amber-500 text-white" 
                                                        : "bg-zinc-800 text-zinc-600 opacity-50"
                                                )}
                                                disabled={!sq.tasks.every(t => t.completed)}
                                                onClick={() => completeQuest(sq)}
                                            >
                                                CLAIM REWARD
                                            </Button>
                                        )}
                                        {sq.status === 'completed' && (
                                            <div className="mt-4 text-center text-[10px] font-bold text-zinc-700 uppercase italic">
                                                MISSION ACCOMPLISHED
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>

        {/* Reward Modal */}
        <AnimatePresence>
            {showReward?.active && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-sm"
                    >
                         <Card className="bg-zinc-950 border-primary/50 shadow-[0_0_100px_rgba(139,92,246,0.2)] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                            <CardHeader className="text-center pt-8">
                                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                                <CardTitle className="text-2xl font-black italic tracking-tighter text-primary text-glow">QUEST CLEAR</CardTitle>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{showReward.quest.type} MISSION COMPLETE</p>
                            </CardHeader>
                            <CardContent className="space-y-6 text-center pb-8 p-8">
                                <div className="space-y-1">
                                    <p className="text-zinc-600 uppercase text-[9px] font-black tracking-widest">Reward Received</p>
                                    <p className="text-lg font-bold text-white italic">
                                        {showReward.quest.reward}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                        <p className="text-zinc-600 text-[9px] font-black uppercase mb-1">XP Gained</p>
                                        <p className="text-xl font-black text-primary">+{showReward.quest.xpReward}</p>
                                     </div>
                                     <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                        <p className="text-zinc-600 text-[9px] font-black uppercase mb-1">Status</p>
                                        <p className="text-xl font-black text-green-500">LEVEL UP</p>
                                     </div>
                                </div>
                                <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold" onClick={() => { setShowReward(null); }}>
                                    CLOSE SYSTEM
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/95 backdrop-blur-2xl"
                >
                    <motion.div 
                        initial={{ scale: 0.8 }} animate={{ scale: 1, x: [0, 10, -10, 10, -10, 0] }}
                        className="w-full max-w-sm text-center"
                    >
                        <Skull className="w-20 h-20 text-red-600 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
                        <h2 className="text-3xl font-black text-red-600 italic tracking-tighter mb-2 italic">PENALTY ZONE</h2>
                        <p className="text-red-200/60 text-sm mb-8 px-6">
                            You failed to meet the daily system requirements. <br/>
                            Leveling halted. Defense mode activated.
                        </p>
                        <Button variant="destructive" className="w-full h-14 text-lg font-black rounded-2xl italic tracking-tighter shadow-2xl shadow-red-900/40" onClick={() => setShowPenalty(false)}>
                            ACCEPT FATE
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
