"use client";

import { CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Quest } from "@/lib/storage";

interface DailyQuestCardProps {
  quest: Quest;
  stagedDaily: number[];
  activeRepInput: { index: number, value: string } | null;
  toggleStagedDaily: (index: number) => void;
  setActiveRepInput: (input: { index: number, value: string } | null) => void;
  addRepsToTask: (index: number) => void;
  confirmDailyTask: (index: number) => void;
  completeQuest: (quest: Quest) => void;
}

export function DailyQuestCard({
  quest,
  stagedDaily,
  activeRepInput,
  toggleStagedDaily,
  setActiveRepInput,
  addRepsToTask,
  confirmDailyTask,
  completeQuest
}: DailyQuestCardProps) {
  const isPenalty = quest.type === 'PENALTY';

  return (
    <HunterCard
      variant={isPenalty ? 'penalty' : 'system'}
      title={isPenalty ? "SURVIVAL QUEST" : "DAILY LEVELING"}
      description={isPenalty ? "Failure is not an option." : "Complete these to maintain your hunter rank."}
      headerAction={
        <div className={cn("px-3 py-1 rounded text-xs font-black", isPenalty ? "bg-red-600 text-white" : "bg-primary/20 text-primary border border-primary/30")}>
          {quest.difficulty}-RANK
        </div>
      }
    >
      <div className="space-y-3">
        {quest.tasks.map((task, idx) => {
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
                quest.status !== 'pending' && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex flex-1 items-center gap-3 cursor-pointer"
                  onClick={() => {
                    if (task.completed || quest.status !== 'pending') return;
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
                <HunterButton 
                  size="sm" 
                  className="w-full mt-3 h-8"
                  onClick={() => confirmDailyTask(idx)}
                >
                  DONE
                </HunterButton>
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
            {Object.entries(quest.statReward || {}).map(([key, val]) => (
              <span key={key} className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                {key} +{val}
              </span>
            ))}
          </div>
          {quest.status === 'pending' && (
            <HunterButton 
              size="sm"
              glow
              className={cn(
                "h-10 px-6",
                !quest.tasks.every(t => t.completed) && "bg-zinc-800 text-zinc-500 opacity-50"
              )}
              disabled={!quest.tasks.every(t => t.completed)}
              onClick={() => completeQuest(quest)}
            >
              COMPLETE
            </HunterButton>
          )}
          {quest.status === 'completed' && (
            <div className="flex items-center gap-2 text-green-500 text-xs font-bold italic">
              <CheckCircle2 className="w-4 h-4" /> SUCCESS
            </div>
          )}
        </div>
      </div>
    </HunterCard>
  );
}
