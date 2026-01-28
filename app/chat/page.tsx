"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gymAI } from "@/lib/ai";
import { Storage } from "@/lib/storage";

interface Message {
    role: 'user' | 'system';
    content: string;
}

const KNOWLEDGE_BASE = [
    { keywords: ['set', 'rep', 'volume', 'much'], text: "For hypertrophy, aim for 10-20 sets per muscle group per week. If you're S-Rank, you can push higher." },
    { keywords: ['sore', 'pain', 'hurt'], text: "If soreness is above 3/5, consider a deload day or active recovery. Do not push through sharp pain." },
    { keywords: ['stuck', 'plateau', 'stall'], text: "Stalled progress often means you need either a deload week or a change in stimulus. Try varying your rep ranges." },
    { keywords: ['cut', 'diet', 'food'], text: "To maintain muscle while cutting, keep protein high (2g/kg bodyweight) and maintain intensity, even if volume drops." },
];

export default function AICompanianPage() {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: "Greetings, Hunter. I am the System AI. I have analyzed your logs. How can I assist your ascension today?" }
    ]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const generateResponse = async (query: string) => {
        const lowerQuery = query.toLowerCase();
        
        // 1. Check Personal Model for Volume Predictions
        if (lowerQuery.includes('volume') || lowerQuery.includes('weight') || lowerQuery.includes('today')) {
             const logs = Storage.getLogs();
             if (logs.length > 0) {
                 const lastLog = logs[logs.length - 1];
                 const prediction = await gymAI.predictNextVolume({
                     currentVolume: lastLog.volume,
                     soreness: lastLog.soreness,
                     sleep: lastLog.sleep,
                     stress: lastLog.stress
                 });
                 
                 return `Based on your last session (Volume: ${lastLog.volume}kg) and recovery stats, I calculate your optimal volume for today is approximately ${Math.round(prediction)}kg. ${logs.length < 5 ? "(Note: My accuracy improves with more data.)" : ""}`;
             } else {
                 return "I need more log data to predict your optimal volume. Please complete your first quest.";
             }
        }

        // 2. Simple RAG (Rule Based)
        for (const rule of KNOWLEDGE_BASE) {
            if (rule.keywords.some(k => lowerQuery.includes(k))) {
                return rule.text;
            }
        }

        // 3. Fallback
        return "System logic indicates consistency is key. Keep logging your daily quests to unlock more insights.";
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        // Simulate thinking time + processing
        setTimeout(async () => {
            const response = await generateResponse(userMsg);
            setMessages(prev => [...prev, { role: 'system', content: response }]);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="flex items-center gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                     <h1 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        System UI
                    </h1>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest">AI Coach v1.0</p>
                </div>
            </header>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                 <div className="space-y-4 pb-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'system' && (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 border border-primary/50">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <Card className={`max-w-[80%] p-3 ${
                                msg.role === 'user' 
                                ? 'bg-primary text-white border-primary border-none' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                            }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </Card>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 border border-primary/50">
                                    <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex gap-1">
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    )}
                 </div>
            </ScrollArea>

            <div className="p-4 bg-black border-t border-zinc-800">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Ask the system..." 
                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary"
                    />
                    <Button type="submit" size="icon" className="bg-primary hover:bg-primary/80">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
