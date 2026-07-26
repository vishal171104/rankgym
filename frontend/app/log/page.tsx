"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Skull, Trophy, AlertTriangle, Sparkles, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Storage, type DailyLog, type Profile, type Quest, type QuestTask } from "@/lib/storage";
import { gymAI } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { HunterButton } from "@/components/shared/hunter-button";
import { HunterHeader } from "@/components/shared/hunter-header";
import { DailyQuestCard } from "@/components/features/quest/DailyQuestCard";
import { SideQuestList } from "@/components/features/quest/SideQuestList";

import { sound } from "@/lib/sound";

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
      sound.playQuestComplete();
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

      const profile = Storage.getProfile();
      if (profile) {
          let newRank = profile.currentRank + (quest.xpReward / 100);
          const newStats = { ...profile.stats };
          if (quest.statReward) {
              Object.entries(quest.statReward).forEach(([key, val]) => {
                  (newStats as any)[key] = ((newStats as any)[key] || 10) + val;
              });
          }
          Storage.saveProfile({ ...profile, currentRank: newRank, stats: newStats });
      }

      const completed: Quest = { ...quest, status: 'completed' };
      if (quest.type === 'DAILY' || quest.type === 'PENALTY') {
          setDailyQuest(completed);
          Storage.saveDailyQuest(completed);
      } else {
          const updatedSides = sideQuests.map(q => q.id === quest.id ? completed : q);
          setSideQuests(updatedSides);
          Storage.saveSideQuests(updatedSides);
      }

      if (quest.type === 'PENALTY') {
          setDailyQuest(null);
          Storage.saveDailyQuest(null);
          setShowPenalty(false);
          router.replace('/');
      } else {
          setShowReward({ quest, active: true });
      }
  };

  const triggerPenalty = () => {
      const profile = Storage.getProfile();
      if (!profile) return;
      const penalty = gymAI.generatePenaltyQuest();
      setDailyQuest(penalty);
      Storage.saveDailyQuest(penalty);
      setShowPenalty(true);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse">ACCESSING QUEST LOG...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-24 relative">
        <HunterHeader title="Quest Log" onBack={() => router.replace('/')} />

        <div className="space-y-8">
            {/* 1. DAILY QUEST SECTION */}
            {dailyQuest && (
              <DailyQuestCard 
                quest={dailyQuest}
                stagedDaily={stagedDaily}
                activeRepInput={activeRepInput}
                toggleStagedDaily={toggleStagedDaily}
                setActiveRepInput={setActiveRepInput}
                addRepsToTask={addRepsToTask}
                confirmDailyTask={confirmDailyTask}
                completeQuest={completeQuest}
              />
            )}

            {!dailyQuest && !loading && (
                 <div className="p-8 border-2 border-dashed border-zinc-900 rounded-3xl text-center">
                    <p className="text-zinc-700 text-xs italic">All daily objectives complete. Return tomorrow at 00:00.</p>
                </div>
            )}

            {dailyQuest?.status === 'pending' && dailyQuest.type !== 'PENALTY' && (
                <button 
                    onClick={triggerPenalty}
                    className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-zinc-700 hover:text-red-900 transition-colors py-2"
                >
                    [ ABANDON MISSION ]
                </button>
            )}

            {/* 2. SIDE QUESTS SECTION */}
            <SideQuestList 
              sideQuests={sideQuests}
              stagedSides={stagedSides}
              toggleStagedSide={toggleStagedSide}
              confirmSideTask={confirmSideTask}
              completeQuest={completeQuest}
            />
        </div>

        {/* PENALTY OVERLAY */}
         <AnimatePresence>
            {showPenalty && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <div className="space-y-6 max-w-sm">
                        <Skull className="w-20 h-20 text-red-500 mx-auto animate-bounce" />
                        <h2 className="text-4xl font-black text-red-600 italic tracking-tighter uppercase italic">Penalty Triggered</h2>
                        <p className="text-red-200 text-sm italic font-medium">Mission failure detected. Survival quest initiated. You must complete these tasks or face rank decay.</p>
                        <HunterButton className="w-full h-14 bg-red-600 text-white" onClick={() => setShowPenalty(false)}>ACCEPT FATE</HunterButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* REWARD OVERLAY */}
        <AnimatePresence>
            {showReward?.active && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-6 max-w-sm">
                        <div className="relative">
                            <Trophy className="w-24 h-24 text-primary mx-auto" />
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full" />
                        </div>
                        <h2 className="text-4xl font-black text-primary italic tracking-tighter uppercase italic">Mission Success</h2>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-primary/20">
                             <p className="text-xs text-zinc-500 uppercase mb-2">Rewards Collected</p>
                             <div className="flex justify-center gap-4 text-primary font-black">
                                 <span>+{showReward.quest.xpReward} XP</span>
                                 {Object.entries(showReward.quest.statReward || {}).map(([key, val]) => (
                                     <span key={key} className="text-white">+{val} {key}</span>
                                 ))}
                             </div>
                        </div>
                        <HunterButton className="w-full h-14 bg-primary text-black" onClick={() => { setShowReward(null); if(showReward.quest.type === 'DAILY') router.replace('/'); }}>
                            STRENGTHENED
                        </HunterButton>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
