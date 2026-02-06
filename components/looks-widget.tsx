"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Droplets, Dumbbell, Utensils, Timer, X, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoutineItem {
    id: string;
    label: string;
    category: 'skincare' | 'food' | 'exercise' | 'habit';
    done: boolean;
    duration?: number; // Seconds
    details?: string;
}

export function LooksMaxxingWidget() {
    const [routine, setRoutine] = useState<RoutineItem[]>([
        { id: 'morning_water', label: 'Morning Hydration (500ml)', category: 'food', done: false },
        { id: 'face_wash', label: 'Cleanse & Moisturize', category: 'skincare', done: false },
        { id: 'sunscreen', label: 'Apply SPF 50+', category: 'skincare', done: false },
        { 
            id: 'posture', 
            label: 'Posture Check / Mewing', 
            category: 'habit', 
            done: false,
            duration: 60,
            details: "Close mouth. Place entire tongue flat against the roof of your mouth. Breathe through nose. Hold."
        },
        { id: 'diet_glow', label: 'Eat 1 "Glow" Food (Carrot/Salmon)', category: 'food', done: false },
        { 
            id: 'neck', 
            label: 'Neck/Jawline Training', 
            category: 'exercise', 
            done: false, 
            duration: 120, // 2 mins
            details: "Perform 3 sets of Neck Curls (front/back). Keep movements slow and controlled."
        },
    ]);

    const [activeItem, setActiveItem] = useState<RoutineItem | null>(null);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && isRunning) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    const handleItemClick = (item: RoutineItem) => {
        if (item.done) {
            // If already done, just toggle off without menu
            toggleItem(item.id, false);
            return;
        }

        if (item.category === 'food' || item.category === 'skincare') {
            toggleItem(item.id, true);
        } else {
            // Open Menu for Exercises/Habits
            setActiveItem(item);
            setTimer(item.duration || 60);
            setIsRunning(false);
        }
    };

    const toggleItem = (id: string, state: boolean) => {
        setRoutine(prev => prev.map(item => 
            item.id === id ? { ...item, done: state } : item
        ));
        if (activeItem?.id === id) setActiveItem(null);
    };

    const progress = Math.round((routine.filter(i => i.done).length / routine.length) * 100);

    return (
        <Card className="glass-card border-none bg-zinc-900/40 w-full mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <motion.div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>
            
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <Sparkles className="w-5 h-5 text-pink-400" />
                         <CardTitle className="text-lg text-white">Aesthetics Protocol</CardTitle>
                    </div>
                    <span className="text-xs text-pink-400 font-mono">{progress}% SYNC</span>
                </div>
                <CardDescription className="text-zinc-500">Daily routine for maximum visual appeal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 relative">
                {routine.map(item => (
                    <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer ${
                            item.done 
                                ? 'bg-pink-500/10 border-pink-500/30' 
                                : 'bg-black/20 border-white/5 hover:bg-white/5'
                        }`}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="flex items-center gap-3">
                            {item.category === 'skincare' && <Droplets className="w-4 h-4 text-blue-400" />}
                            {item.category === 'food' && <Utensils className="w-4 h-4 text-green-400" />}
                            {item.category === 'exercise' && <Dumbbell className="w-4 h-4 text-red-400" />}
                            {item.category === 'habit' && <Sparkles className="w-4 h-4 text-purple-400" />}
                            <span className={`text-sm ${item.done ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                                {item.label}
                            </span>
                        </div>
                        {item.done ? (
                            <Check className="w-4 h-4 text-pink-400" />
                        ) : (item.duration ? <Timer className="w-3 h-3 text-zinc-600" /> : null)}
                    </div>
                ))}

                {/* Timer/Detail Overlay */}
                <AnimatePresence>
                    {activeItem && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute inset-0 bg-black/95 z-10 flex flex-col items-center justify-center p-4 text-center rounded-lg"
                        >
                            <Button 
                                variant="ghost" size="icon" 
                                className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                                onClick={() => setActiveItem(null)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            
                            <h3 className="text-lg font-bold text-pink-400 mb-1">{activeItem.label}</h3>
                            <p className="text-xs text-zinc-400 mb-4 px-2">{activeItem.details}</p>
                            
                            <div className="text-5xl font-mono font-bold text-white mb-6 tabular-nums relative">
                                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                {isRunning && <span className="absolute -right-4 top-0 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span></span>}
                            </div>

                            <div className="flex gap-3 w-full">
                                <Button 
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                                    onClick={() => {
                                        setIsRunning(!isRunning);
                                        if (timer === 0) setTimer(activeItem.duration || 60);
                                    }}
                                >
                                    {isRunning ? "Pause" : (timer === 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />)}
                                </Button>
                                <Button 
                                    className="flex-1 bg-pink-600 hover:bg-pink-500"
                                    onClick={() => toggleItem(activeItem.id, true)}
                                >
                                    Finish
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
