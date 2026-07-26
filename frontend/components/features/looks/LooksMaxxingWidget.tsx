"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Droplets, Dumbbell, Utensils, Timer, X, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Storage } from "@/lib/storage";

interface RoutineItem {
    id: string;
    label: string;
    category: 'skincare' | 'food' | 'exercise' | 'habit';
    done: boolean;
    duration?: number; // Seconds
    details?: string;
    value?: number; // Current progress volume
    target?: number; // Target volume
    unit?: string;
}

const DEFAULT_ROUTINE: RoutineItem[] = [
    { id: 'hydration_3l', label: 'Hydration: 3L Water', category: 'food', done: false, value: 0, target: 3000, unit: 'ml' },
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
];

export function LooksMaxxingWidget() {
    const [routine, setRoutine] = useState<RoutineItem[]>(DEFAULT_ROUTINE);
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeItem, setActiveItem] = useState<RoutineItem | null>(null);
    const [confirmingItem, setConfirmingItem] = useState<RoutineItem | null>(null);
    const [waterItem, setWaterItem] = useState<RoutineItem | null>(null);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Get current 12h cycle key (e.g., "2024-05-20-AM" or "2024-05-20-PM")
    const getCycleKey = () => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const isPM = now.getHours() >= 12;
        return `${date}-${isPM ? 'PM' : 'AM'}`;
    };

    // Load Effect: Runs once on mount
    useEffect(() => {
        const cycle = getCycleKey();
        const saved = Storage.getAestheticProtocol();
        
        if (saved && saved.date === cycle) {
            setRoutine(prev => prev.map(item => {
                const savedItem = saved.items.find(i => i.id === item.id);
                if (savedItem) {
                    return { 
                        ...item, 
                        done: savedItem.done, 
                        value: savedItem.value ?? item.value 
                    };
                }
                return item;
            }));
        }
        setIsInitialized(true);
    }, []);

    // Helper to save explicitly
    const saveToStorage = (updatedRoutine: RoutineItem[]) => {
        const cycle = getCycleKey();
        const data = {
            date: cycle,
            items: updatedRoutine.map(i => ({ 
                id: i.id, 
                done: i.done, 
                value: i.value 
            }))
        };
        Storage.saveAestheticProtocol(data);
    };

    // Auto-save effect for general changes
    useEffect(() => {
        if (!isInitialized) return;
        saveToStorage(routine);
    }, [routine, isInitialized]);

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
        if (item.done && item.id !== 'hydration_3l') return;

        if (item.id === 'hydration_3l') {
            setWaterItem(item);
        } else if (item.category === 'food' || item.category === 'skincare') {
            setConfirmingItem(item);
        } else {
            setActiveItem(item);
            setTimer(item.duration || 60);
            setIsRunning(false);
        }
    };

    const updateItem = (id: string, updates: Partial<RoutineItem>) => {
        setRoutine(prev => {
            const next = prev.map(item => 
                item.id === id ? { ...item, ...updates } : item
            );
            return next;
        });
    };

    const logWater = (amount: number) => {
        if (!waterItem) return;
        const newValue = (waterItem.value || 0) + amount;
        const isDone = newValue >= (waterItem.target || 3000);
        
        updateItem(waterItem.id, { 
            value: newValue, 
            done: isDone 
        });
        
        setWaterItem(prev => prev ? { ...prev, value: newValue, done: isDone } : null);
    };

    const lockItem = (id: string) => {
        updateItem(id, { done: true });
        setActiveItem(null);
        setConfirmingItem(null);
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
                <CardDescription className="text-zinc-500">Hunter routine: 12h Cycle (AM/PM Sync)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 relative">
                {routine.map(item => (
                    <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            item.done && item.id !== 'hydration_3l'
                                ? 'bg-pink-500/10 border-pink-500/20 opacity-70 cursor-default' 
                                : 'bg-black/30 border-white/5 hover:border-white/10 cursor-pointer active:scale-[0.98]'
                        }`}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                                {item.category === 'skincare' && <Droplets className="w-4 h-4 text-blue-400" />}
                                {item.category === 'food' && <Utensils className="w-4 h-4 text-green-400" />}
                                {item.category === 'exercise' && <Dumbbell className="w-4 h-4 text-red-400" />}
                                {item.category === 'habit' && <Sparkles className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                    {item.label}
                                </span>
                                {item.id === 'hydration_3l' && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-500" 
                                                style={{ width: `${Math.min(100, ((item.value || 0) / (item.target || 3000)) * 100)}%` }} 
                                            />
                                        </div>
                                        <span className="text-[9px] font-mono text-zinc-500">{(item.value || 0) / 1000}L / 3L</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.done ? (
                            <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-black" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center">
                                {item.duration && <Timer className="w-3 h-3 text-zinc-600" />}
                            </div>
                        )}
                    </div>
                ))}

                {/* Water Logger Overlay */}
                <AnimatePresence>
                    {waterItem && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 z-30 flex flex-col items-center justify-center p-6 rounded-xl"
                        >
                            <Droplets className="w-12 h-12 text-blue-400 mb-4 animate-bounce" />
                            <h3 className="text-xl font-black italic text-white mb-1 uppercase tracking-tighter">Hydration Input</h3>
                            <p className="text-xs text-zinc-500 mb-6 font-mono">Current: {waterItem.value}ml / 3000ml</p>
                            
                            <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-8">
                                <Button 
                                    className="bg-zinc-900 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 font-bold"
                                    onClick={() => logWater(250)}
                                >
                                    +250ml
                                </Button>
                                <Button 
                                    className="bg-zinc-900 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 font-bold"
                                    onClick={() => logWater(500)}
                                >
                                    +500ml
                                </Button>
                            </div>

                            <Button 
                                variant="ghost" 
                                className="text-zinc-500 hover:text-white uppercase font-black italic tracking-widest text-[10px]"
                                onClick={() => setWaterItem(null)}
                            >
                                [ Return to Hub ]
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Confirm Overlay (Small) */}
                <AnimatePresence>
                    {confirmingItem && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-4 rounded-lg"
                        >
                            <h3 className="text-sm font-bold text-white mb-4">Log {confirmingItem.label}?</h3>
                            <div className="flex gap-2 w-full max-w-[200px]">
                                <Button size="sm" variant="ghost" className="flex-1 text-zinc-500" onClick={() => setConfirmingItem(null)}>Cancel</Button>
                                <Button size="sm" className="flex-1 bg-pink-600 hover:bg-pink-500" onClick={() => lockItem(confirmingItem.id)}>Lock</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    onClick={() => lockItem(activeItem.id)}
                                >
                                    Confirm & Lock
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}


