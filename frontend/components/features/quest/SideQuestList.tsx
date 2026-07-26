import React from "react";

import { Sparkles, CheckCircle2 } from "lucide-react";
import { HunterCard } from "@/components/shared/hunter-card";
import { HunterButton } from "@/components/shared/hunter-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Quest } from "@/lib/storage";

interface SideQuestListProps {
  sideQuests: Quest[];
  stagedSides: string[];
  toggleStagedSide: (id: string) => void;
  confirmSideTask: (id: string, index: number) => void;
  completeQuest: (quest: Quest) => void;
}

export function SideQuestList({
  sideQuests,
  stagedSides,
  toggleStagedSide,
  confirmSideTask,
  completeQuest
}: SideQuestListProps) {
  return (
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
              <div className="p-5">
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
                  <HunterButton 
                    size="sm"
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-500 text-white h-8"
                    onClick={() => confirmSideTask(sq.id, 0)}
                  >
                    DONE
                  </HunterButton>
                )}

                {sq.status === 'pending' && (
                  <HunterButton 
                    className={cn(
                      "w-full mt-4 h-8 text-[10px]",
                      sq.tasks.every(t => t.completed) 
                        ? "bg-amber-600 hover:bg-amber-500 text-white" 
                        : "bg-zinc-800 text-zinc-600 opacity-50"
                    )}
                    disabled={!sq.tasks.every(t => t.completed)}
                    onClick={() => completeQuest(sq)}
                  >
                    COLLECT REWARD
                  </HunterButton>
                )}

                {sq.status === 'completed' && (
                  <div className="mt-4 flex justify-center items-center gap-2 text-amber-500 text-[10px] font-black italic uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> Mission Accomplished
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

// Internal Card to avoid recursion or complex imports
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("rounded-3xl border", className)}>{children}</div>;
}
